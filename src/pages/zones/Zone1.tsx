import { useState } from 'react';
import { CaesarCipher } from '@/components/puzzles/CaesarCipher';
import { CodeLocker } from '@/components/puzzles/CodeLocker';
import { Dictaphone } from '@/components/puzzles/Dictaphone';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePuzzleSolver } from '@/hooks/usePuzzleSolver';
import { FileText, Lock, BookOpen, KeyRound, Mic } from 'lucide-react';
import enigmesData from '@/data/enigmes.json';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzIzMzg1QiIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIuMiIvPjwvZz48L3N2Zz4=')] opacity-20" />
      
      <div className="container mx-auto p-8 pt-32 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-blue-600">
              Zone 1
            </Badge>
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">{zone.name}</h1>
            <div className="max-w-2xl mx-auto p-4 bg-blue-950/50 backdrop-blur-sm rounded-lg border border-blue-500/30">
              <p className="text-lg text-blue-100">
                {zone.description}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 bg-slate-900/90 backdrop-blur-sm border-blue-500/30 hover:border-blue-500/60 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Chiffrement de César</h3>
                  </div>
                  {solvedPuzzles[zone.puzzles.caesar.id] && (
                    <Badge variant="default" className="bg-green-600">✓ Résolu</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300">Déchiffrez le carnet secret du Dr Morel</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <BookOpen className="h-4 w-4" />
                  <span>Cryptographie classique</span>
                </div>
                {!solvedPuzzles[zone.puzzles.caesar.id] && (
                  <Button onClick={() => setActivePuzzle('caesar')} className="w-full">
                    Examiner le carnet
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-slate-900/90 backdrop-blur-sm border-blue-500/30 hover:border-blue-500/60 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Casier sécurisé</h3>
                  </div>
                  {solvedPuzzles[zone.puzzles.locker.id] && (
                    <Badge variant="default" className="bg-green-600">✓ Résolu</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300">Trouvez le code à 4 chiffres pour accéder au badge</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <KeyRound className="h-4 w-4" />
                  <span>Code numérique</span>
                </div>
                {!solvedPuzzles[zone.puzzles.locker.id] && (
                  <Button onClick={() => setActivePuzzle('locker')} className="w-full">
                    Examiner le casier
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-slate-900/90 backdrop-blur-sm border-blue-500/30 hover:border-blue-500/60 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Mic className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Dictaphone</h3>
                  </div>
                  {solvedPuzzles[zone.puzzles.audio.id] && (
                    <Badge variant="default" className="bg-green-600">✓ Résolu</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300">Message enregistré du Dr Morel</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Mic className="h-4 w-4" />
                  <span>Indice audio crucial</span>
                </div>
                {!solvedPuzzles[zone.puzzles.audio.id] && (
                  <Button onClick={() => setActivePuzzle('audio')} className="w-full">
                    Écouter le message
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
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
