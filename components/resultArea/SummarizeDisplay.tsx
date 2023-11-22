// SummarizeDisplay.tsx

'use client';

import React, { useContext } from 'react';
import { FileContext } from '@/components/FileIdContext';

import { Textarea } from '@/components/ui/textarea';

const SummarizeDisplay = () => {
    const { state } = useContext(FileContext);

    if (!state) {
        return <Textarea className="w-96 h-4xl" placeholder="No file selected" value={""} readOnly />;
    }

    return (
        <Textarea className="w-96 h-4xl" placeholder='No file selected' value={state} readOnly />

    );
};

export default SummarizeDisplay;