import { useState } from 'react';
import { DNASequence } from '@/components/puzzles/DNASequence';
import { Microscope } from '@/components/puzzles/Microscope';
import { PeriodicTable } from '@/components/puzzles/PeriodicTable';
import { InteractiveZoneMap } from '@/components/zones/InteractiveZoneMap';
import { DoorPadlock } from '@/components/game/DoorPadlock';
import { usePuzzleSolver } from '@/hooks/usePuzzleSolver';
import enigmesData from '@/data/enigmes.json';

interface Zone2Props {
  sessionCode: string;
  session: any;
}

export const Zone2 = ({ sessionCode, session }: Zone2Props) => {
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const [showDoorPadlock, setShowDoorPadlock] = useState(false);
  const zone = (enigmesData.zones as any).zone2;
  const solvedPuzzles = session.solved_puzzles || {};
  const revealedHints = session.revealed_hints || { zone1: [], zone2: [], zone3: [] };
  const doorVisible = session.door_visible || { zone1: false, zone2: false, zone3: false };
  const doorStatus = session.door_status || { zone1: 'locked', zone2: 'locked', zone3: 'locked' };
  const doorCodes = session.door_codes || {};
  const { solvePuzzle } = usePuzzleSolver(sessionCode);

  const handleSolvePuzzle = async (puzzleId: string) => {
    await solvePuzzle(puzzleId);
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

        {/* Bouton pour accéder au cadenas de la porte */}
        {doorVisible.zone2 && doorStatus.zone2 === 'locked' && (
          <div className="text-center animate-fade-in">
            <button
              onClick={() => setShowDoorPadlock(true)}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              🔐 Déverrouiller la Porte de Zone 3
            </button>
          </div>
        )}
      </div>

      <DNASequence
        isOpen={activePuzzle === 'dna'}
        onClose={() => setActivePuzzle(null)}
        correctSequence={zone.puzzles.dna.sequence}
        onSolve={() => handleSolvePuzzle(zone.puzzles.dna.id)}
      />

      <Microscope
        isOpen={activePuzzle === 'microscope'}
        onClose={() => setActivePuzzle(null)}
        onSolve={() => handleSolvePuzzle(zone.puzzles.microscope.id)}
      />

      <PeriodicTable
        isOpen={activePuzzle === 'periodic'}
        onClose={() => setActivePuzzle(null)}
        equations={zone.puzzles.periodic.equations}
        halfFormula={zone.puzzles.periodic.halfFormula}
        onSolve={() => handleSolvePuzzle(zone.puzzles.periodic.id)}
      />

      <DoorPadlock
        isOpen={showDoorPadlock}
        onClose={() => setShowDoorPadlock(false)}
        sessionCode={sessionCode}
        currentZone={2}
        doorCode={doorCodes.zone2 || ''}
        onUnlock={() => {
          setShowDoorPadlock(false);
        }}
      />
    </div>
  );
};
