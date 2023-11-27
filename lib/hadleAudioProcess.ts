// lib/handleAudioProcesss.tsx
import { addAudioFile } from '@/lib/FileUpload';
import { transcribeAudio } from './transcribeWithTime';

export const handleAudioProcess = async (data: FormData, isTimestamped: boolean) => {
    try {
        // Add file and get the created file object
        const uploadedFile = await addAudioFile(data);

        if (!uploadedFile) {
            throw new Error("Failed to upload file.");
        }

        // Transcribe file using the URL from the uploaded file
        await transcribeAudio(uploadedFile, isTimestamped);

        // Process successful, handle accordingly
    } catch (error) {
        console.error('Error in processing audio:', error);
        // Handle error
    }
};
