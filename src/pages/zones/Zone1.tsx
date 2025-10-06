import { useState } from 'react';
import { CaesarCipher } from '@/components/puzzles/CaesarCipher';
import { CodeLocker } from '@/components/puzzles/CodeLocker';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import enigmesData from '@/data/enigmes.json';

interface Zone1Props {
  sessionCode: string;
  session: any;
}

export const Zone1 = ({ sessionCode, session }: Zone1Props) => {
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const zone = (enigmesData.zones as any).zone1;
  const solvedPuzzles = session.solved_puzzles || {};

  return (
    <div className="container mx-auto p-8 pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Zone 1
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
                <h3 className="text-xl font-bold">Chiffrement de César</h3>
                {solvedPuzzles[zone.puzzles.caesar.id] && (
                  <Badge variant="default">✓ Résolu</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Déchiffrez le carnet du Dr Morel</p>
              {!solvedPuzzles[zone.puzzles.caesar.id] && (
                <Button onClick={() => setActivePuzzle('caesar')}>
                  Examiner
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Casier sécurisé</h3>
                {solvedPuzzles[zone.puzzles.locker.id] && (
                  <Badge variant="default">✓ Résolu</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Trouvez le code à 4 chiffres</p>
              {!solvedPuzzles[zone.puzzles.locker.id] && (
                <Button onClick={() => setActivePuzzle('locker')}>
                  Examiner
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <CaesarCipher
        isOpen={activePuzzle === 'caesar'}
        onClose={() => setActivePuzzle(null)}
        encryptedText={zone.puzzles.caesar.encrypted}
        correctKey={zone.puzzles.caesar.key}
        onSolve={() => {}}
      />

      <CodeLocker
        isOpen={activePuzzle === 'locker'}
        onClose={() => setActivePuzzle(null)}
        correctCode={zone.puzzles.locker.code}
        onSolve={() => {}}
      />
    </div>
  );
};
