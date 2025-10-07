import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FacilityMapProps {
  currentZone: number;
  solvedPuzzles: Record<string, boolean>;
  onZoneChange?: (zone: number) => void;
}

export const FacilityMap = ({ currentZone, solvedPuzzles, onZoneChange }: FacilityMapProps) => {
  const zones = [
    { 
      id: 1, 
      name: 'Bureau du Dr Morel',
      puzzles: ['zone1_caesar', 'zone1_locker'],
      color: 'from-blue-600 to-blue-800',
      position: 'top-4 left-4'
    },
    { 
      id: 2, 
      name: 'Laboratoire',
      puzzles: ['zone2_dna', 'zone2_microscope'],
      color: 'from-green-600 to-green-800',
      position: 'top-4 right-4'
    },
    { 
      id: 3, 
      name: 'Confinement',
      puzzles: ['zone3_cryobox', 'zone3_mixer'],
      color: 'from-red-600 to-red-800',
      position: 'bottom-4 left-1/2 -translate-x-1/2'
    },
  ];

  const getZoneStatus = (zone: typeof zones[0]) => {
    const allSolved = zone.puzzles.every(p => solvedPuzzles[p]);
    const isUnlocked = currentZone >= zone.id;
    const isCurrent = currentZone === zone.id;
    
    return { allSolved, isUnlocked, isCurrent };
  };

  return (
    <Card className="fixed top-16 left-2 sm:top-4 sm:left-4 z-40 p-2 sm:p-4 bg-background/95 backdrop-blur-md border-2 border-primary">
      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2">
          🗺️ Plan
        </h3>
        
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 bg-muted rounded-lg border-2 border-border">
          {/* Connexions */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            <line x1="30%" y1="30%" x2="70%" y2="30%" stroke="currentColor" strokeWidth="2" strokeDasharray="4" opacity="0.3" />
            <line x1="30%" y1="30%" x2="50%" y2="70%" stroke="currentColor" strokeWidth="2" strokeDasharray="4" opacity="0.3" />
            <line x1="70%" y1="30%" x2="50%" y2="70%" stroke="currentColor" strokeWidth="2" strokeDasharray="4" opacity="0.3" />
          </svg>

          {/* Zones */}
          {zones.map((zone) => {
            const { allSolved, isUnlocked, isCurrent } = getZoneStatus(zone);
            
            return (
              <div
                key={zone.id}
                onClick={() => isUnlocked && onZoneChange && onZoneChange(zone.id)}
                className={cn(
                  "absolute w-14 h-14 sm:w-20 sm:h-20 rounded-lg flex flex-col items-center justify-center text-white",
                  "transition-all duration-300 border-2",
                  zone.position,
                  isUnlocked ? `bg-gradient-to-br ${zone.color} cursor-pointer hover:scale-105` : 'bg-gray-700',
                  isCurrent && 'ring-2 sm:ring-4 ring-primary scale-110',
                  !isUnlocked && 'opacity-50 cursor-not-allowed'
                )}
                style={{ zIndex: 10 }}
                title={isUnlocked ? `Aller à ${zone.name}` : 'Zone verrouillée'}
              >
                <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">
                  {!isUnlocked && <Lock className="h-3 w-3 sm:h-5 sm:w-5" />}
                  {isUnlocked && allSolved && <Check className="h-3 w-3 sm:h-5 sm:w-5" />}
                  {isUnlocked && !allSolved && zone.id}
                </div>
                <div className="text-[6px] sm:text-[8px] text-center font-bold px-0.5 sm:px-1 hidden sm:block">
                  {zone.name.split(' ')[0]}
                </div>
                <Badge variant="secondary" className="text-[6px] sm:text-[8px] px-0.5 sm:px-1 py-0 mt-0.5 sm:mt-1">
                  {zone.puzzles.filter(p => solvedPuzzles[p]).length}/{zone.puzzles.length}
                </Badge>
              </div>
            );
          })}
        </div>

        <div className="text-[10px] sm:text-xs text-muted-foreground text-center">
          Zone {currentZone}/3
        </div>
      </div>
    </Card>
  );
};
