import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ColorTubesPuzzleProps {
  isOpen: boolean;
  onClose: () => void;
  onSolve: () => void;
  isSolved?: boolean;
}

type Color = 'red' | 'blue' | 'green' | null;

interface Tube {
  id: number;
  blocks: (Color & {})[];
}

const COLOR_LABELS: Record<string, string> = {
  red: 'Rouge',
  blue: 'Bleu',
  green: 'Vert',
};

const COLOR_CLASSES: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
};

// Configuration initiale - toujours résoluble
const INITIAL_STATE: Tube[] = [
  { id: 1, blocks: ['red', 'blue', 'green', 'red'] },
  { id: 2, blocks: ['green', 'red', 'blue', 'green'] },
  { id: 3, blocks: ['blue', 'green', 'red', 'blue'] },
  { id: 4, blocks: [] }
];

export const ColorTubesPuzzle = ({ isOpen, onClose, onSolve, isSolved = false }: ColorTubesPuzzleProps) => {
  const [tubes, setTubes] = useState<Tube[]>(INITIAL_STATE);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && !isSolved) {
      resetPuzzle();
    }
  }, [isOpen, isSolved]);

  const resetPuzzle = () => {
    setTubes(INITIAL_STATE.map(t => ({ ...t, blocks: [...t.blocks] })));
    setSelectedTube(null);
    setMoveCount(0);
  };

  const getTopBlock = (tube: Tube): Color => {
    if (tube.blocks.length === 0) return null;
    return tube.blocks[tube.blocks.length - 1];
  };

  const canPlaceBlock = (fromTube: Tube, toTube: Tube): boolean => {
    // Ne peut pas déplacer d'un tube vide
    if (fromTube.blocks.length === 0) return false;
    
    // Ne peut pas placer dans un tube plein
    if (toTube.blocks.length >= 4) return false;
    
    // Peut placer n'importe quel bloc dans n'importe quel tube non plein
    return true;
  };

  const checkWinCondition = (currentTubes: Tube[]): boolean => {
    let completedTubes = 0;
    
    for (const tube of currentTubes) {
      // Un tube est complété s'il contient 4 blocs de la même couleur
      if (tube.blocks.length === 4) {
        const firstColor = tube.blocks[0];
        if (tube.blocks.every(block => block === firstColor)) {
          completedTubes++;
        }
      }
    }
    
    // Victoire si 3 tubes sont complétés (un de chaque couleur)
    return completedTubes === 3;
  };

  const handleTubeClick = (tubeId: number) => {
    if (isSolved) return;

    const clickedTube = tubes.find(t => t.id === tubeId)!;

    if (selectedTube === null) {
      // Sélectionner un tube source (doit avoir des blocs)
      if (clickedTube.blocks.length > 0) {
        setSelectedTube(tubeId);
      } else {
        toast({
          title: "❌ Tube vide",
          description: "Vous ne pouvez pas sélectionner un tube vide.",
          variant: "destructive"
        });
      }
    } else if (selectedTube === tubeId) {
      // Désélectionner si on clique sur le même tube
      setSelectedTube(null);
    } else {
      // Tenter de déplacer le bloc
      const fromTube = tubes.find(t => t.id === selectedTube)!;
      const toTube = tubes.find(t => t.id === tubeId)!;

      if (canPlaceBlock(fromTube, toTube)) {
        const newTubes = tubes.map(tube => {
          if (tube.id === selectedTube) {
            return { ...tube, blocks: tube.blocks.slice(0, -1) };
          } else if (tube.id === tubeId) {
            const topBlock = getTopBlock(fromTube);
            return { ...tube, blocks: [...tube.blocks, topBlock] };
          }
          return tube;
        });

        setTubes(newTubes);
        setSelectedTube(null);
        setMoveCount(prev => prev + 1);

        // Vérifier la victoire
        if (checkWinCondition(newTubes)) {
          setTimeout(() => {
            toast({
              title: "✓ Échantillons triés !",
              description: `Félicitations ! Vous avez résolu le puzzle en ${moveCount + 1} coups.`,
            });
            onSolve();
          }, 300);
        }
      } else {
        toast({
          title: "❌ Mouvement invalide",
          description: "Le tube de destination est plein.",
          variant: "destructive"
        });
        setSelectedTube(null);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>🧪 Tri des échantillons biologiques</DialogTitle>
          <DialogDescription>
            Triez les échantillons colorés - chaque tube doit contenir une seule couleur
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isSolved ? (
            <div className="p-6 bg-green-500/10 border-2 border-green-500 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-500">✓ Validé</p>
              <p className="text-sm text-muted-foreground mt-2">Échantillons triés avec succès</p>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                <p className="font-semibold">📋 Règles :</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Cliquez sur un tube pour sélectionner le bloc du dessus</li>
                  <li>Cliquez sur un autre tube pour y déplacer le bloc</li>
                  <li>Vous pouvez placer n'importe quel bloc dans n'importe quel tube non plein</li>
                  <li>Objectif : 1 couleur par tube (4 blocs de la même couleur dans 3 tubes)</li>
                </ul>
                <p className="text-xs text-primary mt-2">Mouvements : {moveCount}</p>
              </div>

              {/* Tubes */}
              <div className="flex justify-center items-end gap-4 py-6">
                {tubes.map((tube) => (
                  <div
                    key={tube.id}
                    onClick={() => handleTubeClick(tube.id)}
                    className={`relative flex flex-col-reverse cursor-pointer transition-all ${
                      selectedTube === tube.id 
                        ? 'scale-110 ring-4 ring-primary rounded-lg' 
                        : 'hover:scale-105'
                    }`}
                  >
                    {/* Container du tube */}
                    <div className="w-16 h-48 bg-muted/30 border-4 border-border rounded-b-lg rounded-t-sm flex flex-col-reverse gap-1 p-1">
                      {tube.blocks.map((color, idx) => (
                        <div
                          key={`${tube.id}-${idx}`}
                          className={`w-full h-11 rounded ${COLOR_CLASSES[color]} border-2 border-border/50 transition-all animate-scale-in`}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        />
                      ))}
                    </div>
                    
                    {/* Label du tube */}
                    <div className="text-center text-xs font-mono text-muted-foreground mb-1">
                      Tube {tube.id}
                    </div>

                    {/* Indicateur de sélection */}
                    {selectedTube === tube.id && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                        👆
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={resetPuzzle} variant="outline" className="flex-1">
                  🔄 Recommencer
                </Button>
                <Button onClick={onClose} variant="secondary" className="flex-1">
                  Fermer
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
