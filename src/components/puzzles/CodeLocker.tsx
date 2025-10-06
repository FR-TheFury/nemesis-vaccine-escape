import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CodeLockerProps {
  isOpen: boolean;
  onClose: () => void;
  correctCode: string;
  onSolve: () => void;
}

export const CodeLocker = ({ isOpen, onClose, correctCode, onSolve }: CodeLockerProps) => {
  const [code, setCode] = useState<string>('');
  const { toast } = useToast();

  const handleDigit = (digit: string) => {
    if (code.length < 4) {
      setCode(code + digit);
    }
  };

  const handleClear = () => {
    setCode('');
  };

  const handleSubmit = () => {
    if (code === correctCode) {
      toast({
        title: "✓ Casier déverrouillé !",
        description: "Le badge magnétique est maintenant accessible.",
      });
      onSolve();
      onClose();
    } else {
      toast({
        title: "✗ Code incorrect",
        description: "Le casier reste verrouillé.",
        variant: "destructive",
      });
      setCode('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Casier sécurisé - Code 4 chiffres</DialogTitle>
          <DialogDescription>
            Entrez le code à 4 chiffres pour déverrouiller le casier
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-md text-center">
            <div className="text-3xl font-mono tracking-wider">
              {code.padEnd(4, '•')}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <Button
                key={digit}
                onClick={() => handleDigit(String(digit))}
                variant="outline"
                className="h-12 text-lg"
              >
                {digit}
              </Button>
            ))}
            <Button
              onClick={handleClear}
              variant="destructive"
              className="h-12"
            >
              ✕
            </Button>
            <Button
              onClick={() => handleDigit('0')}
              variant="outline"
              className="h-12 text-lg"
            >
              0
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={code.length !== 4}
              className="h-12"
            >
              ✓
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
