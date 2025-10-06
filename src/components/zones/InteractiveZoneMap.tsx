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
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border-2 border-primary/30 shadow-2xl">
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
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="secondary" className="text-lg px-4 py-2 backdrop-blur-sm bg-background/80">
          {zoneName}
        </Badge>
      </div>

      {/* Hotspots cliquables */}
      {hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          onClick={hotspot.onClick}
          disabled={hotspot.solved}
          className={cn(
            "absolute group transition-all duration-300",
            "hover:scale-110 active:scale-95",
            hotspot.solved && "opacity-60 cursor-not-allowed"
          )}
          style={{
            left: `${hotspot.x}%`,
            top: `${hotspot.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Pulse animation pour les énigmes non résolues */}
          {!hotspot.solved && (
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/30 scale-150" />
          )}
          
          {/* Icône de l'énigme */}
          <div className={cn(
            "relative w-16 h-16 rounded-full flex items-center justify-center text-2xl",
            "backdrop-blur-md border-2 transition-all duration-300",
            hotspot.solved 
              ? "bg-green-500/80 border-green-300 shadow-lg shadow-green-500/50" 
              : "bg-primary/90 border-primary-foreground/30 shadow-2xl shadow-primary/50 hover:shadow-primary/70"
          )}>
            <span className="drop-shadow-lg">{hotspot.icon}</span>
          </div>

          {/* Label */}
          <div className={cn(
            "absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap",
            "px-3 py-1 rounded-md text-sm font-medium backdrop-blur-md",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            hotspot.solved 
              ? "bg-green-500/90 text-white" 
              : "bg-primary/90 text-primary-foreground"
          )}>
            {hotspot.label}
            {hotspot.solved && " ✓"}
          </div>
        </button>
      ))}
    </div>
  );
};
