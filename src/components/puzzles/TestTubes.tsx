import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import type { InventoryItem } from '@/lib/gameLogic';

interface TestTubesProps {
  isOpen: boolean;
  onClose: () => void;
  onSolve: () => void;
  addItem: (item: InventoryItem) => void;
}

const SOLUTION = [3, 7, 4, 2];
const TUBE_COLORS = [
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-amber-400 to-amber-600',
  'from-purple-400 to-purple-600'
];

export const TestTubes = ({ isOpen, onClose, onSolve, addItem }: TestTubesProps) => {
  const [levels, setLevels] = useState([0, 0, 0, 0]);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (isOpen && !solved) {
      setLevels([0, 0, 0, 0]);
    }
  }, [isOpen, solved]);

  useEffect(() => {
    if (JSON.stringify(levels) === JSON.stringify(SOLUTION) && !solved) {
      setSolved(true);
      toast.success('Niveaux corrects atteints !');
      addItem({
        id: 'test_tubes_note',
        name: 'Note : Niveaux 3-7-4-2',
        description: 'Note mystérieuse trouvée dans les fioles'
      });
      onSolve();
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [levels, solved, addItem, onSolve, onClose]);

  const handleAdjust = (tubeIndex: number, delta: number) => {
    setLevels(prev => {
      const newLevels = [...prev];
      newLevels[tubeIndex] = Math.max(0, Math.min(10, newLevels[tubeIndex] + delta));
      return newLevels;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <span>🧪</span>
            Fioles et tubes à essai
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>Ces fioles contiennent des échantillons critiques. Le Dr Morel a laissé des indices sur les niveaux précis requis.</p>
            <p className="text-sm font-medium">Déchiffrez les énigmes pour trouver le niveau de chaque fiole :</p>
          </DialogDescription>
        </DialogHeader>

        {/* Zone des énigmes */}
        <div className="grid grid-cols-4 gap-4 py-4 px-2 bg-secondary/50 rounded-lg">
          <div className="text-center space-y-1">
            <div className="text-2xl">🔷</div>
            <p className="text-xs font-medium">Les côtés d'un triangle</p>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl">🔷</div>
            <p className="text-xs font-medium">Les jours d'une semaine</p>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl">🔷</div>
            <p className="text-xs font-medium">Les points cardinaux</p>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl">🔷</div>
            <p className="text-xs font-medium">Une paire, un duo</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 py-6">
          {levels.map((level, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <div className="text-sm font-medium text-muted-foreground">
                Fiole {index + 1}
              </div>
              
              {/* Tube visuel */}
              <div className="relative w-16 h-64 bg-slate-800 rounded-lg border-2 border-slate-600 overflow-hidden">
                <div 
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${TUBE_COLORS[index]} transition-all duration-300`}
                  style={{ height: `${level * 10}%` }}
                />
                {/* Graduations */}
                {[...Array(11)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-slate-600/50"
                    style={{ bottom: `${i * 10}%` }}
                  />
                ))}
              </div>

              {/* Affichage du niveau */}
              <div className="text-xl font-bold text-white">
                {level}
              </div>

              {/* Boutons de contrôle */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAdjust(index, -1)}
                  disabled={level === 0 || solved}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAdjust(index, 1)}
                  disabled={level === 10 || solved}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {solved && (
          <div className="text-center text-green-400 font-semibold animate-pulse">
            ✓ Configuration correcte !
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};