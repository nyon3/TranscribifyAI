// Audio paly button UI component access the audio file from Prisma database and play it.
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
      <audio controls>
        <source src={audio} type="audio/mpeg" />
      </audio>
      <div>
        {session && (
          <>
            {!playing && (
              <button onClick={handlePlay}>Play</button>
            )}
            {playing && (
              <button onClick={handlePause}>Pause</button>
            )}
          </>
        )}
      </div>
    </>
  );
};
