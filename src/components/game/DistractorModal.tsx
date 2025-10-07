import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DistractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: string;
  content: string | React.ReactNode;
}

export const DistractorModal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  content 
}: DistractorModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">{icon}</span>
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              {content}
            </div>
          </div>
          
          <Button onClick={onClose} variant="outline" className="w-full">
            <X className="h-4 w-4 mr-2" />
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
