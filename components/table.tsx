import prisma from '@/lib/prisma';
import { timeAgo } from '@/lib/utils';
import Image from 'next/image';
import RefreshButton from './refresh-button';
import UserFileList from './list';

// Assuming User type is defined somewhere or imported from Prisma client
type User = {
  files: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    url: string;
    userId: string;
    transcription: string | null;
  }[];
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
};

export default async function Table() {
  const startTime = Date.now();
  // const users: User[] = await prisma.user.findMany({
  //   include: {
  //     files: true,
  //   },
  // });

  const duration = Date.now() - startTime;

  return (
    <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Your files</h2>
        </div>
        <RefreshButton />
      </div>
      <UserFileList />
    </div>
  );
}
