'use server'
import prisma from '@/lib/prisma';
import { TranscribeProps, dataPropsForComponent } from '@/lib/db';

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


const endPoint = {
    "translate": "https://api-inference.huggingface.co/models/t5-base",
    "summarize": "https://api-inference.huggingface.co/models/google/flan-t5-base"
}

const summarizing = {
    "casual": "Please revise this sentence to a less formal tone: 'I am going to the store.'",
    "timeline": "Create a timeline summary of the following transcription. Highlight key points or topics discussed at different time intervals, ensuring that the essence of the conversation or presentation is captured succinctly. Include time stamps for easy reference."
}
export const summarize = async (formalSentence: string) => {
    const prompt = `${summarizing.timeline}: '${formalSentence}'`;
    const data = {
        inputs: prompt,
    }

    const response = await fetch(
        endPoint.summarize, // Replace with your target model
        {
            headers: { Authorization: `Bearer ${process.env.HF_ACCESS_TOKEN}` },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    const summary = result[0].generated_text;
    console.log(summary);
    return summary;
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
        const summaryRecord = await handleSummaryDatabase(id, summary);

        // Return the stored or updated summary record
        return summaryRecord;
    } catch (error) {
        console.error("Error in summarizing and storing transcription:", error);
        throw error;
    }
}