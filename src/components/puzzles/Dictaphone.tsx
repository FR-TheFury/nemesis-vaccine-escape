import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Volume2, Play, Pause } from 'lucide-react';

interface DictaphoneProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: string;
  onSolve: () => void;
}

export const Dictaphone = ({ isOpen, onClose, transcript, onSolve }: DictaphoneProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const { toast } = useToast();

  const handlePlay = () => {
    setIsPlaying(true);
    
    // Simulate audio playback
    setTimeout(() => {
      setIsPlaying(false);
      setHasListened(true);
      toast({
        title: "🎧 Message écouté",
        description: "Poursuivez vers le Laboratoire de Microbiologie",
      });
    }, 8000); // 8 seconds simulated playback
  };

  const handleValidate = () => {
    if (!hasListened) {
      toast({
        variant: "destructive",
        title: "Écoutez d'abord",
        description: "Vous devez écouter le message complet avant de valider.",
      });
      return;
    }

    toast({
      title: "🎧 Message du Dr Morel entendu",
      description: "Un confinement doit être maintenu pour empêcher la propagation du virus.",
    });

    onSolve();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dictaphone du Dr Morel</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-md flex items-center justify-center">
            <Volume2 className="h-16 w-16 text-primary" />
          </div>

          <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-md">
            <p className="text-xs text-muted-foreground">
              📼 Dernier enregistrement - {new Date().toLocaleDateString()}
            </p>
          </div>

          <Button 
            onClick={handlePlay} 
            disabled={isPlaying}
            className="w-full"
            variant={hasListened ? "secondary" : "default"}
          >
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Lecture en cours...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                {hasListened ? "Réécouter le message" : "Écouter le message"}
              </>
            )}
          </Button>

          {hasListened && (
            <div className="space-y-3">
              <div className="p-3 bg-accent/50 rounded-md border border-border">
                <p className="text-sm italic text-muted-foreground">
                  "{transcript}"
                </p>
              </div>
              
              <Button onClick={handleValidate} className="w-full" variant="default">
                Compris - Continuer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
