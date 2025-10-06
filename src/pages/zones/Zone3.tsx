import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CryoBox } from '@/components/puzzles/CryoBox';
import { LiquidMixer } from '@/components/puzzles/LiquidMixer';
import { FinalCode } from '@/components/puzzles/FinalCode';
import { InteractiveZoneMap } from '@/components/zones/InteractiveZoneMap';
import { usePuzzleSolver } from '@/hooks/usePuzzleSolver';
import { AlertTriangle } from 'lucide-react';
import enigmesData from '@/data/enigmes.json';

interface Zone3Props {
  sessionCode: string;
  session: any;
}

export const Zone3 = ({ sessionCode, session }: Zone3Props) => {
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const zone = (enigmesData.zones as any).zone3;
  const solvedPuzzles = session.solved_puzzles || {};
  const { solvePuzzle } = usePuzzleSolver(sessionCode);

  const handleSolvePuzzle = async (puzzleId: string, reward: string) => {
    await solvePuzzle(puzzleId, reward);
    setActivePuzzle(null);
  };

  const hotspots = [
    {
      id: 'cryobox',
      x: 30,
      y: 50,
      label: 'Coffre cryogénique',
      icon: '❄️',
      solved: !!solvedPuzzles[zone.puzzles.cryobox.id],
      onClick: () => setActivePuzzle('cryobox')
    },
    {
      id: 'mixer',
      x: 50,
      y: 60,
      label: 'Table de synthèse',
      icon: '🧪',
      solved: !!solvedPuzzles[zone.puzzles.mixer.id],
      onClick: () => {
        if (!solvedPuzzles[zone.puzzles.cryobox.id]) {
          return;
        }
        setActivePuzzle('mixer');
      }
    },
    {
      id: 'final',
      x: 70,
      y: 45,
      label: 'Code final',
      icon: '🔐',
      solved: !!solvedPuzzles[zone.puzzles.final.id],
      onClick: () => {
        if (!solvedPuzzles[zone.puzzles.mixer.id]) {
          return;
        }
        setActivePuzzle('final');
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-orange-900 to-slate-950 p-4">
      <div className="max-w-6xl mx-auto space-y-6 pt-24">
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-2xl font-bold">⚠️ ALERTE CRITIQUE</AlertTitle>
          <AlertDescription className="text-lg">
            Confinement compromis ! Synthétisez le vaccin avant la propagation totale !
          </AlertDescription>
        </Alert>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">{zone.name}</h1>
          <p className="text-lg text-slate-300">{zone.description}</p>
        </div>

        <InteractiveZoneMap
          backgroundColor="bg-gradient-to-br from-red-900 via-orange-900 to-amber-800"
          hotspots={hotspots}
          zoneName={zone.name}
        />
      </div>

      <CryoBox
        isOpen={activePuzzle === 'cryobox'}
        onClose={() => setActivePuzzle(null)}
        correctCode={zone.puzzles.cryobox.solution}
        onSolve={() => handleSolvePuzzle(zone.puzzles.cryobox.id, zone.puzzles.cryobox.reward)}
      />

      <LiquidMixer
        isOpen={activePuzzle === 'mixer'}
        onClose={() => setActivePuzzle(null)}
        correctSequence={zone.puzzles.mixer.sequence}
        onSolve={() => handleSolvePuzzle(zone.puzzles.mixer.id, zone.puzzles.mixer.reward)}
      />

      <FinalCode
        isOpen={activePuzzle === 'final'}
        onClose={() => setActivePuzzle(null)}
        letters={zone.puzzles.final.letters}
        solution={zone.puzzles.final.solution}
        onSolve={() => handleSolvePuzzle(zone.puzzles.final.id, zone.puzzles.final.reward)}
      />
    </div>
  );
};
