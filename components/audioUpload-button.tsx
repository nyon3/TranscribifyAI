'use client'

import React, { useState } from 'react';
import { handleAudioProcess } from '@/lib/hadleAudioProcess';
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
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog"


export default function AudioUploadButton() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTimestamped, setIsTimestamped] = useState(false);

    const handleDialogOpen = (timestamped = false) => {
        setIsTimestamped(timestamped);
        setIsDialogOpen(true);
    };
    const handleDialogClose = () => {
        setIsDialogOpen(false);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        await handleAudioProcess(formData, isTimestamped);
        handleDialogClose();
    };

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    Upload
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Select Transcription Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDialogOpen(false)}>Transcription</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDialogOpen(true)}>Timestamped Transcription</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transcription Options</DialogTitle>
                        <DialogDescription>
                            Choose your transcription type.
                            <form onSubmit={handleSubmit}> {/* Use onSubmit instead of action */}
                                <input type="file" name="file" accept="audio/*" className="" />
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Upload
                                </button>
                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}
