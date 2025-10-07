import { useState } from 'react';
import { Settings, Lock, Unlock, Save, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

  if (!isHost) {
    return null;
  }

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
            door_status: updatedDoorStatus,
            current_zone: zone === 3 ? 3 : zone + 1
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
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Codes des Portes</h3>
          </div>
          
          <div className="grid gap-4">
            {['zone1', 'zone2', 'zone3'].map((zone, idx) => (
              <div key={zone} className="space-y-2">
                <Label htmlFor={`code-${zone}`}>
                  Code Zone {idx + 1}
                </Label>
                <Input
                  id={`code-${zone}`}
                  type="text"
                  placeholder="Ex: 1234"
                  value={codes[zone as keyof typeof codes]}
                  onChange={(e) => setCodes(prev => ({ ...prev, [zone]: e.target.value }))}
                  className="font-mono"
                />
              </div>
            ))}
          </div>

          <Button 
            onClick={handleSaveCodes} 
            disabled={isSaving}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder les codes'}
          </Button>
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
                    disabled={isUnlocked || zone > currentZone}
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
