'use server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { r2 } from '@/lib/awsConfig';
import { Upload } from "@aws-sdk/lib-storage";
import { transcribeAudio } from "./transcribe";
import { revalidatePath } from 'next/cache';

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

    // Check if the userId exists
    if (!userId) {
        throw new Error('No user id found in session');
    }

    const file = data.get('file') as File;

    // Check if the file object is defined
    if (!file) {
        throw new Error('No file found in form data.');
    }

    validateAudioFile(file);
    await sendAudioToServer(file);
    const createdFile = await createFileRecord(file, userId);
    // Timestamp function is false by default for demo purposes.
    transcribeAudio(createdFile, false);
    revalidatePath('/');
}


// export const validateAndUploadAudioFile = async (data: FormData) => {

//     const session = await getServerSession(authOptions);
//     const userId = (session?.user as any)?.id;

//     // Check if the userId exists
//     if (!userId) {
//         console.error('No user id found in session');
//         return;
//     }

//     const file = data.get('file') as File;
//     if (!file || file.size === 0) {
//         console.error('No file found in form data');
//         return;
//     }
//     if (!file.type.startsWith('audio/')) {
//         console.error('The uploaded file is not an audio file.');
//         return;
//     }

//     /**
//      * Defines the allowed file sizes in bytes.
//      * 
//      * Sizes:
//      * - small: 1 MB
//      * - medium: 5 MB
//      * - large: 10 MB
//      * - extraLarge: 20 MB
//      */
//     const allowedFileSizes = {
//         "small": 1 * 1024 * 1024,
//         "medium": 5 * 1024 * 1024,
//         "large": 10 * 1024 * 1024,
//         "extraLarge": 20 * 1024 * 1024,
//     }

//     if (file.size > allowedFileSizes.large) {
//         console.error('The uploaded file is too large.');
//         return { success: false, message: 'File size exceeds the allowed limit.' };
//     }
//     try {
//         // Check if the necessary environment variables are set
//         if (!process.env.R2_BUCKET_NAME) {
//             throw new Error('R2_BUCKET_NAME environment variable is not set.');
//         }

//         // Check if the file name is defined
//         if (!file.name) {
//             throw new Error('File name is not defined.');
//         }

//         // Check if the file itself is defined
//         if (!file) {
//             throw new Error('File is not defined.');
//         }

//         const params = {
//             Bucket: process.env.R2_BUCKET_NAME,
//             Key: file.name,
//             Body: file,
//         }

//         const upload = new Upload({
//             client: r2,
//             params,
//         });

//         // TODO: add loading functionality, check the sample code from the AWS documentation https://www.npmjs.com/package/@aws-sdk/lib-storage

//         await upload.done();
//         console.log("Successfully uploaded file to S3");
//         const createdFile = await createFileRecord(file, userId);
//         // Timestamp function is false by default for demo purposes.
//         transcribeAudio(createdFile, false);
//         revalidatePath('/');
//     } catch (error) {
//         console.error('Error uploading file:', error);
//         throw error;
//     }
// };
