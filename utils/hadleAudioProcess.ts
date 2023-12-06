import { validateAndUploadAudioFile } from '@/lib/uploadAudio';
import { transcribeAudio } from '@/lib/transcribe';

// Define the types
type FileResponse = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    url: string;
    userId: string;
    isTranscribed: boolean;
};

type ErrorResponse = {
    success: boolean;
    message: string;
};

export const handleAudioProcess = async (data: FormData, isTimestamped: boolean) => {
    // Add file and get the created file object or error response
    const response: FileResponse | ErrorResponse | undefined = await validateAndUploadAudioFile(data);

    // Check if the response is an error
    if (!response || ('success' in response && !response.success)) {
        const errorMessage = (response as ErrorResponse)?.message || "Failed to upload file.";
        throw new Error(errorMessage);
    }

    // Now response is treated as FileResponse
    const fileResponse = response as FileResponse;
    await transcribeAudio(fileResponse, isTimestamped);

    // Return a success result
    return { success: true, uploadedFile: fileResponse };
};
