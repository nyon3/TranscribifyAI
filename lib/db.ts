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
  transcribedFile: TranscribeProps | null;// This is the related transcribedFiles
};

export type TranscribeProps = {
  id: number;
  fileId: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  file: dataProps; // This is the related file record
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
    include: { TranscribedFile: true } // Matches the field name in your Prisma schema
  });
  return files as dataProps[];
}

// export async function getTranscribeData(): Promise<TranscribeProps[]> {
//   const userId = await getUserId();
//   if (!userId) return [];
//   const transcribeData = await prisma.transcribedFile.findMany({
//     where: {
//       file: { userId }
//     },
//     include: { file: true } // Include the file data if needed
//   });
//   return transcribeData as TranscribeProps[];
// }

export async function filesWithTranscription(fileId: number): Promise<TranscribeProps> {
  // Fetch the transcription data directly by its fileId
  const transcribeData = await prisma.transcribedFile.findFirst({
    where: {
      fileId: fileId // Match fileId in TranscribeProps with the provided fileId
    },
    include: {
      file: true, // Include the related file data
    }
  });
  console.log('Transcribe Data:', transcribeData);
  // If the transcription data is found, return it
  if (!transcribeData) {
    throw new Error(`Transcription data not found for fileId ${fileId}`);
  }

  return transcribeData as TranscribeProps; // Ensure the returned object matches the TranscribeProps type
}

