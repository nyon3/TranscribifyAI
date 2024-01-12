'use server'
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { dataProps, dataPropsForComponent } from '@/lib/db';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/awsConfig";

export const deleteObjectFromR2 = async (fileName: string) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
    });

    try {
        const response = await r2.send(command);
        console.log(response);
    } catch (err) {
        console.error(err);
    }
};


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
        // FIXME: Delete the file from R2
        console.log(data.url)
        await deleteObjectFromR2(data.name)

        if (file) {
            // Begin a transaction to ensure both deletions succeed or fail together
            await prisma.$transaction(async (prisma) => {
                // If there are related transcribedFiles, delete them first
                if (file.transcribedFiles) {
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
            // FIXME: after deleting the file from R2, reset the state for text areas
            console.log('File and related transcribed files deleted successfully.');
        } else {
            console.log('File not found');
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
    revalidatePath('/');
};
