import './globals.css'
import { Inter } from 'next/font/google'
import SessionProvider from '../components/SessionProvider'
import { getServerSession } from 'next-auth'


export const metadata = {
  metadataBase: new URL('https://postgres-prisma.vercel.app'),
  title: 'Vercel Postgres Demo with Prisma',
  description:
    'A simple Next.js app with Vercel Postgres as the database and Prisma as the ORM',
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = getServerSession()
  return (
    <html lang="en">
    <SessionProvider session={session}>
      <body className={inter.variable}>{children}</body>
      </SessionProvider>
    </html>
  )
}
