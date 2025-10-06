import { useState } from 'react';
import { CaesarCipher } from '@/components/puzzles/CaesarCipher';
import { CodeLocker } from '@/components/puzzles/CodeLocker';
import { Dictaphone } from '@/components/puzzles/Dictaphone';
import { InteractiveZoneMap } from '@/components/zones/InteractiveZoneMap';
import { usePuzzleSolver } from '@/hooks/usePuzzleSolver';
import enigmesData from '@/data/enigmes.json';
import zone1Background from '@/assets/zone1-bg.png';

interface Zone1Props {
  sessionCode: string;
  session: any;
}

export const Zone1 = ({ sessionCode, session }: Zone1Props) => {
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const zone = (enigmesData.zones as any).zone1;
  const solvedPuzzles = session.solved_puzzles || {};
  const { solvePuzzle } = usePuzzleSolver(sessionCode);

  const handleSolvePuzzle = async (puzzleId: string, reward: string) => {
    await solvePuzzle(puzzleId, reward);
    setActivePuzzle(null);
  };

  const hotspots = [
    {
      id: 'caesar',
      x: 30,
      y: 40,
      label: 'Le Carnet',
      icon: '📖',
      solved: !!solvedPuzzles[zone.puzzles.caesar.id],
      onClick: () => setActivePuzzle('caesar')
    },
    {
      id: 'locker',
      x: 70,
      y: 50,
      label: 'Le Casier',
      icon: '🔒',
      solved: !!solvedPuzzles[zone.puzzles.locker.id],
      onClick: () => setActivePuzzle('locker')
    },
    {
      id: 'audio',
      x: 50,
      y: 70,
      label: 'Le Dictaphone',
      icon: '🎙️',
      solved: !!solvedPuzzles[zone.puzzles.audio.id],
      onClick: () => setActivePuzzle('audio')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pt-16 sm:pt-24">
        <div className="text-center space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{zone.name}</h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 px-2">{zone.description}</p>
        </div>

        <InteractiveZoneMap
          backgroundImage={zone1Background}
          backgroundColor="bg-gradient-to-br from-amber-900 via-orange-900 to-slate-800"
          hotspots={hotspots}
          zoneName={zone.name}
        />
      </div>

      <CaesarCipher
        isOpen={activePuzzle === 'caesar'}
        onClose={() => setActivePuzzle(null)}
        encryptedText={zone.puzzles.caesar.encrypted}
        correctKey={zone.puzzles.caesar.key}
        onSolve={() => handleSolvePuzzle(zone.puzzles.caesar.id, zone.puzzles.caesar.reward)}
      />

      <CodeLocker
        isOpen={activePuzzle === 'locker'}
        onClose={() => setActivePuzzle(null)}
        correctCode={zone.puzzles.locker.code}
        onSolve={() => handleSolvePuzzle(zone.puzzles.locker.id, zone.puzzles.locker.reward)}
      />

      <Dictaphone
        isOpen={activePuzzle === 'audio'}
        onClose={() => setActivePuzzle(null)}
        transcript={zone.puzzles.audio.transcript}
        onSolve={() => handleSolvePuzzle(zone.puzzles.audio.id, zone.puzzles.audio.reward)}
      />
    </div>
  );
};
