import { useState } from 'react';
import { CaesarCipher } from '@/components/puzzles/CaesarCipher';
import { CodeLocker } from '@/components/puzzles/CodeLocker';
import { Dictaphone } from '@/components/puzzles/Dictaphone';
import { TestTubes } from '@/components/puzzles/TestTubes';
import { PuzzleBoard } from '@/components/puzzles/PuzzleBoard';
import { InteractiveZoneMap } from '@/components/zones/InteractiveZoneMap';
import { DoorPadlock } from '@/components/game/DoorPadlock';
import { DistractorModal } from '@/components/game/DistractorModal';
import { usePuzzleSolver } from '@/hooks/usePuzzleSolver';
import { useInventory } from '@/hooks/useInventory';
import enigmesData from '@/data/enigmes.json';
import zone1Background from '@/assets/zone1-bg.png';

interface Zone1Props {
  sessionCode: string;
  session: any;
  playerPseudo?: string;
}

export const Zone1 = ({ sessionCode, session, playerPseudo = '' }: Zone1Props) => {
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const [showDoorPadlock, setShowDoorPadlock] = useState(false);
  const zone = (enigmesData.zones as any).zone1;
  const solvedPuzzles = session.solved_puzzles || {};
  const revealedHints = session.revealed_hints || { zone1: [], zone2: [], zone3: [] };
  const doorVisible = session.door_visible || { zone1: false, zone2: false, zone3: false };
  const doorStatus = session.door_status || { zone1: 'locked', zone2: 'locked', zone3: 'locked' };
  const doorCodes = session.door_codes || {};
  const { solvePuzzle } = usePuzzleSolver(sessionCode, playerPseudo);
  const { addItem } = useInventory(sessionCode, session.inventory || [], playerPseudo);

  const handleSolvePuzzle = async (puzzleId: string) => {
    await solvePuzzle(puzzleId);
    setActivePuzzle(null);
  };

  // Hotspots des énigmes principales (restent visibles, marqués solved quand résolus)
  const puzzleHotspots = [
    {
      id: 'caesar',
      x: 58,
      y: 46,
      label: 'Le Carnet',
      icon: '📖',
      solved: solvedPuzzles['zone1_caesar'] || false,
      onClick: () => setActivePuzzle('caesar')
    },
    {
      id: 'audio',
      x: 39,
      y: 7,
      label: 'Le Dictaphone',
      icon: '🎙️',
      solved: solvedPuzzles['zone1_audio'] || false,
      onClick: () => setActivePuzzle('audio')
    }
  ];

  // Le casier apparaît si César est résolu et reste visible après
  const conditionalHotspots = [];
  if (solvedPuzzles['zone1_caesar']) {
    conditionalHotspots.push({
      id: 'locker',
      x: 88,
      y: 14,
      label: 'Le Casier',
      icon: '🔒',
      solved: !!solvedPuzzles['zone1_locker'],
      onClick: () => setActivePuzzle('locker')
    });
  }

  // Mini-jeux et distracteurs (restent visibles, marqués solved quand résolus)
  const distractorHotspots = [
    {
      id: 'puzzle',
      x: 69.5,
      y: 45,
      label: 'Panneau de contrôle',
      icon: '🖥️',
      solved: !!solvedPuzzles['zone1_puzzle'],
      onClick: () => setActivePuzzle('puzzle')
    },
    {
      id: 'test-tubes',
      x: 72,
      y: 85,
      label: 'Fioles et tubes à essai',
      icon: '🧪',
      solved: !!solvedPuzzles['zone1_test_tubes'],
      onClick: () => setActivePuzzle('test-tubes')
    },
    {
      id: 'empty-safe',
      x: 13,
      y: 54,
      label: 'Petit coffre',
      icon: '📦',
      solved: false,
      onClick: () => setActivePuzzle('empty-safe')
    },
    {
      id: 'dusty-files',
      x: 39.5,
      y: 80,
      label: 'Archives poussiéreuses',
      icon: '📚',
      solved: false,
      onClick: () => setActivePuzzle('dusty-files')
    }
  ];

  // Hotspot de la porte (toujours visible sauf si déverrouillée)
  const doorHotspot = doorStatus.zone1 === 'locked' ? [{
    id: 'door',
    x: 76,
    y: 13,
    label: 'Porte vers Zone 2',
    icon: '🚪',
    solved: false,
    isDoor: true,
    onClick: () => setShowDoorPadlock(true)
  }] : [];

  // Combiner tous les hotspots visibles
  const hotspots = [...puzzleHotspots, ...conditionalHotspots, ...distractorHotspots, ...doorHotspot];

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
        onSolve={() => handleSolvePuzzle(zone.puzzles.caesar.id)}
      />

      <CodeLocker
        isOpen={activePuzzle === 'locker'}
        onClose={() => setActivePuzzle(null)}
        correctCode={zone.puzzles.locker.code}
        onSolve={() => handleSolvePuzzle(zone.puzzles.locker.id)}
        addItem={addItem}
      />

      <Dictaphone
        isOpen={activePuzzle === 'audio'}
        onClose={() => setActivePuzzle(null)}
        transcript={zone.puzzles.audio.transcript}
        onSolve={() => handleSolvePuzzle(zone.puzzles.audio.id)}
      />

      <DoorPadlock
        isOpen={showDoorPadlock}
        onClose={() => setShowDoorPadlock(false)}
        sessionCode={sessionCode}
        currentZone={1}
        doorCode={doorCodes.zone1 || ''}
        onUnlock={() => {
          setShowDoorPadlock(false);
        }}
      />

      {/* Mini-jeux */}
      <TestTubes
        isOpen={activePuzzle === 'test-tubes'}
        onClose={() => setActivePuzzle(null)}
        onSolve={() => handleSolvePuzzle('zone1_test_tubes')}
        addItem={addItem}
      />

      <PuzzleBoard
        isOpen={activePuzzle === 'puzzle'}
        onClose={() => setActivePuzzle(null)}
        onSolve={() => handleSolvePuzzle('zone1_puzzle')}
        addItem={addItem}
      />
      
      {/* Distracteurs simples */}
      <DistractorModal
        isOpen={activePuzzle === 'empty-safe'}
        onClose={() => setActivePuzzle(null)}
        title="Petit coffre"
        icon="📦"
        content="Le coffre est ouvert et complètement vide. On dirait qu'il a été vidé il y a longtemps."
      />
      
      <DistractorModal
        isOpen={activePuzzle === 'dusty-files'}
        onClose={() => setActivePuzzle(null)}
        title="Archives poussiéreuses"
        icon="📚"
        content={
          <div className="space-y-2">
            <p>
              Nous sommes le <strong>8 octobre 2025</strong>, je reviens de la salle de confinement numéro <strong>6</strong> où le <strong>patient 0</strong> contaminé par le <strong>VX-9</strong> a été confiné.
            </p>
            <p>
              Suite à la première infection, l'apparition des symptômes est très rapide, selon mes notes, il s'agit de <strong>quelques jours</strong> tout au plus.
            </p>
            <p>
              Les symptômes sont les suivants : <strong>fièvre</strong>, <strong>démence</strong>, <strong>saignement des yeux et du nez</strong>, <strong>jaunisse</strong>.
            </p>
            <p>
              Au vu des symptômes, l'espérance de vie du sujet est de <strong>3 jours</strong>. Je vais continuer de l'étudier pour mettre au point un <strong>vaccin</strong>.
            </p>
          </div>
        }
      />
    </div>
  );
};
