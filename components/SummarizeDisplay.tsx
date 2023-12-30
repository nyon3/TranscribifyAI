'use client';

import React, { useContext } from 'react';
import { FileContext } from '@/components/context/FileIdContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip"
import { Copy, Check } from 'lucide-react';
import { useState, useCallback } from 'react';

const ResultDisplay = () => {
    const { text: transcriptionText, state: summaryText, isLoading } = useContext(FileContext);
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(summaryText || '')
            .then(() => {
                console.log('Text copied to clipboard');
                setIsCopied(true)
                setTimeout(() => {
                    setIsCopied(false)
                }, 2000)
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    }, [summaryText]);


    const renderTextarea = (placeholder: string, value: string) => (
        // height is slightly smaller than screen size
        <Textarea
            className="h-full"
            placeholder={placeholder}
            value={value || ''}
            readOnly
        />
    );

    const renderSummaryTextarea = (placeholder: string, value: string) => (
        <>
            <div className="flex flex-col items-end gap-2 w-full">
                <Textarea
                    className="h-full"
                    placeholder={placeholder}
                    value={value || ''}
                    readOnly
                />
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={copyToClipboard} variant="ghost" size="icon" >
                                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                <span className="sr-only">Copy</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </>
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
            {renderSummaryTextarea("Summary will be displayed here", summaryText)}
        </>
    );
};

export default ResultDisplay;
