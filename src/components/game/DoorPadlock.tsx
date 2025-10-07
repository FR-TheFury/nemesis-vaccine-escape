import { useState } from 'react';
import { Lock, Unlock, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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
      <DialogContent className="sm:max-w-md">
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
                Déverrouiller la Porte
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isSuccess 
              ? 'Accès accordé à la zone suivante !'
              : 'Entrez le code trouvé dans la boîte physique pour accéder à la zone suivante.'
            }
          </DialogDescription>
        </DialogHeader>

        {!isSuccess && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                id="door-code-input"
                type="text"
                placeholder="Entrez le code..."
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

            <p className="text-sm text-muted-foreground text-center">
              Utilisez les 3 indices révélés pour trouver la boîte contenant le code
            </p>
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
