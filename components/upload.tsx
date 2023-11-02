"use client";
import type { PutBlobResult } from '@vercel/blob';
import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface MySessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const { data: session, status } = useSession();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    const userId = (session?.user as MySessionUser)?.id;

    if (!userId) {
      console.error("User ID is not available");
      return;
    }

    const response = await fetch(
      `/api/avatar/upload?filename=${file.name}&user_id=${userId}`,
      {
        method: 'POST',
        body: file,
      },
    );

    const newBlob = (await response.json()) as PutBlobResult;
    setBlob(newBlob);
  };

  return (
    <>
      <label className="relative cursor-pointer bg-blue-500 text-white font-bold py-2 px-4 border border-blue-700 rounded">
            Upload Audio File
            <input
                name="file"
                ref={inputFileRef}
                type="file"
                required
                onChange={handleFileChange}
                accept="audio/*"  
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </label>
      {/* Optionally display the blob URL */}
      {/* {blob && (
        <div>
          Blob url: <a href={blob.url}>{blob.url}</a>
        </div>
      )} */}
    </>
  );
}
