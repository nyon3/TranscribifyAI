// AudioPlayer.tsx 

'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface AudioPlayProps {
  audio: string;
}

export const AudioPlay = ({ audio }: AudioPlayProps) => {
  const [playing, setPlaying] = useState(false);
  const { data: session, status } = useSession();

  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  return (
    <>
      <audio controls key={audio}>
        <source src={audio} type="audio/mpeg" />
      </audio>
    </>
  );
};
