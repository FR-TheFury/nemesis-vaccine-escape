import { useState } from 'react';
import { Copy, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import hintsData from '@/data/hints.json';

interface HintsPanelProps {
  currentZone: number;
  revealedHints: Record<string, string[]>; // { "zone1": ["p1", "p2"], "zone2": [] }
  className?: string;
}

export const HintsPanel = ({ currentZone, revealedHints, className }: HintsPanelProps) => {
  const [copiedHint, setCopiedHint] = useState<string | null>(null);
  
  const zoneKey = `zone${currentZone}`;
  const zoneData = hintsData.zones.find(z => z.id === zoneKey);
  const revealedForZone = revealedHints[zoneKey] || [];

  if (!zoneData) return null;

  const puzzles = [
    { key: 'p1', label: 'Énigme 1', hint: zoneData.hints.p1 },
    { key: 'p2', label: 'Énigme 2', hint: zoneData.hints.p2 },
    { key: 'p3', label: 'Énigme 3', hint: zoneData.hints.p3 },
  ];

  const handleCopy = async (hint: string, puzzleKey: string) => {
    try {
      await navigator.clipboard.writeText(hint);
      setCopiedHint(puzzleKey);
      toast.success('Indice copié dans le presse-papier');
      setTimeout(() => setCopiedHint(null), 2000);
    } catch (err) {
      toast.error('Erreur lors de la copie');
    }
  };

  return (
    <Card className={cn("border-2 border-primary/20 bg-card/95 backdrop-blur-sm", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          📋 Indices Révélés
        </CardTitle>
        <CardDescription>
          {zoneData.name} - {revealedForZone.length}/3 indices découverts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {revealedForZone.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Résolvez des énigmes pour révéler des indices</p>
            <p className="text-sm mt-2">Ces indices vous guideront vers la boîte contenant le code de la porte</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {puzzles.map(puzzle => {
              const isRevealed = revealedForZone.includes(puzzle.key);
              
              return (
                <AccordionItem 
                  key={puzzle.key} 
                  value={puzzle.key}
                  disabled={!isRevealed}
                >
                  <AccordionTrigger className={cn(
                    "hover:no-underline",
                    isRevealed ? "text-primary" : "text-muted-foreground"
                  )}>
                    <div className="flex items-center gap-2">
                      {isRevealed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                      <span>{puzzle.label}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary animate-fade-in">
                        <div className="text-base leading-relaxed space-y-3">
                          {puzzle.hint.split('\n\n').map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(puzzle.hint, puzzle.key)}
                        className="w-full"
                      >
                        {copiedHint === puzzle.key ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Copié !
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copier l'indice
                          </>
                        )}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};
