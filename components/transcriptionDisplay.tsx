// components/TranscriptionDisplay.tsx

import React from "react";

interface TranscriptionDisplayProps {
  data: string;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ data }) => {
  return (
    data && (
      <div className="transcription my-4">
        <label htmlFor="transcriptionField" className="block text-gray-700 text-sm font-bold mb-2">
          Transcription:
        </label>
        <textarea
  id="transcriptionField"
  readOnly
  value={data}
  className="resize-none border rounded-md min-w-[20rem] p-3 text-gray-700 bg-white shadow-sm focus:outline-none focus:shadow-outline"
  rows={5}
/>

      </div>
    )
  );
};

export default TranscriptionDisplay;