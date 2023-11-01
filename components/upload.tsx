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
      <h1>Upload Your Audio Data</h1>

      <input
        name="file"
        ref={inputFileRef}
        type="file"
        required
        onChange={handleFileChange}
        accept="audio/*"  
      />
      {/* Optionally display the blob URL */}
      {blob && (
        <div>
          Blob url: <a href={blob.url}>{blob.url}</a>
        </div>
      )}
    </>
  );
}
