import { useState } from 'react';
import { DNASequence } from '@/components/puzzles/DNASequence';
import { Microscope } from '@/components/puzzles/Microscope';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import enigmesData from '@/data/enigmes.json';

interface Zone2Props {
  sessionCode: string;
  session: any;
}

export const Zone2 = ({ sessionCode, session }: Zone2Props) => {
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const zone = (enigmesData.zones as any).zone2;
  const solvedPuzzles = session.solved_puzzles || {};

  return (
    <div className="container mx-auto p-8 pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Zone 2
          </Badge>
          <h1 className="text-4xl font-bold text-primary">{zone.name}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {zone.description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Reconstruction ADN</h3>
                {solvedPuzzles[zone.puzzles.dna.id] && (
                  <Badge variant="default">✓ Résolu</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Reconstituez la séquence ADN</p>
              {!solvedPuzzles[zone.puzzles.dna.id] && (
                <Button onClick={() => setActivePuzzle('dna')}>
                  Examiner
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Microscope UV</h3>
                {solvedPuzzles[zone.puzzles.microscope.id] && (
                  <Badge variant="default">✓ Résolu</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Analysez l'échantillon</p>
              {!solvedPuzzles[zone.puzzles.microscope.id] && (
                <Button onClick={() => setActivePuzzle('microscope')}>
                  Examiner
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <DNASequence
        isOpen={activePuzzle === 'dna'}
        onClose={() => setActivePuzzle(null)}
        correctSequence={zone.puzzles.dna.sequence}
        onSolve={() => {}}
      />

      <Microscope
        isOpen={activePuzzle === 'microscope'}
        onClose={() => setActivePuzzle(null)}
        onSolve={() => {}}
      />
    </div>
  );
};
