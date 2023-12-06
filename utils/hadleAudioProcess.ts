import { validateAndUploadAudioFile } from '@/lib/uploadAudio';
import { transcribeAudio } from '@/lib/transcribe';

export const handleAudioProcess = async (data: FormData, isTimestamped: boolean) => {
    // Add file and get the created file object
    const uploadedFile = await validateAndUploadAudioFile(data);
    if (!uploadedFile) {
        throw new Error("Failed to upload file.");
    }

    // Transcribe file using the URL from the uploaded file
    await transcribeAudio(uploadedFile, isTimestamped);

    // Return some result or confirmation if needed
    return { success: true, uploadedFile };
};