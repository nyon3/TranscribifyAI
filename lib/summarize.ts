'use server'
import prisma from '@/lib/prisma';
import { TranscribeProps, dataPropsForComponent } from '@/lib/db';
import { revalidatePath } from 'next/cache';

async function handleSummaryDatabase(fileId: number, summaryText: string) {
    const summaryRecord = await prisma.transcribedFile.findUnique({
        where: { fileId: fileId },
    });

    if (summaryRecord) {
        // Update the existing record with the new summary
        const updatedSummaryRecord = await prisma.transcribedFile.update({
            where: { id: summaryRecord.id },
            data: { summary: summaryText },
        });
        return updatedSummaryRecord;
    } else {
        // Create a new transcribedFile record linked to the given file
        const newSummaryRecord = await prisma.transcribedFile.create({
            data: {
                text: "",
                summary: summaryText,
                fileId: fileId, // Link to the existing file record
            },
        });
        return newSummaryRecord;
    }
}


const ChatGptSummarize = async (formalSentence: string) => {
    const OpenAIendPoint = {
        "summarize": "https://api.openai.com/v1/chat/completions"
    }

    const input = formalSentence;
    const payload = {
        "model": "gpt-3.5-turbo-1106",
        "messages": [
            { "role": "system", "content": "Could you craft a summary for a YouTube or podcast audience based on this audio transcription? Imagine you're speaking directly to the listeners, engaging them with a warm, conversational tone. : " },
            { "role": "user", "content": input }  // Use the formalSentence here.
        ],
        "temperature": 0.9,
    };

    const response = await fetch(OpenAIendPoint.summarize, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',  // Specify content type.
        },
        body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result.choices[0].message.content;
}


export async function summarizingTranscribedAudioData(data: dataPropsForComponent) {
    const id = data.transcribedFiles?.fileId;
    try {
        // Ensure that data.fileId is defined
        if (!id) {
            throw new Error("fileId is undefined in TranscribeProps");
        }

        // Generate a summary for the transcribed text
        const summary = await ChatGptSummarize(data.transcribedFiles?.text || "");

        // Store or update the summary in the database
        await handleSummaryDatabase(id, summary);
        revalidatePath('/');
        // Return the stored or updated summary record
        return {
            success: true,
            message: 'Summary completed and database updated successfully.',
        }
    } catch (error) {
        console.error("Error in summarizing and storing transcription:", error);
        throw error;
    }
}