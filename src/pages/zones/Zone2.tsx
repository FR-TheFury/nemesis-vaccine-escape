import { useState } from 'react';
import { DNASequence } from '@/components/puzzles/DNASequence';
import { Microscope } from '@/components/puzzles/Microscope';
import { PeriodicTable } from '@/components/puzzles/PeriodicTable';
import { InteractiveZoneMap } from '@/components/zones/InteractiveZoneMap';
import { DoorPadlock } from '@/components/game/DoorPadlock';
import { DistractorModal } from '@/components/game/DistractorModal';
import { usePuzzleSolver } from '@/hooks/usePuzzleSolver';
import enigmesData from '@/data/enigmes.json';
import zone2Background from '@/assets/zone2-bg.png';

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

  // Hotspots pour les énigmes principales
  const puzzleHotspots = [
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

  // Distracteurs
  const distractorHotspots = [
    {
      id: 'samples',
      x: 15,
      y: 65,
      label: 'Échantillons',
      icon: '🧪',
      solved: false,
      onClick: () => setActivePuzzle('samples')
    },
    {
      id: 'monitor',
      x: 85,
      y: 40,
      label: 'Écran de monitoring',
      icon: '📊',
      solved: false,
      onClick: () => setActivePuzzle('monitor')
    },
    {
      id: 'notes',
      x: 40,
      y: 70,
      label: 'Notes de laboratoire',
      icon: '📝',
      solved: false,
      onClick: () => setActivePuzzle('notes')
    },
    {
      id: 'centrifuge',
      x: 65,
      y: 25,
      label: 'Centrifugeuse',
      icon: '⚙️',
      solved: false,
      onClick: () => setActivePuzzle('centrifuge')
    }
  ];

  // Hotspot de la porte
  const doorHotspot = doorVisible.zone2 && doorStatus.zone2 === 'locked' ? [{
    id: 'door',
    x: 50,
    y: 85,
    label: 'Porte vers Zone 3',
    icon: '🚪',
    solved: false,
    isDoor: true,
    onClick: () => setShowDoorPadlock(true)
  }] : [];

  const hotspots = doorVisible.zone2 
    ? doorHotspot 
    : [...puzzleHotspots, ...distractorHotspots];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-slate-950 p-4">
      <div className="max-w-6xl mx-auto space-y-6 pt-24">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">{zone.name}</h1>
          <p className="text-lg text-slate-300">{zone.description}</p>
        </div>

        <InteractiveZoneMap
          backgroundImage={zone2Background}
          backgroundColor="bg-gradient-to-br from-emerald-900 via-green-900 to-teal-800"
          hotspots={hotspots}
          zoneName={zone.name}
        />
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

      {/* Distracteurs */}
      <DistractorModal
        isOpen={activePuzzle === 'samples'}
        onClose={() => setActivePuzzle(null)}
        title="Échantillons biologiques"
        icon="🧪"
        content="Des tubes à essai contenant des échantillons déjà analysés. Les étiquettes indiquent 'Traitement terminé - Archivé'."
      />
      
      <DistractorModal
        isOpen={activePuzzle === 'monitor'}
        onClose={() => setActivePuzzle(null)}
        title="Écran de monitoring"
        icon="📊"
        content="L'écran affiche des graphiques de température et d'humidité de la pièce. Tout semble dans les normes, mais aucune information utile."
      />
      
      <DistractorModal
        isOpen={activePuzzle === 'notes'}
        onClose={() => setActivePuzzle(null)}
        title="Notes de laboratoire"
        icon="📝"
        content="Un cahier rempli de notes manuscrites illisibles et de schémas incompréhensibles. Les pages sont jaunies et datent de plusieurs années."
      />
      
      <DistractorModal
        isOpen={activePuzzle === 'centrifuge'}
        onClose={() => setActivePuzzle(null)}
        title="Centrifugeuse"
        icon="⚙️"
        content="La centrifugeuse est vide et hors tension. Un autocollant indique 'EN MAINTENANCE - NE PAS UTILISER'."
      />
    </div>
  );
};
