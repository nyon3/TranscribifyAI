import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';
import prisma from '@/lib/prisma';

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const audioURL = formData.get('audioUrl');

    // Validate the audioURL
    if (typeof audioURL !== 'string') {
      return NextResponse.json({ error: 'Invalid audio URL' });
    }

// Perform the transcription
const transcribedText = await transcribeAudio(audioURL);

// Find the corresponding File record based on the audio URL
const fileRecord = await prisma.file.findFirst({
  where: { url: audioURL },
});

if (!fileRecord || typeof fileRecord.id !== 'number') {
  return NextResponse.json({ error: 'File not found' });
}

// Check if a TranscribedFile exists for this File
const existingTranscribedFile = await prisma.transcribedFile.findFirst({
  where: { fileId: fileRecord.id },
});

// If it exists, update, otherwise create
if (existingTranscribedFile) {
  await prisma.transcribedFile.update({
    where: { id: existingTranscribedFile.id },
    data: { text: transcribedText },
  });
} else {
  await prisma.transcribedFile.create({
    data: {
      text: transcribedText,
      fileId: fileRecord.id,
    },
  });
}

// Update the File record to indicate it has been transcribed



    return NextResponse.json({ transcription: transcribedText });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.toString() });
    }
    return NextResponse.json({ error: "An unknown error occurred" });
  }

async function transcribeAudio(audioURL: string): Promise<string> {
  const response = await fetch(audioURL);
  const audioData: Blob = await response.blob();

  const transcriptionResult = await hf.automaticSpeechRecognition({
    data: audioData,
    model: 'facebook/wav2vec2-large-960h-lv60-self',
  });

  return transcriptionResult.text;
}}