import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import Table from '@/components/table';
import TablePlaceholder from '@/components/table-placeholder';
import ExpandingArrow from '@/components/expanding-arrow';
import { LoginButton, LogoutButton } from '@/components/button';
import AuthStatus from '@/components/authStatus';
import AudioFileList from '@/components/AudioFileList';
import { FileUpload } from '@/components/FileUpload';

export default function UserHome() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center">
              <AuthStatus />
            <Suspense fallback={<TablePlaceholder />}>
                <AudioFileList />
            </Suspense>
            <FileUpload />
            <div className="flex justify-center space-x-5 pt-10 mt-10 border-t border-gray-300 w-full max-w-xl text-gray-600">
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
            </div>

            <div className="sm:absolute sm:bottom-0 w-full px-20 py-10 flex justify-between">
                <Link href="https://vercel.com">
                    <Image
                        src="/vercel.svg"
                        alt="Vercel Logo"
                        width={100}
                        height={24}
                        priority
                    />
                </Link>
                <Link
                    href="https://github.com/vercel/examples/tree/main/storage/postgres-prisma"
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
                </Link>
            </div>
        </main>
    );
}
