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
        apiEndpoint = "https://n8r9bwi0f4azrcs5.us-east-1.aws.endpoints.huggingface.cloud";
        headers = {
            'Authorization': `Bearer ${process.env.HF_INFERENCE_API}`,
            "Content-Type": "audio/flac",
        };
    }

    // console.log("Sending request to:", apiEndpoint);
    // console.log("FormData Contents:", formData);

    const output = await fetch(apiEndpoint, {
        method: 'POST',
        headers: headers,
        body: formData
    });

    // Process the response from the API
    // TODO: Think about how to handle cold starts
    if (output.ok) {
        const transcribedText = isTimestamped ? await output.text() : (await output.json()).text;
        console.log("Transcribed Text:", transcribedText);
        try {
            await updateTranscription(url, transcribedText);
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
        console.error("Error from API:", await output.text());
        return {
            success: false,
            message: 'Failed to transcribe audio file',
        };
    }
}
