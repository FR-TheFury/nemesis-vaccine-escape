import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CryoBox } from '@/components/puzzles/CryoBox';
import { LiquidMixer } from '@/components/puzzles/LiquidMixer';
import { FinalCode } from '@/components/puzzles/FinalCode';
import { InteractiveZoneMap } from '@/components/zones/InteractiveZoneMap';
import { DoorPadlock } from '@/components/game/DoorPadlock';
import { DistractorModal } from '@/components/game/DistractorModal';
import { usePuzzleSolver } from '@/hooks/usePuzzleSolver';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import enigmesData from '@/data/enigmes.json';
import zone3Background from '@/assets/zone3-bg.png';

interface Zone3Props {
  sessionCode: string;
  session: any;
}

export const Zone3 = ({ sessionCode, session }: Zone3Props) => {
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const [showDoorPadlock, setShowDoorPadlock] = useState(false);
  const { toast } = useToast();
  const zone = (enigmesData.zones as any).zone3;
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
          toast({
            title: "🔒 Zone verrouillée",
            description: "Vous devez d'abord ouvrir le coffre cryogénique.",
            variant: "destructive",
          });
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
          toast({
            title: "🔒 Zone verrouillée",
            description: "Vous devez d'abord synthétiser le vaccin.",
            variant: "destructive",
          });
          return;
        }
        setActivePuzzle('final');
      }
    },
    // Distracteurs
    {
      id: 'terminal',
      x: 15,
      y: 35,
      label: 'Terminal sécurisé',
      icon: '🖥️',
      solved: false,
      onClick: () => setActivePuzzle('terminal')
    },
    {
      id: 'documents',
      x: 85,
      y: 65,
      label: 'Documents classifiés',
      icon: '📄',
      solved: false,
      onClick: () => setActivePuzzle('documents')
    },
    {
      id: 'scanner',
      x: 45,
      y: 25,
      label: 'Scanner biométrique',
      icon: '👁️',
      solved: false,
      onClick: () => setActivePuzzle('scanner')
    },
    {
      id: 'storage',
      x: 65,
      y: 75,
      label: 'Armoire frigorifique',
      icon: '🧊',
      solved: false,
      onClick: () => setActivePuzzle('storage')
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
          backgroundImage={zone3Background}
          backgroundColor="bg-gradient-to-br from-red-900 via-orange-900 to-amber-800"
          hotspots={hotspots}
          zoneName={zone.name}
        />

        {/* Bouton pour accéder au cadenas de la porte finale */}
        {doorVisible.zone3 && doorStatus.zone3 === 'locked' && (
          <div className="text-center animate-fade-in">
            <button
              onClick={() => setShowDoorPadlock(true)}
              className="px-8 py-4 bg-red-600 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              🏆 Déverrouiller la Mission Finale
            </button>
          </div>
        )}
      </div>

      <CryoBox
        isOpen={activePuzzle === 'cryobox'}
        onClose={() => setActivePuzzle(null)}
        correctCode={zone.puzzles.cryobox.solution}
        onSolve={() => handleSolvePuzzle(zone.puzzles.cryobox.id)}
      />

      <LiquidMixer
        isOpen={activePuzzle === 'mixer'}
        onClose={() => setActivePuzzle(null)}
        correctSequence={zone.puzzles.mixer.sequence}
        onSolve={() => handleSolvePuzzle(zone.puzzles.mixer.id)}
      />

      <FinalCode
        isOpen={activePuzzle === 'final'}
        onClose={() => setActivePuzzle(null)}
        letters={zone.puzzles.final.letters}
        solution={zone.puzzles.final.solution}
        onSolve={() => handleSolvePuzzle(zone.puzzles.final.id)}
      />

      <DoorPadlock
        isOpen={showDoorPadlock}
        onClose={() => setShowDoorPadlock(false)}
        sessionCode={sessionCode}
        currentZone={3}
        doorCode={doorCodes.zone3 || ''}
        onUnlock={() => {
          setShowDoorPadlock(false);
        }}
      />

      {/* Distracteurs */}
      <DistractorModal
        isOpen={activePuzzle === 'terminal'}
        onClose={() => setActivePuzzle(null)}
        title="Terminal sécurisé"
        icon="🖥️"
        content="Le terminal demande une authentification de niveau 5. Message d'erreur : 'ACCÈS REFUSÉ - AUTORISATION INSUFFISANTE'."
      />
      
      <DistractorModal
        isOpen={activePuzzle === 'documents'}
        onClose={() => setActivePuzzle(null)}
        title="Documents classifiés"
        icon="📄"
        content="Des dossiers marqués 'TOP SECRET' contenant des rapports techniques incompréhensibles et des schémas floutés. Tout a été caviardé."
      />
      
      <DistractorModal
        isOpen={activePuzzle === 'scanner'}
        onClose={() => setActivePuzzle(null)}
        title="Scanner biométrique"
        icon="👁️"
        content="Le scanner rétinien ne s'active pas. Un écran affiche : 'SYSTÈME HORS LIGNE - CONTACTEZ L'ADMINISTRATEUR'."
      />
      
      <DistractorModal
        isOpen={activePuzzle === 'storage'}
        onClose={() => setActivePuzzle(null)}
        title="Armoire frigorifique"
        icon="🧊"
        content="L'armoire contient des échantillons gelés déjà catalogués et scellés. Aucun n'est pertinent pour votre mission actuelle."
      />
    </div>
  );
};
