'use client';

import React, { useContext } from 'react';
import { FileContext } from '@/components/context/FileIdContext';
import { Textarea } from '@/components/ui/textarea';


const ResultDisplay = () => {
    const { text: transcriptionText, state: summaryText, isLoading } = useContext(FileContext);

    const renderTextarea = (placeholder: string, value: string) => (
        // height is slightly smaller than screen size
        <Textarea
            className="h-full w-full"
            placeholder={placeholder}
            value={value || ''}
            readOnly
        />
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center">
                <div className="text-center">
                    <p className="text-center text-lg font-bold mt-2">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {renderTextarea("Transcription will be displayed here", transcriptionText)}
            {renderTextarea("Summary will be displayed here", summaryText)}
        </>
    );
};

export default ResultDisplay;
