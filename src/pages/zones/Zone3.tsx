import { useState } from 'react';
import { CryoBox } from '@/components/puzzles/CryoBox';
import { LiquidMixer } from '@/components/puzzles/LiquidMixer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import enigmesData from '@/data/enigmes.json';

interface Zone3Props {
  sessionCode: string;
  session: any;
}

export const Zone3 = ({ sessionCode, session }: Zone3Props) => {
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const zone = (enigmesData.zones as any).zone3;
  const solvedPuzzles = session.solved_puzzles || {};

  return (
    <div className="container mx-auto p-8 pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Zone 3
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
                <h3 className="text-xl font-bold">Coffre cryogénique</h3>
                {solvedPuzzles[zone.puzzles.cryobox.id] && (
                  <Badge variant="default">✓ Résolu</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Ouvrez le coffre</p>
              {!solvedPuzzles[zone.puzzles.cryobox.id] && (
                <Button onClick={() => setActivePuzzle('cryobox')}>
                  Examiner
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Synthèse du vaccin</h3>
                {solvedPuzzles[zone.puzzles.mixer.id] && (
                  <Badge variant="default">✓ Résolu</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Créez le vaccin</p>
              {!solvedPuzzles[zone.puzzles.mixer.id] && (
                <Button onClick={() => setActivePuzzle('mixer')}>
                  Examiner
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <CryoBox
        isOpen={activePuzzle === 'cryobox'}
        onClose={() => setActivePuzzle(null)}
        correctCode={zone.puzzles.cryobox.solution}
        onSolve={() => {}}
      />

      <LiquidMixer
        isOpen={activePuzzle === 'mixer'}
        onClose={() => setActivePuzzle(null)}
        correctSequence={zone.puzzles.mixer.sequence}
        onSolve={() => {}}
      />
    </div>
  );
};
