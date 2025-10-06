import { useState } from 'react';
import { DNASequence } from '@/components/puzzles/DNASequence';
import { Microscope } from '@/components/puzzles/Microscope';
import { PeriodicTable } from '@/components/puzzles/PeriodicTable';
import { InteractiveZoneMap } from '@/components/zones/InteractiveZoneMap';
import { usePuzzleSolver } from '@/hooks/usePuzzleSolver';
import enigmesData from '@/data/enigmes.json';

interface Zone2Props {
  sessionCode: string;
  session: any;
}

export const Zone2 = ({ sessionCode, session }: Zone2Props) => {
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const zone = (enigmesData.zones as any).zone2;
  const solvedPuzzles = session.solved_puzzles || {};
  const { solvePuzzle } = usePuzzleSolver(sessionCode);

  const handleSolvePuzzle = async (puzzleId: string, reward: string) => {
    await solvePuzzle(puzzleId, reward);
    setActivePuzzle(null);
  };

  const hotspots = [
    {
      id: 'dna',
      x: 25,
      y: 45,
      label: 'Séquence ADN',
      icon: '🧬',
      solved: !!solvedPuzzles[zone.puzzles.dna.id],
      onClick: () => setActivePuzzle('dna')
    },
    {
      id: 'microscope',
      x: 50,
      y: 35,
      label: 'Microscope UV',
      icon: '🔬',
      solved: !!solvedPuzzles[zone.puzzles.microscope.id],
      onClick: () => setActivePuzzle('microscope')
    },
    {
      id: 'periodic',
      x: 75,
      y: 55,
      label: 'Tableau périodique',
      icon: '⚗️',
      solved: !!solvedPuzzles[zone.puzzles.periodic.id],
      onClick: () => setActivePuzzle('periodic')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-slate-950 p-4">
      <div className="max-w-6xl mx-auto space-y-6 pt-24">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">{zone.name}</h1>
          <p className="text-lg text-slate-300">{zone.description}</p>
        </div>

        <InteractiveZoneMap
          backgroundColor="bg-gradient-to-br from-emerald-900 via-green-900 to-teal-800"
          hotspots={hotspots}
          zoneName={zone.name}
        />
      </div>

      <DNASequence
        isOpen={activePuzzle === 'dna'}
        onClose={() => setActivePuzzle(null)}
        correctSequence={zone.puzzles.dna.sequence}
        onSolve={() => handleSolvePuzzle(zone.puzzles.dna.id, zone.puzzles.dna.reward)}
      />

      <Microscope
        isOpen={activePuzzle === 'microscope'}
        onClose={() => setActivePuzzle(null)}
        onSolve={() => handleSolvePuzzle(zone.puzzles.microscope.id, zone.puzzles.microscope.reward)}
      />

      <PeriodicTable
        isOpen={activePuzzle === 'periodic'}
        onClose={() => setActivePuzzle(null)}
        equations={zone.puzzles.periodic.equations}
        halfFormula={zone.puzzles.periodic.halfFormula}
        onSolve={() => handleSolvePuzzle(zone.puzzles.periodic.id, zone.puzzles.periodic.reward)}
      />
    </div>
  );
};
