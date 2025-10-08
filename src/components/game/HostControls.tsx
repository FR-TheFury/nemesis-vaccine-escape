import { useState, useEffect } from 'react';
import { Settings, Lock, Unlock, Save, Shield, Copy, Check, FlaskConical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Charades par zone
const RIDDLES = {
  zone1: {
    riddle1: "Mon numéro correspondant à l'élément du tableau périodique le plus présent dans le soleil !",
    answer1: "Azote (N) - 7",
    riddle2: "Se numéro et celui de la version du virus !",
    answer2: "VX-9 - 9",
    riddle3: "Mon numéro et celui de l'élément périodique de l'hélium Visible Sur notre Tableau périodique trouvé dans le casier !",
    answer3: "Hélium (He) - 2",
    riddle4: "Nombre de face d'un dé à jouer !",
    answer4: "6 faces",
    solution: "Code: 7926"
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

interface HostControlsProps {
  sessionCode: string;
  currentZone: number;
  doorCodes: Record<string, string>;
  doorStatus: Record<string, string>;
  isHost: boolean;
}

export const HostControls = ({ 
  sessionCode, 
  currentZone,
  doorCodes, 
  doorStatus,
  isHost 
}: HostControlsProps) => {
  const [codes, setCodes] = useState({
    zone1: doorCodes.zone1 || '',
    zone2: doorCodes.zone2 || '',
    zone3: doorCodes.zone3 || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [copiedZone, setCopiedZone] = useState<string | null>(null);

  // Synchroniser les codes avec les props
  useEffect(() => {
    setCodes({
      zone1: doorCodes.zone1 || '',
      zone2: doorCodes.zone2 || '',
      zone3: doorCodes.zone3 || '',
    });
  }, [doorCodes]);

  if (!isHost) {
    return null;
  }

  const handleCopyCode = (zone: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedZone(zone);
    toast.success(`Code de la ${zone} copié`);
    setTimeout(() => setCopiedZone(null), 2000);
  };

  const handleSaveCodes = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ door_codes: codes })
        .eq('code', sessionCode);

      if (error) throw error;
      
      toast.success('Codes de porte sauvegardés avec succès');
    } catch (err) {
      console.error('Error saving door codes:', err);
      toast.error('Erreur lors de la sauvegarde des codes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateCodes = async () => {
    try {
      const { getAllDoorCodes } = await import('@/lib/sessionCode');
      const newCodes = getAllDoorCodes();
      
      await supabase
        .from('sessions')
        .update({ door_codes: newCodes })
        .eq('code', sessionCode);

      setCodes(newCodes);
      toast.success('Codes générés avec succès !');
    } catch (error) {
      console.error('Error generating codes:', error);
      toast.error('Erreur lors de la génération des codes');
    }
  };

  const handleForceUnlock = async (zone: number) => {
    const zoneKey = `zone${zone}`;
    
    try {
      const { data: session } = await supabase
        .from('sessions')
        .select('door_status')
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
            door_status: updatedDoorStatus
          })
          .eq('code', sessionCode);

        toast.success(`Zone ${zone} déverrouillée manuellement`);
      }
    } catch (err) {
      console.error('Error force unlocking:', err);
      toast.error('Erreur lors du déverrouillage manuel');
    }
  };

  const getDoorStatusColor = (zone: string) => {
    const status = doorStatus[zone];
    return status === 'unlocked' ? 'text-green-500' : 'text-red-500';
  };

  const getDoorStatusIcon = (zone: string) => {
    const status = doorStatus[zone];
    return status === 'unlocked' ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />;
  };

  return (
    <Card className="border-2 border-orange-500/30 bg-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="w-6 h-6 text-orange-500" />
          Contrôles Game Master
        </CardTitle>
        <CardDescription>
          Configuration des codes de porte et déverrouillage manuel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration des codes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Codes des Portes Physiques</h3>
            </div>
            {(!codes.zone1 && !codes.zone2 && !codes.zone3) && (
              <Button
                onClick={handleGenerateCodes}
                variant="outline"
                size="sm"
              >
                Générer les codes
              </Button>
            )}
          </div>
          
          {(!codes.zone1 && !codes.zone2 && !codes.zone3) ? (
            <Alert className="bg-orange-950/20 border-orange-500/30">
              <AlertDescription className="text-sm">
                ⚠️ Aucun code généré. Cliquez sur "Générer les codes" pour créer les codes des portes.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert className="bg-blue-950/20 border-blue-500/30">
                <AlertDescription className="text-sm">
                  💡 Ces codes ont été générés automatiquement. Notez-les sur des papiers et dispersez-les dans votre zone de jeu réelle.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-3">
                {['zone1', 'zone2', 'zone3'].map((zone, idx) => (
                  <div 
                    key={zone} 
                    className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">
                        Code Zone {idx + 1}
                      </Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyCode(`Zone ${idx + 1}`, codes[zone as keyof typeof codes])}
                      >
                        {copiedZone === zone ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="text-3xl font-mono font-bold text-primary tracking-widest">
                      {codes[zone as keyof typeof codes] || '----'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Charades et Solutions */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Charades et Solutions</h3>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-2">
            {[1, 2, 3].map(zone => {
              const zoneKey = `zone${zone}` as keyof typeof RIDDLES;
              const riddles = RIDDLES[zoneKey];
              
              return (
                <AccordionItem 
                  key={zoneKey} 
                  value={zoneKey}
                  className="border-2 border-primary/20 rounded-lg px-4 bg-primary/5"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-semibold">Zone {zone}</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    {/* Charade 1 */}
                    <div className="p-3 rounded-lg bg-background/50 border">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">1</span>
                        </div>
                        <p className="text-sm">{riddles.riddle1}</p>
                      </div>
                      <div className="text-sm font-semibold text-green-600 bg-green-950/20 p-2 rounded">
                        💡 Réponse: {riddles.answer1}
                      </div>
                    </div>
                    
                    {/* Charade 2 */}
                    <div className="p-3 rounded-lg bg-background/50 border">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">2</span>
                        </div>
                        <p className="text-sm">{riddles.riddle2}</p>
                      </div>
                      <div className="text-sm font-semibold text-green-600 bg-green-950/20 p-2 rounded">
                        💡 Réponse: {riddles.answer2}
                      </div>
                    </div>
                    
                    {/* Charade 3 */}
                    {zone === 1 && 'riddle3' in riddles && (
                      <div className="p-3 rounded-lg bg-background/50 border">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">3</span>
                          </div>
                          <p className="text-sm">{riddles.riddle3}</p>
                        </div>
                        <div className="text-sm font-semibold text-green-600 bg-green-950/20 p-2 rounded">
                          💡 Réponse: {riddles.answer3}
                        </div>
                      </div>
                    )}
                    
                    {/* Charade 4 */}
                    {zone === 1 && 'riddle4' in riddles && (
                      <div className="p-3 rounded-lg bg-background/50 border">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">4</span>
                          </div>
                          <p className="text-sm">{riddles.riddle4}</p>
                        </div>
                        <div className="text-sm font-semibold text-green-600 bg-green-950/20 p-2 rounded">
                          💡 Réponse: {riddles.answer4}
                        </div>
                      </div>
                    )}
                    
                    {/* Solution finale */}
                    <div className="p-3 rounded-lg bg-orange-950/20 border-2 border-orange-500/30">
                      <p className="text-sm font-mono font-bold text-center text-orange-400">
                        {riddles.solution}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* État des portes */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">État des Portes</h3>
          
          <div className="grid gap-3">
            {[1, 2, 3].map(zone => {
              const zoneKey = `zone${zone}`;
              const isUnlocked = doorStatus[zoneKey] === 'unlocked';
              
              return (
                <div 
                  key={zoneKey}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    isUnlocked ? "bg-green-950/20 border-green-500/30" : "bg-red-950/20 border-red-500/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={getDoorStatusColor(zoneKey)}>
                      {getDoorStatusIcon(zoneKey)}
                    </span>
                    <span className="font-medium">Zone {zone}</span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={isUnlocked ? "outline" : "default"}
                    onClick={() => handleForceUnlock(zone)}
                    disabled={isUnlocked}
                  >
                    {isUnlocked ? 'Déverrouillée' : 'Forcer le déverrouillage'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            ⚠️ Les déverrouillages manuels sont enregistrés et visibles par tous les joueurs.
            Utilisez cette fonction uniquement en cas de nécessité.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
