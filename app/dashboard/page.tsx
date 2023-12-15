import AuthStatus from '@/components/authStatus';
import { OriginalData } from '@/components/audioFileTable/origianlData';
import AudioUploadButton from '@/components/audioUpload-button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';

export default async function UserHome() {
    // TODO: This function can be reusable, check the 'authStats.tsx' file.
    const session = await getServerSession(authOptions);
    if (!session) {
        return (
            // Center the content with Tailwind CSS
            <div className="h-screen w-screen flex flex-col gap-3 justify-center items-center">
                <h1 className='text-2xl'>Protected Page</h1>
                <p>You can view this page because you are not signed in.</p>
                <Link className="text-blue-500" href={'/'}>Go to Home</Link>
            </div>
        )
    }
    return (
        <main className="flex flex-col max-h-screen">
            <div className="flex items-center">
                <div>
                    <h1 className="px-4 text-3xl font-bold text-gray-800">AudioSummAI</h1>
                </div>
                <div className='flex justify-end w-full px-4'>
                    <nav className='flex items-center space-x-4'>
                        <AudioUploadButton />
                        <AuthStatus />
                    </nav>
                </div>
            </div>

            <OriginalData />
            {/* Disclaimer Section */}
            {/* <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                <p className="font-bold">Service in Experimental Period</p>
                <p>
                    Please note: My service is currently in an experimental phase. The data you store might be deleted after a certain period. Therefore, we encourage you to save your results as soon as possible.
                </p>
            </div> */}
            <div className="w-full px-20 py-10 flex justify-between">
                <Link href="https://forms.gle/GmhJUZFtrx7DZCVMA" className="hover:text-blue-500 ">
                    Have an inquiry or feedback?
                </Link>
            </div>
        </main>
    );
}
