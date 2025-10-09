import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ficheCesar from '@/assets/fiche-cesar.png';
import ficheAdn from '@/assets/fiche-adn.png';

interface HelpSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSheetsModal = ({ isOpen, onClose }: HelpSheetsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">📚 Fiches d'aide - Protocole Z</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="cesar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cesar">🔐 Code César</TabsTrigger>
            <TabsTrigger value="adn">🧬 ADN</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cesar" className="mt-4">
            <div className="space-y-4">
              <img 
                src={ficheCesar} 
                alt="Fiche d'aide Code César" 
                className="w-full rounded-lg border-2 border-primary/20"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="adn" className="mt-4">
            <div className="space-y-4">
              <img 
                src={ficheAdn} 
                alt="Fiche d'aide ADN" 
                className="w-full rounded-lg border-2 border-primary/20"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
