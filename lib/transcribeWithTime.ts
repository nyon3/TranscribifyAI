'use server'
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { dataProps, dataPropsForComponent } from '@/lib/db';

async function processTranscription(url: string, transcribedText: string) {
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

// TODO: Can't add timestamp to the text, I assume it need to modify with pipline API, but I don't know how to do it.
export const transcribeWithHF = async (data: dataProps | dataPropsForComponent) => {
    const url = data.url;
    if (!url) {
        throw new Error('Missing URL');
    }

    // Fetch the audio file from the URL
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch the audio file from the URL: ${url}`);
    }

    // Convert the response into a Blob or ArrayBuffer
    const audioData = await response.blob(); // or use response.arrayBuffer() if needed

    // Prepare the FormData for the API request
    const formData = new FormData();
    formData.append('file', audioData, 'audio');

    // Define the Huggingface Inference API endpoint
    const huggingfaceEndPoint = "https://n8r9bwi0f4azrcs5.us-east-1.aws.endpoints.huggingface.cloud";

    // Make the API request to Huggingface
    const output = await fetch(huggingfaceEndPoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.HF_INFERENCE_API}`,
            "Content-Type": "audio/mpeg"
        },
        body: formData
    });

    // Process the response from Huggingface API
    if (output.ok) {

        // Assuming response is JSON
        const jsonResponse = await output.json();
        const transcribedText = jsonResponse.text;


        try {
            await processTranscription(url, transcribedText);
            revalidatePath('/');
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
    } else {
        // Handle error response
        console.error("Error from Huggingface API:", await output.text());
    }
}



export const transcribeWithTime = async (data: dataProps | dataPropsForComponent) => {

    const url = data.url;
    if (!url) {
        throw new Error('Missing URL');
    }

    // Fetch the audio file from the URL
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch the audio file from the URL: ${url}`);
    }

    // Convert the response into a Blob or ArrayBuffer
    const audioData = await response.blob(); // or use response.arrayBuffer() if needed

    const formData = new FormData();
    formData.append('file', audioData, 'audio.mp3');
    formData.append("model", "whisper-1");
    formData.append("response_format", "srt");

    const endPoint = "https://api.openai.com/v1/audio/transcriptions"

    const output = await fetch(endPoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData
    },
    )
    if (output.ok) {
        const transcribedText = await output.text();
        console.log(transcribedText);
        try {
            await processTranscription(url, transcribedText);
            revalidatePath('/');
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
        };
    } else {
        console.error("Error from OpenAI API:", await output.text());
    }
}
