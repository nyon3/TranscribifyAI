import prisma from '@/lib/prisma'; // Ensure to use the correct path for your prisma instance


export async function filesWithTranscription() {
    // Fetch the transcription data
    const transcribeData = await prisma.transcribedFile.findMany({
        select: { id: true, text: true, createdAt: true, file: true, fileId: true, updatedAt: true }, // Assuming there's an ID you're selecting as well
    });

    if (transcribeData.length === 0) {
        throw new Error(`Transcription data not found`);
    }

    return transcribeData;
}

// export async function filesWithTranscription() {
//     const filesWithTranscribedData = await prisma.file.findMany({
//         where: { isTranscribed: true },
//         include: {
//             transcribedFiles: {
//                 select: {
//                     text: true, // Selecting specific fields from TranscribedFile
//                 },
//             },
//         },
//     });
//     console.log('Files with Transcribed Data:', filesWithTranscribedData);

//     if (filesWithTranscribedData.length === 0) {
//         throw new Error(`Transcription data not found`);
//     }

//     return filesWithTranscribedData;
// }


export default async function TranscriptionsRoute() {
    const transcriptions = await filesWithTranscription();
    return (
        <div>
            <h1>Transcriptions</h1>
            <ul>
                {transcriptions.map((transcription) => (
                    <li key={transcription.id}>{transcription.text}</li>
                ))}
            </ul>
        </div>
    );
}

// This exports a data fetching function specific for the TranscriptionsRoute,
// which Next.js 13 App Router's new "fetch" convention uses.
export const get = async () => {
    return {
        'transcriptions.data': filesWithTranscription(),
    };
};