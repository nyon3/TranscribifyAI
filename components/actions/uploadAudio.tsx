'use server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { r2 } from '@/lib/awsConfig';
import { Upload } from "@aws-sdk/lib-storage";
import { transcribeAudio } from "./transcribe";
import { revalidatePath } from 'next/cache';
import { updateTranscribedFile } from "./transcribe";

// Function to create a file record
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

        if (existingFile) {
            // If the file already exists, update the existing record
            const updatedFile = await prisma.file.update({
                where: {
                    id: existingFile.id,
                },
                data: {
                    url: fileUrl, // Update the URL in case the file content has changed
                },
            });
            return updatedFile;
        } else {
            // If the file does not exist, create a new record
            const createdFile = await prisma.file.create({
                data: {
                    name: file.name,
                    url: fileUrl,
                    userId: userId,
                },
            });
            return createdFile;
        }
    } catch (error) {
        console.error('Error creating or updating file record:', error);
        throw error;
    }
}

// Function to validate the audio file
function validateAudioFile(file: File) {
    // Check if the file object is defined and has a type property
    if (!file || !file.type) {
        throw new Error('Invalid file. Please upload a valid audio file.');
    }

    // Check the file type
    const fileType = file.type;
    if (!fileType.startsWith('audio/')) {
        throw new Error('Invalid file type. Please upload an audio file.');
    }

    // Check the file size
    const fileSize = file.size;
    if (fileSize > 10000000) { // 10MB
        throw new Error('File is too large. Please upload a file smaller than 10MB.');
    }

    // Check for zero size file
    if (fileSize === 0) {
        throw new Error('File is empty. Please upload a non-empty file.');
    }
}

// Function to upload the audio file
async function sendAudioToServer(file: File) {
    const params = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: file.name,
        Body: file,
    };

    const upload = new Upload({
        client: r2,
        params,
    });
    await upload.done();
}

// Main function to validate and upload the audio file
export const processAndUploadAudio = async (data: FormData) => {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const file = data.get('file') as File;
    const apiRequestCount = (session?.user as any).apiRequestCount;
    const isAdmin = (session?.user as any).isAdmin;

    console.log('api request count', apiRequestCount);

    // Check if the userId exists
    if (!userId) {
        throw new Error('No user id found in session');
    }

    // Check API request count if user is not an admin
    if (!isAdmin && apiRequestCount > 3) {
        throw new Error('API request limit exceeded');
    }

    // Increment API request count
    await prisma.user.update({
        where: { id: userId },
        data: { apiRequestCount: { increment: 1 } },
    });

    // Check if the file object is definedd
    if (!file) {
        throw new Error('No file found in form data.');
    }

    validateAudioFile(file);
    await sendAudioToServer(file);
    const createdFile = await createFileRecord(file, userId);
    // Timestamp function is false by default for demo purposes.
    const transcribedText = await transcribeAudio(createdFile, true);
    // FIXME: updateTranscribedFile: second argument should be a fetched data. expect that is working as I planned.
    await updateTranscribedFile(createdFile.url, transcribedText);
    revalidatePath('/');
}
