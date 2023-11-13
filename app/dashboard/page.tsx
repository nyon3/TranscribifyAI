
import { Suspense } from 'react';
import TablePlaceholder from '@/components/table-placeholder';
import { LogoutButton } from '@/components/loginButton';
import AuthStatus from '@/components/authStatus';
import { FileUpload } from '@/components/FileUpload';
import { OriginalData } from '@/components/audioFileTable/origianlData';

export default function UserHome() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center">
            <div className='flex justify-center items-center space-x-4'>
                <AuthStatus />
                <LogoutButton />
            </div>
            <div className="flex flex-col mb-5 items-center justify-center space-y-4">
                <FileUpload />
            </div>
            {/* <Suspense fallback={<TablePlaceholder />}>
                <AudioFileList />
            </Suspense> */}

            {/* <div className="flex justify-center space-x-5 pt-10 mt-10 border-t border-gray-300 w-full max-w-xl text-gray-600">
                <Link
                    href="https://postgres-starter.vercel.app/"
                    className="font-medium underline underline-offset-4 hover:text-black transition-colors"
                >
                    Starter
                </Link>
                <Link
                    href="https://postgres-kysely.vercel.app/"
                    className="font-medium underline underline-offset-4 hover:text-black transition-colors"
                >
                    Kysely
                </Link>
                <Link
                    href="https://postgres-drizzle.vercel.app/"
                    className="font-medium underline underline-offset-4 hover:text-black transition-colors"
                >
                    Drizzle
                </Link>
            </div> */}

            <div className="sm:absolute sm:bottom-0 w-full px-20 py-10 flex justify-between">
                {/* <Link href="https://vercel.com">
                    <Image
                        src="/vercel.svg"
                        alt="Vercel Logo"
                        width={100}
                        height={24}
                        priority
                    />
                </Link> */}
                {/* <Link
                    href="https://github.com/nyon3/TranscribifyAI"
                    className="flex items-center space-x-2"
                >
                    <Image
                        src="/github.svg"
                        alt="GitHub Logo"
                        width={24}
                        height={24}
                        priority
                    />
                    <p className="font-light">Source</p>
                </Link> */}
                <div className="mt-6 text-gray-600 text-center">
                    Have an inquiry or feedback?
                </div>
            </div>
            <OriginalData />

        </main>
    );
}
