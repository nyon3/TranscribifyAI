import prisma from "@/lib/prisma";
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from "next/cache";
import { SubmitButton } from "./submitButton";

    // Upload file to database using Prisma and Next.js server actions
    const addAudioFile = async(data:FormData) => {
        'use server';
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;
    
        // Check if the userId exists
        if (!userId) {
            console.error('No user id found in session');
            // Handle the error, maybe return a response indicating the failure
            return;
        }
    
        const file = data.get('file') as File;
    
        // Ensure that the file exists
        if (!file) {
            console.error('No file found in form data');
            // Handle the error here as well
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
             <SubmitButton/>
            </form>
        </div>
    )   
}