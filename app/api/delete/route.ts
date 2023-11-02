import { del } from '@vercel/blob';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlToDelete = searchParams.get('url') as string;
  if (!urlToDelete) {
    return NextResponse.json({ error: 'Please enter a file path' }, { status: 400 });
  }
  try {
    // Find the file ID based on the URL
    const fileRecord = await prisma.file.findFirst({
      where: {
        url: urlToDelete,
      },
    });

    if (!fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Find and delete associated TranscribedFile records
    const transcribedFiles = await prisma.transcribedFile.findMany({
      where: {
        fileId: fileRecord.id,
      },
    });

    for (const transcribedFile of transcribedFiles) {
      await prisma.transcribedFile.delete({
        where: {
          id: transcribedFile.id,
        },
      });
    }

    // Now delete the file from Vercel storage and the database
    await del(urlToDelete);  

    await prisma.file.delete({
      where: {
        id: fileRecord.id,  // Use the file ID obtained from the query above
      },
    });

    return NextResponse.json({ message: 'File and associated transcriptions deleted successfully' }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
