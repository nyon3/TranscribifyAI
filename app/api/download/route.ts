import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from '@/lib/awsConfig';
import { NextRequest } from "next/server";
import { Readable } from 'stream';

export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');
    if (id === null) {
        return new Response("Invalid id parameter", { status: 400 });
    }

    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: id,
    });

    try {
        const { Body, ContentType } = await r2.send(command);

        if (Body instanceof Readable) {
            // Handle Node.js stream
            const chunks = [];
            for await (const chunk of Body) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            const headers = new Headers();
            headers.append('Content-Type', ContentType || 'application/octet-stream');
            headers.append('Content-Disposition', `attachment; filename="${id}"`);
            return new Response(buffer, { headers });
        } else if (Body instanceof ReadableStream) {
            // Handle web ReadableStream
            // ... (existing code for handling ReadableStream)
        } else {
            throw new Error("Unexpected response body type");
        }
    } catch (error) {
        console.error(error);
        return new Response("Failed to download file", { status: 500 });
    }
}
