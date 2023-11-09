import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export async function getUserId() {
  const session = await getServerSession();
  const userId = session?.user?.id;
  return userId;
}

export async function getUserData() {
  const session = await getServerSession(authOptions);
  const files = await prisma.file.findMany({
    where: {
        // Using type assertion to inform TypeScript to treat session.user as any type
        userId: session?.user?.id,
    },
});
return files;
}

export async function getTranscribeData() {
  const session = await getServerSession(authOptions);
    const transcribe = await prisma.transcribe.findMany({
        where: {
           file: {
                userId: session?.user?.id,
           }
        },
    });
    return transcribe;
}