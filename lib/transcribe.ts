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
export async function updateTranscribedFile(url: string, transcribedText: string) {
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
        try {
            // Attempt to update the database
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
                // await transPrisma.file.update({
                //     where: { id: fileRecord.id },
                //     data: { isTranscribed: true },
                // });
            });

            // If the update was successful, return immediately
            return;
        } catch (error) {
            // If an error occurred, log it
            console.error(`Attempt ${i + 1} to update the database failed with error: ${error}`);

            // If this was the last attempt, rethrow the error
            if (i === maxRetries - 1) {
                throw error;
            }

            // Wait for a short delay before the next attempt
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

}

// TODO: add dynamic retry logic based on server status code.
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
        apiEndpoint = "https://api-inference.huggingface.co/models/distil-whisper/distil-large-v2";
        headers = {
            'Authorization': `Bearer ${process.env.HF_INFERENCE_API}`,
            "Content-Type": "audio/flac",
        };
    }
    const maxRetries = 5;
    let retryCount = 0;
    let waitTime: number; // Explicitly declare waitTime as a number

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
            } else {
                console.error(`Error with status code ${output.status}:`, await output.text());
            }
        } catch (error) {
            console.error('Error during fetch:', error);
        }

        // Increment retryCount and wait regardless of whether there was an error or the status was not 200
        retryCount++;
        if (retryCount === 1) {
            waitTime = 30000; // Longer wait for the first retry
        } else {
            waitTime = 5000 * Math.pow(1.5, retryCount - 1); // Shorter, gradually increasing intervals for subsequent retries
        }
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    throw new Error('Max retries exceeded');
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

        // const fileRecord = await fetchFileRecord(url);
        // if (!fileRecord) {
        //     throw new Error('File record not found');
        // }
        return transcribedText;
        // await updateTranscribedFile(url, transcribedText);
    } catch (error) {
        console.error('Error in transcribeAudio:', error);
        throw error;
    }
}