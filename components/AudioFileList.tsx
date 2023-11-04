import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';
import RefreshButton from '@/components/refresh-button';
import { transcribeFile } from '@/lib/transcribe';

export default async function AudioFileList() {
    const session = await getServerSession(authOptions);  // Added await here
    const files = await prisma.file.findMany({
        where: {
            // Using type assertion to inform TypeScript to treat session.user as any type
            userId: (session?.user as any)?.id,
        },
    });
   
    // Create a function that will update the user with the given id
    
    


    const deleteFile = async(data:FormData) => {
        'use server'
       const url = data.get('url') as string;
    await prisma.file.findFirst({
        where: {
            url: url
        } 
    }).then(async (file) => {
        if (file) {
            await prisma.file.delete({
                where: {
                    id: file.id
                }
            });
        } else {
            console.log('File not found');
        }
    }).catch((error) => {   
        console.log(error);
    });
    revalidatePath('/');
    }   

    return (
        <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Your files</h2>
          </div>
          <RefreshButton />
        </div>
            <ul>
              { files.map((file) => (
            <li key={file.id}>
                  <label className="">{file.name}</label>
                  <form>
                    <input
                      type='hidden'
                      name='url'
                        value={file.url}
                        />
                  <button 
                  className='ml-3 '
                  formAction={deleteFile}
                  >Delete</button>
                     <button 
                    className='ml-3'
                    formAction={transcribeFile}>
                    Transcribe
                  </button>
                  </form>
               
            </li>
                ))}
          
            </ul>
        </div>
    );
}
