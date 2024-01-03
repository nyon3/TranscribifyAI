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
import { Copy, Check, Download } from 'lucide-react';
import { useState, useCallback } from 'react';
import { downloadTextFile, copyToClipboard } from '@/components/actions/helperFunctions';

const ResultDisplay = () => {
    const { text: transcriptionText, state: summaryText, isLoading } = useContext(FileContext);
    const [isCopied, setIsCopied] = useState(false);

    // FIXME: animation should work on 'handleCopy' only but it doesn't
    const handleCopy = useCallback(() => {
        copyToClipboard(
            summaryText,
            () => {
                setIsCopied(true);
                setTimeout(() => {
                    setIsCopied(false);
                }, 2000);
            },
            (err) => console.error('Could not copy text: ', err)
        );
    }, [summaryText]);

    const downloadSrtFromDB = useCallback(() => {
        downloadTextFile(transcriptionText, "transcription.srt");
    }, [transcriptionText]);


    const renderTextarea = (placeholder: string, value: string) => (
        // height is slightly smaller than screen size
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
                        <Button onClick={downloadSrtFromDB} variant="ghost" size="icon" >
                            {isCopied ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                            <span className="sr-only">Download</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
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
                            <Button onClick={handleCopy} variant="ghost" size="icon" >
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
