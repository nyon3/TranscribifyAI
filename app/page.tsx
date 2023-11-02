import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import Table from '@/components/table'
import TablePlaceholder from '@/components/table-placeholder'
import ExpandingArrow from '@/components/expanding-arrow'
import { LoginButton, LogoutButton } from '../components/button'
export const dynamic = 'force-dynamic'
import AuthStatus from '@/components/authStatus'
import AvatarUploadPage from '@/components/upload'


export default async function Home() {

  
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
     {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}

      <LoginButton />
      <LogoutButton />
      <AuthStatus />
     
  
    </main>
  )
}
