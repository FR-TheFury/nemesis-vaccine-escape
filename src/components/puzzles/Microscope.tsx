import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface MicroscopeProps {
  isOpen: boolean;
  onClose: () => void;
  onSolve: () => void;
  isSolved?: boolean;
}

// Génère une séquence aléatoire de lettres
const generateRandomSequence = (length: number): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let sequence = '';
  for (let i = 0; i < length; i++) {
    sequence += letters[Math.floor(Math.random() * letters.length)];
  }
  return sequence;
};

// Applique le décalage de César (delta)
const applyDelta = (text: string, delta: number): string => {
  return text
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) { // A-Z
        return String.fromCharCode(((code - 65 + delta) % 26) + 65);
      }
      return char;
    })
    .join('');
};

// Extrait les positions spécifiées (1-indexed)
const extractPositions = (text: string, positions: number[]): string => {
  return positions.map(pos => text[pos - 1] || '').join('');
};

export const Microscope = ({ isOpen, onClose, onSolve, isSolved = false }: MicroscopeProps) => {
  const [uvActive, setUvActive] = useState(false);
  const [sequenceRevealed, setSequenceRevealed] = useState(false);
  const [originalSequence, setOriginalSequence] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const { toast } = useToast();

  const DELTA = 7;
  const POSITIONS = [3, 6, 9];
  const EXPECTED_RESULT = 'BIO';

  // Génère une séquence qui, après transformation, donnera "BIO" aux positions 3, 6, 9
  useEffect(() => {
    if (isOpen && !originalSequence) {
      // On génère une séquence de 12 lettres aléatoires
      let sequence = generateRandomSequence(12);
      
      // On s'assure que les positions 3, 6, 9 après décalage de -7 donnent B, I, O
      const targetChars = ['B', 'I', 'O'];
      POSITIONS.forEach((pos, idx) => {
        // Pour obtenir targetChar après +7, il faut mettre targetChar-7
        const targetChar = targetChars[idx];
        const charCode = targetChar.charCodeAt(0);
        const originalChar = String.fromCharCode(((charCode - 65 - DELTA + 26) % 26) + 65);
        sequence = sequence.substring(0, pos - 1) + originalChar + sequence.substring(pos);
      });
      
      setOriginalSequence(sequence);
    }
  }, [isOpen, originalSequence]);

  const handleUvActivation = () => {
    setUvActive(true);
    setTimeout(() => {
      setSequenceRevealed(true);
      toast({
        title: "💡 Séquence révélée !",
        description: "Des lettres apparaissent sous UV...",
      });
    }, 1000);
  };

  const handleSubmit = () => {
    if (userAnswer.toUpperCase() === EXPECTED_RESULT) {
      toast({
        title: "✓ Code déchiffré !",
        description: `Vous avez trouvé "${EXPECTED_RESULT}" ! Clé numérique Δ=${DELTA} révélée !`,
      });
      onSolve();
      handleReset();
    } else {
      toast({
        title: "❌ Incorrect",
        description: "Ce n'est pas la bonne réponse. Appliquez le décalage Δ et extrayez les bonnes positions.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setUvActive(false);
    setSequenceRevealed(false);
    setOriginalSequence('');
    setUserAnswer('');
    onClose();
  };

  const decodedSequence = originalSequence ? applyDelta(originalSequence, DELTA) : '';
  const result = decodedSequence ? extractPositions(decodedSequence, POSITIONS) : '';

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🔬 Microscope UV haute résolution</DialogTitle>
          <DialogDescription>
            Activez le mode UV pour révéler une séquence cachée
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {isSolved ? (
            <div className="p-6 bg-green-500/10 border-2 border-green-500 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-500">✓ Validé</p>
              <p className="text-sm text-muted-foreground mt-2">Cette énigme a déjà été résolue</p>
            </div>
          ) : (
            <>
              {/* Zone d'observation */}
              <div className="relative h-64 bg-muted rounded-md overflow-hidden border-4 border-border">
                {/* Échantillon de base */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 opacity-50" />
                </div>

                {/* Effet UV */}
                {uvActive && (
                  <div className="absolute inset-0 bg-purple-500/30 animate-pulse" />
                )}

                {/* Séquence révélée */}
                {sequenceRevealed && originalSequence && (
                  <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                    <div className="bg-background/95 p-4 rounded-lg border-2 border-primary shadow-lg">
                      <div className="text-center space-y-2">
                        <p className="text-xs text-muted-foreground">Séquence détectée :</p>
                        <p className="text-2xl font-mono font-bold tracking-wider text-primary">
                          {originalSequence}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Indice : Appliquez Δ={DELTA}, extrayez positions {POSITIONS.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contrôles */}
              {!uvActive ? (
                <Button onClick={handleUvActivation} className="w-full">
                  🔦 Activer mode UV
                </Button>
              ) : !sequenceRevealed ? (
                <p className="text-center text-sm text-primary font-bold animate-pulse">
                  Analyse en cours...
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Input du joueur */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Étape 3 : Extrayez les positions {POSITIONS.join(', ')}
                    </label>
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
                      placeholder="Entrez les 3 lettres..."
                      maxLength={3}
                      className="text-center text-xl font-mono"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSubmit} className="flex-1">
                      Valider
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="flex-1">
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
