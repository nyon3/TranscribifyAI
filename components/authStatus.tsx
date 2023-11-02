'use client';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
}

function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null; // Return null or a loading spinner while the session is loading
  }

  const user = session?.user as CustomUser; // Type assertion

  return (
    <div className="flex items-center space-x-4 p-4 rounded max-w-lg mx-auto mt-8">
      {user && user.image && (
        <Image src={user.image} alt="User Avatar" width={100} height={100} className="w-16 h-16 rounded-full" />
      )}

      {user && user.id ? (
        <div className="text-sm font-bold">Signed in as: {user.email}</div>
      ) : (
        <div className="flex flex-col items-start">
          <div className="text-lg font-bold mb-2">No user ID available for</div>
          <div className="text-sm text-gray-500">{user?.name}</div>
        </div>
      )}
    </div>
  );
}

export default AuthStatus;
