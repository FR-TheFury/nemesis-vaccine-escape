import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MicroscopeProps {
  isOpen: boolean;
  onClose: () => void;
  onSolve: () => void;
}

export const Microscope = ({ isOpen, onClose, onSolve }: MicroscopeProps) => {
  const [uvActive, setUvActive] = useState(false);
  const [qrRevealed, setQrRevealed] = useState(false);
  const { toast } = useToast();

  const handleUvActivation = () => {
    setUvActive(true);
    setTimeout(() => {
      setQrRevealed(true);
      toast({
        title: "💡 Marques UV détectées !",
        description: "Un QR code caché apparaît...",
      });
    }, 1000);
  };

  const handleQrClick = () => {
    toast({
      title: "✓ QR Code scanné !",
      description: "FORMULE-BETA révélée !",
    });
    onSolve();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Microscope haute résolution</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative h-64 bg-muted rounded-md overflow-hidden border-4 border-border">
            {/* Échantillon de base */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 opacity-50" />
            </div>

            {/* Effet UV */}
            {uvActive && (
              <div className="absolute inset-0 bg-purple-500/30 animate-pulse" />
            )}

            {/* QR Code révélé */}
            {qrRevealed && (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer animate-scale-in"
                onClick={handleQrClick}
              >
                <div className="w-32 h-32 bg-white p-2 rounded-md shadow-lg border-2 border-primary">
                  <div className="w-full h-full bg-black grid grid-cols-8 grid-rows-8 gap-[1px]">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={Math.random() > 0.5 ? 'bg-white' : 'bg-black'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {!uvActive ? (
            <Button onClick={handleUvActivation} className="w-full">
              Activer mode UV
            </Button>
          ) : (
            <p className="text-center text-sm text-primary font-bold">
              {qrRevealed ? '👆 Cliquez sur le QR code' : 'Analyse en cours...'}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
