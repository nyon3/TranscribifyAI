// import type { NextApiRequest, NextApiResponse } from 'next';
// import { r2 } from '@/lib/awsConfig';
// import { ListBucketsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// export async function GET(req: NextApiRequest, res: NextApiResponse) {
//   const params = {
//     Bucket: process.env.R2_BUCKET_NAME || '',
//     MaxKeys: 2,
//   };

//   // const command = new ListBucketsCommand(params);
//   const command = new ListObjectsV2Command(params);

//   try {
//     const data = await r2.send(command);
//     return new Response(JSON.stringify(data));
//   } catch (err) {
//     return new Response(err)
//   }
// }
