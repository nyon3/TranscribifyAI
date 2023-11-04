import { HfInference } from '@huggingface/inference';
import prisma from '@/lib/prisma';

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

export const transcribeFile = async(data:FormData) => {
        'use server'
     const url = data.get('url') as string;
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
        model: 'facebook/wav2vec2-large-960h-lv60-self',
    });

     // Assuming that transcriptionResult.text contains the transcribed text as a string
     const transcribedText = transcriptionResult.text;
     
     const fileRecord = await prisma.file.findFirst({
        where: { url: url },
    });
     

    // Make sure you have a valid fileId from the fileRecord before proceeding
if (!fileRecord) {
    throw new Error('File record not found');
}
   
    const fileId = fileRecord?.id;
   
    const transcribedFileRecord = await prisma.transcribedFile.findFirst({
        where: { fileId: fileId },
    });
    
    if (transcribedFileRecord) {
        // Update the existing record
        await prisma.transcribedFile.update({
            where: {id: transcribedFileRecord.id },
            data: { text: transcribedText },
        });
    } else {
        // Create a new record
        await prisma.transcribedFile.create({
            data: {
                text: transcribedText,
                fileId: fileId,
            },
        });
    }
        return {
            success: true,
            message: 'Transcription completed and database updated successfully.',
        };    
    }

