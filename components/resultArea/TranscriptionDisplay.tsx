// TranscriptionDisplay.tsx

'use client';

import React, { useContext } from 'react';
import { FileContext } from '@/components/FileIdContext';

import { Textarea } from '@/components/ui/textarea';

const TranscriptionDisplay = () => {
    const { text: fileId } = useContext(FileContext);

    if (!fileId) {
        return <Textarea className="w-96 h-4xl" placeholder="No file selected" value={""} readOnly />;
    }

    return (
        <Textarea className="w-96 h-4xl" placeholder='No file selected' value={fileId} readOnly />

    );
};

export default TranscriptionDisplay;