'use client';
import React, { useState, ChangeEvent } from "react";
import deleteFile from "@/lib/deleteFile";
import {transcribeAudio} from "@/lib/transcription";
import TranscriptionDisplay from "@/components/transcriptionDisplay";
import CopyToClipboard from "./CopyToClip";
import { AudioPlay } from './AudioPlay';  // Import AudioPlay component
import { FaTrash, FaFileSignature } from 'react-icons/fa';

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
      listItems.map((item, index) => {
        const iconClassName = selectedFileUrl === item.url ? "text-current h-5 w-5" : "text-gray-400 h-5 w-5";

        return (
          <li key={index} className="flex items-center space-x-4">
            <input
              type="radio"
              name="fileSelection"
              value={item.url}
              checked={selectedFileUrl === item.url}
              onChange={handleChange}
              className="mr-4"
            />
            <label className="flex-1">{item.name}</label>
            <div className="flex space-x-2">
              <button onClick={handleDelete} className="flex flex-col items-center justify-center">
                <FaTrash className={iconClassName} />
                <span className="text-sm mt-1">Delete</span>
              </button>
              <button onClick={handleTranscribe} className="flex flex-col items-center justify-center">
                <FaFileSignature className={iconClassName} />
                <span className="text-sm mt-1">Transcribe</span>
              </button>
            </div>
            <AudioPlay audio={item.url} />
          </li>
        );
      })
    }
    {/* Create separator */}
    <hr className="my-4" />
    
    <TranscriptionDisplay data={transcription} />
    <CopyToClipboard text="Text to Copy">
      {(copy) => <button onClick={copy}>Copy</button>}
    </CopyToClipboard>

  </>

  );
};

export default SelectedFile;
