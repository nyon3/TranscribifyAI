import React from 'react';

interface CopyToClipboardProps {
  text: string;
  children: (copy: () => void) => React.ReactNode;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text, children }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch (err) {
      alert('Failed to copy text');
    }
  };

  return <>{children(copyToClipboard)}</>;
};

export default CopyToClipboard;
