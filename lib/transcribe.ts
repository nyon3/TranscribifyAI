'use server'
import prisma from '@/lib/prisma';
import { File } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { dataProps, dataPropsForComponent } from '@/lib/db';

// Function to fetch the file record
async function fetchFileRecord(url: string): Promise<File | null> {
    try {
        const fileRecord = await prisma.file.findFirst({
            where: { url: url },
        });
        return fileRecord;
    } catch (error) {
        console.error('Error fetching file record:', error);
        throw error;
    }
}

// Function to update the transcribed file
async function updateTranscribedFile(url: string, transcribedText: string) {
    const fileRecord = await prisma.file.findFirst({
        where: { url: url },
    });
    if (!fileRecord) {
        throw new Error('File record not found');
    }
    await prisma.$transaction(async (transPrisma) => {
        const transcribedFile = await transPrisma.transcribedFile.findFirst({ where: { fileId: fileRecord.id } });
        if (transcribedFile) {
            await transPrisma.transcribedFile.update({
                where: { id: transcribedFile.id },
                data: { text: transcribedText },
            });
        } else {
            await transPrisma.transcribedFile.create({
                data: {
                    text: transcribedText,
                    fileId: fileRecord.id,
                },
            });
        }
        await transPrisma.file.update({
            where: { id: fileRecord.id },
            data: { isTranscribed: true },
        });
    });
    return fileRecord.id; // Optionally we can return the fileId for further use
}

// Function to fetch audio data from a URL
async function fetchAudioData(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch the audio file from the URL: ${url}`);
        }
        return await response.blob();
    } catch (error) {
        console.error('Error fetching audio data:', error);
        throw error;
    }
}

// Function to transcribe audio data
async function transcribeAudioData(audioData: Blob, isTimestamped: boolean) {
    const formData = new FormData();
    formData.append('file', audioData, 'audio');

    let apiEndpoint, headers;

    if (isTimestamped) {
        apiEndpoint = "https://api.openai.com/v1/audio/transcriptions";
        formData.append("model", "whisper-1");
        formData.append("response_format", "srt");
        headers = {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        };
    } else {
        apiEndpoint = "https://n8r9bwi0f4azrcs5.us-east-1.aws.endpoints.huggingface.cloud"
        headers = {
            'Authorization': `Bearer ${process.env.HF_INFERENCE_API}`,
            "Content-Type": "audio/flac",
        };
    }

    // TODO: Add a loading indicator
    const maxRetries = 5;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            const output = await fetch(apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (output.status === 200) {
                const transcribedText = isTimestamped ? await output.text() : (await output.json()).text;
                return transcribedText;
            } else {
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, retryCount * 5000)); // Exponential backoff
            }
        } catch (error) {
            console.error('Error during transcription:', error);
            if (++retryCount >= maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, retryCount * 5000)); // Exponential backoff
        }
    }

    throw new Error('Transcription failed after maximum retries');
}

// Main function to transcribe audio
export const transcribeAudio = async (data: dataProps | dataPropsForComponent, isTimestamped: boolean) => {
    try {
        const url = data.url;
        if (!url) {
            throw new Error('Missing URL');
        }

        const audioData = await fetchAudioData(url);
        const transcribedText = await transcribeAudioData(audioData, isTimestamped);

        const fileRecord = await fetchFileRecord(url);
        if (!fileRecord) {
            throw new Error('File record not found');
        }

        await updateTranscribedFile(url, transcribedText);
    } catch (error) {
        console.error('Error in transcribeAudio:', error);
        throw error;
    }
}