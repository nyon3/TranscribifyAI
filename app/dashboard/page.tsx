import AuthStatus from '@/components/authStatus';
import { OriginalData } from '@/components/audioFileTable/origianlData';
import AudioUploadButton from '@/components/audioUpload-button';
import Link from 'next/link';

export default function UserHome() {
    return (
        <main className="flex flex-col max-h-screen">
            <div className='flex justify-end w-full px-4'>
                <div className='flex items-center space-x-4'>
                    <AudioUploadButton />
                    <AuthStatus />
                </div>
            </div>

            <OriginalData />
            {/* Disclaimer Section */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                <p className="font-bold">Service in Experimental Period</p>
                <p>
                    Please note: My service is currently in an experimental phase. The data you store might be deleted after a certain period. Therefore, we encourage you to save your results as soon as possible.
                </p>
            </div>
            <div className="w-full px-20 py-10 flex justify-between">
                <Link href="https://forms.gle/GmhJUZFtrx7DZCVMA" className="hover:text-blue-500 ">
                    Have an inquiry or feedback?
                </Link>
            </div>
        </main>
    );
}
