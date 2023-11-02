import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import SelectedFile from './selectedFile';

export default async function userFileList() {
    const session = await getServerSession(authOptions);  // Added await here
    const files = await prisma.file.findMany({
        where: {
            // Using type assertion to inform TypeScript to treat session.user as any type
            userId: (session?.user as any)?.id,
        },
    });
   
    return (
        <div>
            <ul>
                <SelectedFile listItems={files}/>
            </ul>
        </div>
    );
}
