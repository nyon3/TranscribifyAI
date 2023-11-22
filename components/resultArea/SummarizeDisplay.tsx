// TextDisplay.tsx

'use client';

import React, { useContext } from 'react';
import { FileContext } from '@/components/context/FileIdContext';
import { Textarea } from '@/components/ui/textarea';


const ResultDisplay = () => {
    const { text: transcriptionText, state: summaryText, isLoading } = useContext(FileContext);
    if (isLoading) {
        return <div>Loading...</div>
    }
    return (
        <>
            <Textarea
                className="w-96 h-4xl" // Adjust size as needed
                placeholder="Transcription will be displayed here"
                value={transcriptionText || ''}
                readOnly
            />
            <Textarea
                className="w-96 h-4xl" // Adjust size as needed
                placeholder="Summary will be displayed here"
                value={summaryText || ''}
                readOnly
            />
        </>
    );
};

export default ResultDisplay;