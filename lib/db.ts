import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';


interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
}
export type dataProps = {
  id: number;
  name: string;
  updatedAt: Date;
  createdAt: Date;
  url: string;
  userId: string;
  isTranscribed: boolean;
  transcribedFiles?: TranscribeProps[] | null; // Not an array
};

export type TranscribeProps = {
  id: number;
  text: string;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
  fileId: number;
  file: dataProps; // This is the related file record
};

export type dataPropsForComponent = {
  id: number;
  name: string;
  updatedAt: Date;
  createdAt: Date;
  url: string;
  userId: string;
  isTranscribed: boolean;
  transcribedFiles?: TranscribeProps | null; // Now an object
};

export async function getUserId() {
  const session = await getServerSession(authOptions);
  const user = session?.user as CustomUser;
  return user?.id;
}

export async function getUserData(): Promise<dataProps[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const files = await prisma.file.findMany({
    where: { userId },
    include: { transcribedFiles: true }
  });
  return files as dataProps[];
}

// export async function filesWithTranscription(data = 45): Promise<TranscribeDataProps[]> {
//   // Fetch the transcription data
//   const transcribeData = await prisma.transcribedFile.findMany({
//     select: { fileId: data, text: true },
//   });
//   console.log('Transcribe Data:', transcribeData);

//   // If the transcription data is found, return it
//   if (transcribeData.length === 0) {
//     throw new Error(`Transcription data not found`);
//   }

//   return transcribeData as TranscribeDataProps[];
// }
