import { useState } from 'react';
import { CryoBox } from '@/components/puzzles/CryoBox';
import { LiquidMixer } from '@/components/puzzles/LiquidMixer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePuzzleSolver } from '@/hooks/usePuzzleSolver';
import { Snowflake, TestTube, AlertTriangle, Siren } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-orange-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNNTAgMEw1MCAxMDBNMCA1MEwxMDAgNTAiIHN0cm9rZT0iIzQ1MUEwMyIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIuMiIvPjwvZz48L3N2Zz4=')] opacity-20" />
      
      <div className="container mx-auto p-8 pt-32 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-red-600">
                Zone 3 - ALERTE CRITIQUE
              </Badge>
              <Siren className="h-6 w-6 text-red-500 animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">{zone.name}</h1>
            <div className="max-w-2xl mx-auto p-4 bg-red-950/50 backdrop-blur-sm rounded-lg border border-red-500/50 animate-pulse">
              <p className="text-lg text-red-100">
                {zone.description}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 bg-slate-900/90 backdrop-blur-sm border-red-500/30 hover:border-red-500/60 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600 rounded-lg">
                      <Snowflake className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Coffre cryogénique</h3>
                  </div>
                  {solvedPuzzles[zone.puzzles.cryobox.id] && (
                    <Badge variant="default" className="bg-green-600">✓ Résolu</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300">Déverrouillez le coffre avec la formule complète</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Système de sécurité niveau 5</span>
                </div>
                {!solvedPuzzles[zone.puzzles.cryobox.id] && (
                  <Button onClick={() => setActivePuzzle('cryobox')} className="w-full bg-red-600 hover:bg-red-700">
                    Accéder au coffre
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-slate-900/90 backdrop-blur-sm border-red-500/30 hover:border-red-500/60 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600 rounded-lg">
                      <TestTube className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Synthèse du vaccin</h3>
                  </div>
                  {solvedPuzzles[zone.puzzles.mixer.id] && (
                    <Badge variant="default" className="bg-green-600">✓ Résolu</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300">Créez le vaccin final en mélangeant les liquides</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <TestTube className="h-4 w-4" />
                  <span>Synthèse chimique finale</span>
                </div>
                {!solvedPuzzles[zone.puzzles.mixer.id] && (
                  <Button onClick={() => setActivePuzzle('mixer')} className="w-full bg-red-600 hover:bg-red-700">
                    Commencer la synthèse
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
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
    </div>
  );
};
