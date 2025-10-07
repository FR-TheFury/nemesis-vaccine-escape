import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Hotspot {
  id: string;
  x: number; // Position en pourcentage (0-100)
  y: number; // Position en pourcentage (0-100)
  label: string;
  icon: string;
  solved: boolean;
  onClick: () => void;
}

interface InteractiveZoneMapProps {
  backgroundImage?: string;
  backgroundColor?: string;
  hotspots: Hotspot[];
  zoneName: string;
}

export const InteractiveZoneMap = ({ 
  backgroundImage, 
  backgroundColor = 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900',
  hotspots, 
  zoneName 
}: InteractiveZoneMapProps) => {
  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-lg overflow-hidden border-2 border-primary/30 shadow-2xl">
      {/* Fond de la map */}
      <div 
        className={cn(
          "absolute inset-0",
          backgroundColor
        )}
        style={backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Titre de la zone */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
        <Badge variant="secondary" className="text-xs sm:text-sm md:text-lg px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 backdrop-blur-sm bg-background/80">
          {zoneName}
        </Badge>
      </div>

      {/* Hotspots cliquables - étincelles subtiles */}
      {hotspots
        .filter((hotspot) => !hotspot.solved)
        .map((hotspot) => (
        <button
          key={hotspot.id}
          onClick={hotspot.onClick}
          className="absolute group transition-all duration-500 cursor-pointer"
          style={{
            left: `${hotspot.x}%`,
            top: `${hotspot.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          aria-label={hotspot.label}
        >
          {/* Étincelle principale */}
          <div className="relative w-3 h-3 rounded-full transition-all duration-300 bg-white/40 shadow-[0_0_12px_rgba(255,255,255,0.8)] group-hover:scale-150 group-hover:bg-white/80">
            {/* Animation de scintillement */}
            <div className="absolute inset-0 rounded-full bg-white/60 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-white/40 animate-pulse" />
          </div>

          {/* Particules secondaires autour */}
          <div className="absolute -top-2 -left-2 w-1 h-1 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute -top-1 left-3 w-1 h-1 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '0.4s' }} />
          <div className="absolute top-3 -right-2 w-1 h-1 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '0.6s' }} />

          {/* Label au survol */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-primary/90 border-primary/50 text-primary-foreground shadow-lg">
            {hotspot.icon} {hotspot.label}
          </div>
        </button>
      ))}
    </div>
  );
};
