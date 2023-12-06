'use server';
import prisma from "@/lib/prisma";
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const validateAndUploadAudioFile = async (data: FormData) => {

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    // Check if the userId exists
    if (!userId) {
        console.error('No user id found in session');
        return;
    }

    const file = data.get('file') as File;
    if (!file || file.size === 0) {
        console.error('No file found in form data');
        return;
    }
    if (!file.type.startsWith('audio/')) {
        console.error('The uploaded file is not an audio file.');
        return;
    }

    /**
     * Defines the allowed file sizes in bytes.
     * 
     * Sizes:
     * - small: 1 MB
     * - medium: 5 MB
     * - large: 10 MB
     * - extraLarge: 20 MB
     */
    const allowedFileSizes = {
        "small": 1 * 1024 * 1024,
        "medium": 5 * 1024 * 1024,
        "large": 10 * 1024 * 1024,
        "extraLarge": 20 * 1024 * 1024,
    }

    if (file.size > allowedFileSizes.large) {
        console.error('The uploaded file is too large.');
       return { success: false, message: 'File size exceeds the allowed limit.' };
    }
    try {
        const result = await put(file.name, file, { access: 'public' });

        // Ensure that the result from 'put' is as expected
        if (!result.url) {
            throw new Error('File upload failed, no URL returned');
        }

        const createdFile = await prisma.file.create({
            data: {
                name: file.name,
                url: result.url,
                userId: userId,
            }
        });
        return createdFile; // Return the created file object
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error to be handled by the caller
    }
};
