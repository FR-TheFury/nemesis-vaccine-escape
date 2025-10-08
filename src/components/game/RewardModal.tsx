import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Package } from 'lucide-react';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'item' | 'hint';
  title: string;
  description: string;
  icon?: string;
}

export const RewardModal = ({ isOpen, onClose, type, title, description, icon }: RewardModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
            {type === 'item' ? (
              icon ? (
                <span className="text-4xl">{icon}</span>
              ) : (
                <Package className="w-8 h-8 text-primary" />
              )
            ) : (
              <Sparkles className="w-8 h-8 text-primary" />
            )}
          </div>
          <DialogTitle className="text-2xl text-center">
            {type === 'item' ? '🎁 Objet trouvé !' : '🔍 Nouvel indice révélé !'}
          </DialogTitle>
          <DialogDescription className="text-center text-base space-y-2">
            <p className="font-bold text-lg text-foreground">{title}</p>
            <p className="text-muted-foreground">{description}</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} size="lg" className="w-full sm:w-auto">
            Continuer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
