import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import SelectedFile from './selectedFile';

export default async function userFileList() {
    const session = getServerSession(authOptions);
    const files = await prisma.file.findMany({
        where: {
            userId: session?.user?.id,
        },
    });
   
    return (
        <div>
            <ul>
                <SelectedFile listItems={files}/>
            </ul>
        </div>
    )

}