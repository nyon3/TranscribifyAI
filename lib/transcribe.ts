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
async function updateTranscribedFile(fileId: number, transcribedText: string) {
    return await prisma.$transaction(async (prisma) => {
        const transcribedFile = await prisma.transcribedFile.findFirst({ where: { fileId: fileId } });

        if (transcribedFile) {
            return await prisma.transcribedFile.update({
                where: { id: transcribedFile.id },
                data: { text: transcribedText },
            });
        } else {
            return await prisma.transcribedFile.create({
                data: {
                    text: transcribedText,
                    fileId: fileId,
                },
            });
        }
    });
}

// Function to fetch audio data from a URL
async function fetchAudioData(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch the audio file from the URL: ${url}`);
    }

    const audioData = await response.blob();
    if (!audioData) {
        throw new Error('Failed to get the audio data from the response');
    }

    return audioData;
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
                console.log("Transcribed Text:", transcribedText);
                return transcribedText;
                // TODO: Add your logic for updating the database with the transcribed text

                break;

            } else if (output.status === 502) {
                console.log("Bad Gateway. Retrying...");
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds before retrying
            }
            else if (output.status === 503) {
                console.log("Service Unavailable. Retrying...");
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds before retrying
            } else if (output.status === 400 || output.status === 404) {
                console.log("Client error:", await output.text());
                break;
            } else if (output.status === 500) {
                console.log("Server error:", await output.text());
                break;
            } else {
                console.log("Unexpected error:", await output.text());
                break;
            }
        } catch (error) {
            console.error('Error during transcription:', error);
            throw error; // Re-throw the error so it can be handled by the caller
        }
    }
}

// Main function to transcribe audio
export const transcribeAudio = async (data: dataProps | dataPropsForComponent, isTimestamped: boolean) => {
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

    await updateTranscribedFile(fileRecord.id, transcribedText);
}