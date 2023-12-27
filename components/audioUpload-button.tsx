'use client'

import React, { useState } from 'react';
import { processAndUploadAudio } from '@/lib/uploadAudio';
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

export default function AudioUploadButton() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTimestamped, setIsTimestamped] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [error, setError] = useState<string | null>(null);

    const handleDialogOpen = (timestamped = false) => {
        setIsTimestamped(timestamped);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setIsLoading(false); // Reset loading state when dialog closes
        setError(null); // Reset error state when dialog closes
    };


    // TODO: think about how to close the dialog after the file is uploaded
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        const formData = new FormData(event.currentTarget);
        try {
            // const processingResult = await handleAudioProcess(formData, isTimestamped);
            await processAndUploadAudio(formData)
        } catch (e) {
            console.error("Error during audio processing:", e);
            alert("An error occurred while processing your audio. Please try again.")
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
        }
    };

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>Upload</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Select Transcription Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDialogOpen(false)}>Transcription</DropdownMenuItem>
                    {/* <DropdownMenuItem onClick={() => handleDialogOpen(true)}>Timestamped Transcription</DropdownMenuItem> */}
                    <DropdownMenuItem className='text-gray-400'>Timestamped Text (Coming Soon)</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transcription Options</DialogTitle>
                        <div className="space-y-4"> {/* Use a div instead of DialogDescription */}
                            <p>Select an audio file for transcription. Please note the following limitations:</p>
                            <ul className="text-sm text-gray-600">
                                <li>Maximum file size: 10MB</li>
                                <li>Supported formats: MP3, WAV, FLAC</li>
                                <li>Transcription accuracy may vary with audio quality</li>
                            </ul>
                            <form onSubmit={handleSubmit}>
                                <input type="file" name="file" accept="audio/*" className="" />
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
                                    {isLoading ? 'Uploading...' : 'Upload'}
                                </button>
                            </form>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>


        </div>
    );
}
