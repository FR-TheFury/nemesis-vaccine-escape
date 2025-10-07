import { useState } from 'react';
import { Lock, Unlock, AlertCircle, FlaskConical } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Éléments chimiques utilisés dans les codes
const CHEMICAL_ELEMENTS = [
  { symbol: 'H', name: 'Hydrogène', number: 1 },
  { symbol: 'He', name: 'Hélium', number: 2 },
  { symbol: 'Li', name: 'Lithium', number: 3 },
  { symbol: 'Be', name: 'Béryllium', number: 4 },
  { symbol: 'B', name: 'Bore', number: 5 },
  { symbol: 'C', name: 'Carbone', number: 6 },
  { symbol: 'N', name: 'Azote', number: 7 },
  { symbol: 'O', name: 'Oxygène', number: 8 },
  { symbol: 'F', name: 'Fluor', number: 9 },
  { symbol: 'Ne', name: 'Néon', number: 10 },
  { symbol: 'Na', name: 'Sodium', number: 11 },
  { symbol: 'Mg', name: 'Magnésium', number: 12 },
  { symbol: 'Al', name: 'Aluminium', number: 13 },
  { symbol: 'Si', name: 'Silicium', number: 14 },
  { symbol: 'P', name: 'Phosphore', number: 15 },
  { symbol: 'S', name: 'Soufre', number: 16 },
  { symbol: 'Cl', name: 'Chlore', number: 17 },
  { symbol: 'Ar', name: 'Argon', number: 18 },
  { symbol: 'Fe', name: 'Fer', number: 26 },
  { symbol: 'Cu', name: 'Cuivre', number: 29 },
  { symbol: 'Zn', name: 'Zinc', number: 30 },
  { symbol: 'Ag', name: 'Argent', number: 47 },
  { symbol: 'Au', name: 'Or', number: 79 },
  { symbol: 'Pb', name: 'Plomb', number: 82 },
];

// Charades par zone
const RIDDLES = {
  zone1: {
    riddle1: "Je suis le métal des rois et des pharaons, brillant et précieux. Mon numéro atomique ?",
    answer1: "Or (Au) - 79",
    riddle2: "Je suis l'élément principal de l'acier, forgé dans le feu. Mon numéro atomique ?",
    answer2: "Fer (Fe) - 26",
    solution: "Code: 79 + 26 = 7926"
  },
  zone2: {
    riddle1: "Je suis un métal alcalin, présent dans le sel de table. Mon numéro atomique ?",
    answer1: "Sodium (Na) - 11",
    riddle2: "Je suis un métal précieux, utilisé en bijouterie et photographie. Mon numéro atomique ?",
    answer2: "Argent (Ag) - 47",
    solution: "Code: 11 + 47 = 1147"
  },
  zone3: {
    riddle1: "Je suis un métal rougeâtre, excellent conducteur d'électricité. Mon numéro atomique ?",
    answer1: "Cuivre (Cu) - 29",
    riddle2: "Je suis un métal lourd, autrefois utilisé dans les peintures. Mon numéro atomique ?",
    answer2: "Plomb (Pb) - 82",
    solution: "Code: 29 + 82 = 2982"
  }
};

interface DoorPadlockProps {
  isOpen: boolean;
  onClose: () => void;
  sessionCode: string;
  currentZone: number;
  doorCode: string; // Le code correct pour cette porte
  onUnlock: () => void;
}

export const DoorPadlock = ({ 
  isOpen, 
  onClose, 
  sessionCode, 
  currentZone, 
  doorCode,
  onUnlock 
}: DoorPadlockProps) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer un code');
      return;
    }

    setIsValidating(true);
    setError('');

    // Normaliser les codes (enlever espaces, tirets)
    const normalizedInput = code.replace(/[\s-]/g, '').toUpperCase();
    const normalizedDoorCode = doorCode.replace(/[\s-]/g, '').toUpperCase();

    if (normalizedInput === normalizedDoorCode) {
      // Code correct !
      setIsSuccess(true);
      
      try {
        // Déverrouiller la porte et passer à la zone suivante
        const zoneKey = `zone${currentZone}`;
        
        const { data: session } = await supabase
          .from('sessions')
          .select('door_status, current_zone, status')
          .eq('code', sessionCode)
          .single();

        if (session) {
          const updatedDoorStatus = { 
            ...session.door_status as Record<string, string>, 
            [zoneKey]: 'unlocked' 
          };

          await supabase
            .from('sessions')
            .update({
              door_status: updatedDoorStatus,
              current_zone: currentZone === 3 ? 3 : currentZone + 1,
              status: currentZone === 3 ? 'completed' : session.status
            })
            .eq('code', sessionCode);

          toast.success('🎉 Code correct ! Accès à la zone suivante déverrouillé !');
          
          setTimeout(() => {
            onUnlock();
            onClose();
            setIsSuccess(false);
            setCode('');
          }, 2000);
        }
      } catch (err) {
        console.error('Error unlocking door:', err);
        toast.error('Erreur lors du déverrouillage');
        setIsValidating(false);
      }
    } else {
      // Code incorrect
      setError('Code incorrect. Vérifiez les indices et réessayez.');
      setIsValidating(false);
      
      // Animation shake
      const input = document.getElementById('door-code-input');
      if (input) {
        input.classList.add('animate-shake');
        setTimeout(() => input.classList.remove('animate-shake'), 500);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {isSuccess ? (
              <>
                <Unlock className="w-6 h-6 text-green-500" />
                Porte Déverrouillée !
              </>
            ) : (
              <>
                <Lock className="w-6 h-6 text-primary" />
                Déverrouiller la Porte - Zone {currentZone}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isSuccess 
              ? 'Accès accordé à la zone suivante !'
              : 'Résolvez les charades pour trouver les éléments et composer le code.'
            }
          </DialogDescription>
        </DialogHeader>

        {!isSuccess && (
          <Tabs defaultValue="riddles" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="riddles">Charades</TabsTrigger>
              <TabsTrigger value="periodic">
                <FlaskConical className="w-4 h-4 mr-2" />
                Tableau Périodique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="riddles" className="space-y-4 mt-4">
              <div className="space-y-4">
                {/* Charade 1 */}
                <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2">
                        {RIDDLES[`zone${currentZone}` as keyof typeof RIDDLES].riddle1}
                      </p>
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        💡 {RIDDLES[`zone${currentZone}` as keyof typeof RIDDLES].answer1}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charade 2 */}
                <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2">
                        {RIDDLES[`zone${currentZone}` as keyof typeof RIDDLES].riddle2}
                      </p>
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        💡 {RIDDLES[`zone${currentZone}` as keyof typeof RIDDLES].answer2}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Solution */}
                <div className="p-3 rounded-lg bg-green-950/20 border border-green-500/30">
                  <p className="text-sm font-mono text-center">
                    {RIDDLES[`zone${currentZone}` as keyof typeof RIDDLES].solution}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="periodic" className="mt-4">
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Tableau Périodique des Éléments
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {CHEMICAL_ELEMENTS.map((element) => (
                      <div
                        key={element.symbol}
                        className="p-2 rounded-lg border bg-card hover:bg-accent transition-colors"
                      >
                        <div className="text-xs text-muted-foreground text-right">
                          {element.number}
                        </div>
                        <div className="text-xl font-bold text-center text-primary">
                          {element.symbol}
                        </div>
                        <div className="text-xs text-center text-muted-foreground truncate">
                          {element.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        {/* Input du code */}
        {!isSuccess && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Input
                id="door-code-input"
                type="text"
                placeholder="Entrez le code à 4 chiffres..."
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className={cn(
                  "text-center text-2xl font-bold tracking-widest",
                  error && "border-red-500 focus-visible:ring-red-500"
                )}
                disabled={isValidating}
                maxLength={4}
              />
            </div>

            {error && (
              <Alert variant="destructive" className="animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isValidating || !code.trim()}
              className="w-full text-lg py-6"
            >
              {isValidating ? 'Validation...' : '🔓 Déverrouiller'}
            </Button>
          </div>
        )}

        {isSuccess && (
          <div className="py-8 text-center animate-scale-in">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <Unlock className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-green-600">
              Transition en cours...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
