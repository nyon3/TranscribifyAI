import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { deleteFile } from '@/lib/delete';
import RefreshButton from '@/components/refresh-button';
import { transcribeFile } from '@/lib/transcribe';
import ClientList from './ClientComponent';
import ServerListItem from './ServeList';
import { FaTrash, FaFileSignature } from 'react-icons/fa';

export default async function AudioFileList() {
    const session = await getServerSession(authOptions);  // Added await here
    const files = await prisma.file.findMany({
        where: {
            // Using type assertion to inform TypeScript to treat session.user as any type
            userId: (session?.user as any)?.id,
        },
    });
    const TranscribeData = await prisma.transcribedFile.findMany({
        where: {
            file: {
                userId: (session?.user as any)?.id,
            },
        },
    });

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
            <li key={file.id} className="flex items-center mb-5 space-x-4">
                  <label className="">{file.name}</label>
                  <form >
                    <input
                      type='hidden'
                      name='url'
                        value={file.url}
                       />
                
                  <button 
                  className='ml-5 hover:text-blue-500'
                  formAction={deleteFile}
                  >
                    
                    <FaTrash />
                    <span className='text-sm mt-1'>Delete</span></button>
                    
                     <button 
                    className='ml-5 hover:text-blue-500'
                    formAction={transcribeFile}>
                   <FaFileSignature/>
                  <span className="text-sm mt-1">Transcribe</span>
                  </button>
                 
                  </form>
    
            </li>
                ))}
                {/* separator */}
                <li className="border-b border-gray-200 my-4" />

                {/* Transcription */}
            { TranscribeData.map((item) => (
                <ClientList  key={item.id} fileName={item.id}>
                <ServerListItem message={item} />
                </ClientList>                
            ))
            }
              </ul>
        </div>
    );
}
