'use server'
import { HfInference } from '@huggingface/inference';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { dataProps, dataPropsForComponent } from '@/lib/db';

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);
// If you want to use HF Inference endpoint, use the following instead:
// const hf = new HfInference(process.env.HF_INFERENCE_API);

export const transcribeFile = async (data: dataProps | dataPropsForComponent) => {

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

    const transcriptionResult = await hf.automaticSpeechRecognition({
        data: audioData,
        model: 'distil-whisper/distil-medium.en',
    });
    // Use this instead if you want to use HF Inference endpoint:
    // const result = hf.endpoint("https://n8r9bwi0f4azrcs5.us-east-1.aws.endpoints.huggingface.cloud")
    // const output = await result.automaticSpeechRecognition({ data: audioData })

    // Assuming that transcriptionResult.text contains the transcribed text as a string
    const transcribedText = transcriptionResult.text;

    const fileRecord = await prisma.file.findFirst({
        where: { url: url },
    });

    console.log(fileRecord)
    // Make sure you have a valid fileId from the fileRecord before proceeding
    if (!fileRecord) {
        throw new Error('File record not found');
    }

    const fileId = fileRecord?.id;

    const transcribedFileRecord = await prisma.transcribedFile.findFirst({
        where: { fileId: fileId },
    });

    // ... [rest of your code before this point]

    try {
        const fileId = fileRecord.id; // fileId should be non-nullable here

        let transcribedFileOperation;

        if (transcribedFileRecord) {
            // If the record exists, prepare an update operation, do not await here
            transcribedFileOperation = prisma.transcribedFile.update({
                where: { id: transcribedFileRecord.id },
                data: { text: transcribedText },
            });
        } else {
            // If the record doesn't exist, prepare a create operation, do not await here
            transcribedFileOperation = prisma.transcribedFile.create({
                data: {
                    text: transcribedText,
                    fileId: fileId, // Assuming this is a correct and non-nullable ID
                },
            });
        }

        // Prepare the file update operation, do not await here
        const fileUpdateOperation = prisma.file.update({
            where: { id: fileId },
            data: { isTranscribed: true }, // Set the boolean field to true
        });

        // Execute both operations in a transaction
        await prisma.$transaction([transcribedFileOperation, fileUpdateOperation]);
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
}
