'use client';
import React, { useState, ChangeEvent } from "react";
import deleteFile from "@/lib/deleteFile";
import {transcribeAudio} from "@/lib/transcription";
import TranscriptionDisplay from "@/components/transcriptionDisplay";
import CopyToClipboard from "./CopyToClip";
import { AudioPlay } from './AudioPlay';  // Import AudioPlay component

interface ListItem {
  url: string;
  name: string;
}

interface SelectedFileProps {
  listItems: ListItem[];
}

const SelectedFile: React.FC<SelectedFileProps> = ({ listItems }) => {
  const [selectedFileUrl, setSelectedFileUrl] = useState('');
  const [transcription, setTranscription] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFileUrl(event.target.value);
  };

  const handleDelete = () => {
    if (selectedFileUrl) {
      deleteFile({ [selectedFileUrl]: true });
    } else {
      alert('Please select a file to delete');
    }
  };

  const handleTranscribe = async () => {
    if (selectedFileUrl) {
      const transcriptionData = await transcribeAudio(selectedFileUrl);
      setTranscription(transcriptionData);
    } else {
      alert('Please select a file to transcribe');
    }
  };

  return (
    <>
      {
        listItems.map((item, index) => (
          <li key={index}>
            <label>
              <input
                type="radio"
                name="fileSelection"
                value={item.url}
                checked={selectedFileUrl === item.url}
                onChange={handleChange}
                className="mr-4"
              />
              {item.name}
            </label>
          </li>
        ))
      }
      <div className="flex justify-between items-center mb-4">
        <button onClick={handleDelete} className="mt-5">Delete</button>
        <button onClick={handleTranscribe} className="mt-5">Transcribe</button>
      </div>
      <TranscriptionDisplay data={transcription} />
      <CopyToClipboard text="Text to Copy">
        {(copy) => <button onClick={copy}>Copy</button>}
      </CopyToClipboard>
      {selectedFileUrl && (
        <AudioPlay audio={selectedFileUrl} />  // Use AudioPlay component here
      )}
    </>
  );
};

export default SelectedFile;
