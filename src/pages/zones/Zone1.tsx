import { useState } from 'react';
import { CaesarCipher } from '@/components/puzzles/CaesarCipher';
import { CodeLocker } from '@/components/puzzles/CodeLocker';
import { Dictaphone } from '@/components/puzzles/Dictaphone';
import { InteractiveZoneMap } from '@/components/zones/InteractiveZoneMap';
import { DoorPadlock } from '@/components/game/DoorPadlock';
import { DistractorModal } from '@/components/game/DistractorModal';
import { usePuzzleSolver } from '@/hooks/usePuzzleSolver';
import enigmesData from '@/data/enigmes.json';
import zone1Background from '@/assets/zone1-bg.png';

interface Zone1Props {
  sessionCode: string;
  session: any;
}

export const Zone1 = ({ sessionCode, session }: Zone1Props) => {
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const [showDoorPadlock, setShowDoorPadlock] = useState(false);
  const zone = (enigmesData.zones as any).zone1;
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
      id: 'caesar',
      x: 50,
      y: 50,
      label: 'Le Carnet',
      icon: '📖',
      solved: !!solvedPuzzles[zone.puzzles.caesar.id],
      onClick: () => setActivePuzzle('caesar')
    },
    {
      id: 'locker',
      x: 76,
      y: 13,
      label: 'Le Casier',
      icon: '🔒',
      solved: !!solvedPuzzles[zone.puzzles.locker.id],
      onClick: () => setActivePuzzle('locker')
    },
    {
      id: 'audio',
      x: 35,
      y: 25,
      label: 'Le Dictaphone',
      icon: '🎙️',
      solved: !!solvedPuzzles[zone.puzzles.audio.id],
      onClick: () => setActivePuzzle('audio')
    },
    // Distracteurs
    {
      id: 'control-panel',
      x: 15,
      y: 65,
      label: 'Panneau de contrôle',
      icon: '🖥️',
      solved: false,
      onClick: () => setActivePuzzle('control-panel')
    },
    {
      id: 'old-computer',
      x: 85,
      y: 60,
      label: 'Ordinateur ancien',
      icon: '💻',
      solved: false,
      onClick: () => setActivePuzzle('old-computer')
    },
    {
      id: 'empty-safe',
      x: 20,
      y: 80,
      label: 'Petit coffre',
      icon: '📦',
      solved: false,
      onClick: () => setActivePuzzle('empty-safe')
    },
    {
      id: 'dusty-files',
      x: 70,
      y: 75,
      label: 'Archives poussiéreuses',
      icon: '📚',
      solved: false,
      onClick: () => setActivePuzzle('dusty-files')
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

        {/* Bouton pour accéder au cadenas de la porte */}
        {doorVisible.zone1 && doorStatus.zone1 === 'locked' && (
          <div className="text-center animate-fade-in">
            <button
              onClick={() => setShowDoorPadlock(true)}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              🔐 Déverrouiller la Porte de Zone 2
            </button>
          </div>
        )}
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

      {/* Distracteurs */}
      <DistractorModal
        isOpen={activePuzzle === 'control-panel'}
        onClose={() => setActivePuzzle(null)}
        title="Panneau de contrôle"
        icon="🖥️"
        content="Les écrans affichent des données obsolètes datant de plusieurs années. Les boutons ne répondent plus."
      />
      
      <DistractorModal
        isOpen={activePuzzle === 'old-computer'}
        onClose={() => setActivePuzzle(null)}
        title="Ordinateur ancien"
        icon="💻"
        content="L'ordinateur est hors service. Un message d'erreur clignote : 'SYSTÈME CORROMPU - RÉCUPÉRATION IMPOSSIBLE'."
      />
      
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
        content="Des dossiers anciens contenant des rapports d'expériences passées. Rien de pertinent pour votre mission actuelle."
      />
    </div>
  );
};
