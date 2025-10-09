import { useState } from 'react';
import { DNASequence } from '@/components/puzzles/DNASequence';
import { Microscope } from '@/components/puzzles/Microscope';
import { PeriodicTable } from '@/components/puzzles/PeriodicTable';
import { ColorTubesPuzzle } from '@/components/puzzles/ColorTubesPuzzle';
import { InteractiveZoneMap } from '@/components/zones/InteractiveZoneMap';
import { DoorPadlock } from '@/components/game/DoorPadlock';
import { DistractorModal } from '@/components/game/DistractorModal';
import { usePuzzleSolver } from '@/hooks/usePuzzleSolver';
import enigmesData from '@/data/enigmes.json';
import zone2Background from '@/assets/zone2-bg.png';

interface Zone2Props {
  sessionCode: string;
  session: any;
  playerPseudo?: string;
}

export const Zone2 = ({ sessionCode, session, playerPseudo = '' }: Zone2Props) => {
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const [showDoorPadlock, setShowDoorPadlock] = useState(false);
  const zone = (enigmesData.zones as any).zone2;
  const solvedPuzzles = session.solved_puzzles || {};
  const revealedHints = session.revealed_hints || { zone1: [], zone2: [], zone3: [] };
  const doorVisible = session.door_visible || { zone1: false, zone2: false, zone3: false };
  const doorStatus = session.door_status || { zone1: 'locked', zone2: 'locked', zone3: 'locked' };
  const doorCodes = session.door_codes || {};
  const { solvePuzzle } = usePuzzleSolver(sessionCode, playerPseudo);
  const samplesId = zone.puzzles.samples?.id || 'zone2_samples';

  const handleSolvePuzzle = async (puzzleId: string) => {
    await solvePuzzle(puzzleId);
    setActivePuzzle(null);
  };

  // Hotspots pour les énigmes principales (restent visibles, marqués solved quand résolus)
  const puzzleHotspots = [
    {
      id: 'dna',
      x: 35,
      y: 50,
      label: 'Séquence ADN',
      icon: '🧬',
      solved: !!solvedPuzzles[zone.puzzles.dna.id],
      onClick: () => setActivePuzzle('dna')
    },
    {
      id: 'microscope',
      x: 29,
      y: 20,
      label: 'Microscope UV',
      icon: '🔬',
      solved: !!solvedPuzzles[zone.puzzles.microscope.id],
      onClick: () => setActivePuzzle('microscope')
    },
    {
      id: 'periodic',
      x: 50,
      y: 15,
      label: 'Tableau périodique',
      icon: '⚗️',
      solved: !!solvedPuzzles[zone.puzzles.periodic.id],
      onClick: () => setActivePuzzle('periodic')
    },
    {
      id: 'samples',
      x: 15,
      y: 75,
      label: 'Tri des échantillons',
      icon: '🧪',
      solved: !!solvedPuzzles[samplesId],
      onClick: () => setActivePuzzle('samples')
    }
  ];

  // Distracteurs
  const distractorHotspots = [
    {
      id: 'monitor',
      x:90,
      y: 95,
      label: 'Écran de monitoring',
      icon: '📊',
      solved: false,
      onClick: () => setActivePuzzle('monitor')
    },
    {
      id: 'notes',
      x: 53.5,
      y: 55,
      label: 'Notes de laboratoire',
      icon: '📝',
      solved: false,
      onClick: () => setActivePuzzle('notes')
    },
    {
      id: 'centrifuge',
      x: 18,
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
    x: 76,
    y: 13,
    label: 'Porte vers Zone 3',
    icon: '🚪',
    solved: false,
    isDoor: true,
    onClick: () => setShowDoorPadlock(true)
  }] : [];

  const hotspots = [...puzzleHotspots, ...distractorHotspots, ...doorHotspot];

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
        isSolved={!!solvedPuzzles[zone.puzzles.dna.id]}
      />

      <Microscope
        isOpen={activePuzzle === 'microscope'}
        onClose={() => setActivePuzzle(null)}
        onSolve={() => handleSolvePuzzle(zone.puzzles.microscope.id)}
        isSolved={!!solvedPuzzles[zone.puzzles.microscope.id]}
      />

      <PeriodicTable
        isOpen={activePuzzle === 'periodic'}
        onClose={() => setActivePuzzle(null)}
        equations={zone.puzzles.periodic.equations}
        halfFormula={zone.puzzles.periodic.halfFormula}
        onSolve={() => handleSolvePuzzle(zone.puzzles.periodic.id)}
        isSolved={!!solvedPuzzles[zone.puzzles.periodic.id]}
      />

      <ColorTubesPuzzle
        isOpen={activePuzzle === 'samples'}
        onClose={() => setActivePuzzle(null)}
        onSolve={() => handleSolvePuzzle(samplesId)}
        isSolved={!!solvedPuzzles[samplesId]}
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
        content={
          <div className="space-y-2">
            <p>
              Nous sommes le <strong>10 octobre 2025</strong>, j'ai prélevé des échantillons du virus <strong>VX-9</strong> sur le sujet. J'ai fait des tests en mettant ce virus dans <strong>1 mol d'acide chlorhydrique</strong>, échec du test, le virus à survécu.
            </p>
            <p>
              Nous devons l'éradiquer, c'était une erreur.. j'ai pris <strong>4 gouttes de pétrole brut</strong> et j'ai observe sa réaction avec le virus au microscope, le virus s'est développé environ <strong>2 fois plus vite</strong> que dans l'acide, et <strong>5 fois plus vite</strong> dans le sang et les cellules, y'a t-il une solution pour en venir à bout.. Je n'aurais pas du...
            </p>
          </div>
        }
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
