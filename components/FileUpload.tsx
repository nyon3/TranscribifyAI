import prisma from "@/lib/prisma";
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from "next/cache";
import { SubmitButton } from "./submitButton";

// Define an interface for expected file structure
// interface UploadedFile extends File {
//     type: string;
//     size: number;
//   }

// Helper function to check if the user ID is valid
// const isValidUserId = (userId) => {
//     return userId != null;
//   };
  
//   // Helper function to check if the file exists in the form data
//   const fileExists = (file) => {
//     return file != null;
//   };
  
//   // Helper function to validate the file type
//   const isValidFileType = (file) => {
//     // Here you can list all the MIME types you want to allow
//     const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/*'];
//     return allowedMimeTypes.some(type => file.type === type || file.type.startsWith(type));
//   };
  
//   // Helper function to validate the file size (e.g., less than 10MB)
//   const isValidFileSize = (file:UploadedFile) => {
//     const maxSize = 10 * 1024 * 1024; // 10MB in bytes
//     return file.size <= maxSize;
//   };

    // Upload file to database using Prisma and Next.js server actions
    const addAudioFile = async(data:FormData) => {
        'use server';
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
          
        if (file.size > 10 * 1024 * 1024) {
                console.error('The uploaded file is too large.');
                return;
            }
        try {
            const result = await put(file.name, file, { access: 'public' });
    
            // Ensure that the result from 'put' is as expected
            if (!result.url) {
                throw new Error('File upload failed, no URL returned');
            }
    
            await prisma.file.create({
                data: {
                    name: file.name,
                    url: result.url,
                    userId: userId, // Make sure this is not undefined
                }
            });
        } catch (error) {
            console.error(error);
            // Handle your error here
        }
        revalidatePath('/');
    };
    

export const FileUpload = async () => {
   
    return (
        <div>
           <form action={addAudioFile}>
            <input type="file" name="file" accept="audio/*" />
             <SubmitButton />
            </form>
        </div>
    )   
}