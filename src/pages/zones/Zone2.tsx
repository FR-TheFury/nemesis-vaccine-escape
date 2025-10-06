import { useState } from 'react';
import { DNASequence } from '@/components/puzzles/DNASequence';
import { Microscope } from '@/components/puzzles/Microscope';
import { PeriodicTable } from '@/components/puzzles/PeriodicTable';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePuzzleSolver } from '@/hooks/usePuzzleSolver';
import { Dna, MicroscopeIcon, TestTube, Atom, FlaskConical } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjIwIiBzdHJva2U9IiMwNjQxMjAiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iLjIiLz48L2c+PC9zdmc+')] opacity-20" />
      
      <div className="container mx-auto p-8 pt-32 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-green-600">
              Zone 2
            </Badge>
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">{zone.name}</h1>
            <div className="max-w-2xl mx-auto p-4 bg-green-950/50 backdrop-blur-sm rounded-lg border border-green-500/30">
              <p className="text-lg text-green-100">
                {zone.description}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 bg-slate-900/90 backdrop-blur-sm border-green-500/30 hover:border-green-500/60 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <Dna className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Reconstruction ADN</h3>
                  </div>
                  {solvedPuzzles[zone.puzzles.dna.id] && (
                    <Badge variant="default" className="bg-green-600">✓ Résolu</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300">Reconstituez la séquence génétique complète</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <TestTube className="h-4 w-4" />
                  <span>Biologie moléculaire</span>
                </div>
                {!solvedPuzzles[zone.puzzles.dna.id] && (
                  <Button onClick={() => setActivePuzzle('dna')} className="w-full bg-green-600 hover:bg-green-700">
                    Examiner l'échantillon
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-slate-900/90 backdrop-blur-sm border-green-500/30 hover:border-green-500/60 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <MicroscopeIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Microscope UV</h3>
                  </div>
                  {solvedPuzzles[zone.puzzles.microscope.id] && (
                    <Badge variant="default" className="bg-green-600">✓ Résolu</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300">Analysez l'échantillon sous lumière ultraviolette</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Atom className="h-4 w-4" />
                  <span>Analyse UV</span>
                </div>
                {!solvedPuzzles[zone.puzzles.microscope.id] && (
                  <Button onClick={() => setActivePuzzle('microscope')} className="w-full bg-green-600 hover:bg-green-700">
                    Utiliser le microscope
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-slate-900/90 backdrop-blur-sm border-green-500/30 hover:border-green-500/60 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <FlaskConical className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Tableau périodique</h3>
                  </div>
                  {solvedPuzzles[zone.puzzles.periodic.id] && (
                    <Badge variant="default" className="bg-green-600">✓ Résolu</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300">Résolvez les équations chimiques</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Atom className="h-4 w-4" />
                  <span>Chimie organique</span>
                </div>
                {!solvedPuzzles[zone.puzzles.periodic.id] && (
                  <Button onClick={() => setActivePuzzle('periodic')} className="w-full bg-green-600 hover:bg-green-700">
                    Analyser le tableau
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
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
