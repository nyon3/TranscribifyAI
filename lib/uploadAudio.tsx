'use server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { r2 } from '@/lib/awsConfig';
import { Upload } from "@aws-sdk/lib-storage";
import { transcribeAudio } from "./transcribe";

// TODO: Implement over-write function if the file already exists in the database
async function createFileRecord(file: File, userId: string) {
    try {
        const fileUrl = `https://pub-c74350ef918c457cb4b75ea0ec66f266.r2.dev/${file.name}`;

        // Check if a file with the same name already exists
        const existingFile = await prisma.file.findFirst({
            where: {
                name: file.name,
                userId: userId,
            }
        });

        let createdFile;

        if (existingFile) {
            // If the file already exists, update the existing record
            createdFile = await prisma.file.update({
                where: {
                    id: existingFile.id,
                },
                data: {
                    url: fileUrl, // Update the URL in case the file content has changed
                },
            });
            console.log('File record successfully updated with ID:', createdFile.id);
        } else {
            // If the file doesn't exist, create a new record
            createdFile = await prisma.file.create({
                data: {
                    name: file.name,
                    url: fileUrl,
                    userId: userId,
                }
            });
            console.log('File record successfully created with ID:', createdFile.id);
        }

        return createdFile;
    } catch (error) {
        console.error('Error creating or updating file record:', error);
        throw error; // re-throw the error so it can be caught and handled by the calling function
    }
}

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
        // Check if the necessary environment variables are set
        if (!process.env.R2_BUCKET_NAME) {
            throw new Error('R2_BUCKET_NAME environment variable is not set.');
        }

        // Check if the file name is defined
        if (!file.name) {
            throw new Error('File name is not defined.');
        }

        // Check if the file itself is defined
        if (!file) {
            throw new Error('File is not defined.');
        }

        const params = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: file.name,
            Body: file,
        }

        const upload = new Upload({
            client: r2,
            params,
        });

        await upload.done();
        console.log("Successfully uploaded file to S3");

        const createdFile = await createFileRecord(file, userId);
        transcribeAudio(createdFile, false);
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};
