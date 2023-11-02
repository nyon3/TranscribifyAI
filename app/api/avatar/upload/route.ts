import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  if (filename === null) {
    // Handle the error (either throw or return a response)
    return NextResponse.json({ error: "filename is required" });
  }
  if (!request.body) {
    return NextResponse.json({ error: "Request body is empty" });
  }

  const userId = searchParams.get('user_id') ?? undefined;
  
  if (!filename || !userId || !request.body) {
    return NextResponse.json({ error: "Required parameters are missing" });
  }
  
  // ⚠️ The below code is for App Router Route Handlers only
  const blob = await put(filename, request.body, {
    access: 'public',
  });
  

  // Here's the code for Pages API Routes:
  // const blob = await put(filename, request, {
  //   access: 'public',
  // });
  
  // Create a new record in the `File` table
   const fileRecord = await prisma.file.create({
    data: {
      name: filename,
      url: blob.url,
      userId,
    },
  });

  return NextResponse.json(blob, fileRecord);
}

// The next lines are required for Pages API Routes only
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
