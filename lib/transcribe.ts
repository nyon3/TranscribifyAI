'use server'
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { dataProps, dataPropsForComponent } from '@/lib/db';

async function updateTranscription(url: string, transcribedText: string) {
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



export const transcribeAudio = async (data: dataProps | dataPropsForComponent, isTimestamped: boolean) => {
    const url = data.url;
    if (!url) {
        throw new Error('Missing URL');
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch the audio file from the URL: ${url}`);
    }

    const audioData = await response.blob();
    if (!audioData) {
        throw new Error('Failed to get the audio data from the response');
    }

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
        apiEndpoint = "https://api-inference.huggingface.co/models/distil-whisper/distil-large-v2"
        headers = {
            'Authorization': `Bearer ${process.env.HF_ACCESS_TOKEN}`,

        };
    }

    // console.log("Sending request to:", apiEndpoint);
    // console.log("FormData Contents:", formData);

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
                try {
                    await updateTranscription(url, transcribedText);
                    revalidatePath('/dashboard');
                    return {
                        success: true,
                        message: 'Transcription completed and database updated successfully.',
                    };
                } catch (error) {
                    console.error(error);
                    return {
                        success: false,
                        message: 'Something went wrong',
                    };
                }
                break;

            } else if (output.status === 502) {
                console.log("Bad Gateway. Retrying...");
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds before retrying
            }
            else if (output.status === 503) {
                console.log("Service Unavailable. Retrying...");
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds before retrying
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
            console.error('Error during fetch:', error);

            // Increment the retry count and continue with the next iteration of the loop
            retryCount++;

            // If we've reached the max number of retries, re-throw the error
            if (retryCount >= maxRetries) {
                throw error;
            }
        }
    }
    return {
        success: false,
        message: 'Something went wrong',
    };
}
