import { useState, useEffect } from 'react';
import { Settings, Lock, Unlock, Save, Shield, Copy, Check, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';


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
  const [isClosingSession, setIsClosingSession] = useState(false);

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

  const handleCloseSession = async () => {
    setIsClosingSession(true);
    try {
      await supabase.rpc('cleanup_session', { session_code_param: sessionCode });
      toast.success('Session fermée avec succès');
    } catch (error) {
      console.error('Error closing session:', error);
      toast.error('Erreur lors de la fermeture de la session');
    } finally {
      setIsClosingSession(false);
    }
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

        {/* Bouton de fermeture de session */}
        <div className="pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full"
                size="lg"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Fermer la session
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la fermeture de la session</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir fermer cette session ? Cette action est irréversible.
                  <br /><br />
                  <strong>Tous les joueurs seront redirigés vers la page d'accueil et toutes les données de la session seront supprimées.</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCloseSession}
                  disabled={isClosingSession}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isClosingSession ? 'Fermeture...' : 'Confirmer la fermeture'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};
