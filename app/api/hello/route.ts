import type { NextApiRequest, NextApiResponse } from 'next'

// export async function GET(request: NextApiRequest) {
//     return new Response('John Doe')
// } 

import { list } from '@vercel/blob';

export const runtime = 'edge';

export async function GET(request: Request) {
    const { blobs } = await list();
    return Response.json(blobs);
}