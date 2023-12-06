'use client';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { signOut } from "next-auth/react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


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
    // rectangle button with dropdown menu for user account styling with Tailwind CSS
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className='flex items-center px-5 py-3 rounded hover:bg-gray-100'>
          {user && user.image && (
            <Image src={user.image} alt="User Avatar" width={50} height={50} className="w-16 h-16 rounded-full" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default AuthStatus;
