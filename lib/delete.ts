'use server'
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { dataProps, dataPropsForComponent } from '@/lib/db';


export const deleteFile = async (data: dataProps | dataPropsForComponent) => {

    const url = data.url;
    try {
        const file = await prisma.file.findFirst({
            where: {
                url: url
            },
            include: {
                transcribedFiles: true // Include related transcribedFiles in the result
            }
        });
        if (file) {
            // Begin a transaction to ensure both deletions succeed or fail together
            await prisma.$transaction(async (prisma) => {
                // If there are related transcribedFiles, delete them first
                if (file.transcribedFiles && file.transcribedFiles.length > 0) {
                    await prisma.transcribedFile.deleteMany({
                        where: {
                            fileId: file.id
                        }
                    });
                }
                // Now delete the file
                await prisma.file.delete({
                    where: {
                        id: file.id
                    }
                });
            });
            console.log('File and related transcribed files deleted successfully.');
        } else {
            console.log('File not found');
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
    revalidatePath('/');
};
