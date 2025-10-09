import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface CentrifugeCalibrationProps {
  isOpen: boolean;
  onClose: () => void;
  targetRPM: number;
  targetTime: number;
  toleranceRPM: number;
  toleranceTime: number;
  onSolve: () => void;
  isSolved?: boolean;
}

export const CentrifugeCalibration = ({
  isOpen,
  onClose,
  targetRPM,
  targetTime,
  toleranceRPM,
  toleranceTime,
  onSolve,
  isSolved = false
}: CentrifugeCalibrationProps) => {
  const [rpm, setRpm] = useState([5000]);
  const [time, setTime] = useState([60]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleValidate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const rpmValue = rpm[0];
      const timeValue = time[0];

      const rpmInRange = Math.abs(rpmValue - targetRPM) <= toleranceRPM;
      const timeInRange = Math.abs(timeValue - targetTime) <= toleranceTime;

      if (rpmInRange && timeInRange) {
        toast({
          title: "✅ Calibration réussie !",
          description: `La centrifugeuse est correctement calibrée : ${rpmValue} RPM, ${timeValue}s`,
        });
        onSolve();
        onClose();
      } else {
        toast({
          title: "❌ Calibration incorrecte",
          description: "Les valeurs ne correspondent pas. Vérifiez les notes du Dr Morel.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            Centrifuge - Calibration
          </DialogTitle>
          <DialogDescription>
            Ajustez la vitesse (RPM) et le temps pour calibrer correctement la centrifugeuse.
          </DialogDescription>
        </DialogHeader>

        {isSolved ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl font-semibold text-green-600">Centrifugeuse calibrée !</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* RPM Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Vitesse (RPM)</label>
                <span className="text-lg font-bold text-primary">{rpm[0]}</span>
              </div>
              <Slider
                value={rpm}
                onValueChange={setRpm}
                min={3000}
                max={10000}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3000</span>
                <span>10000</span>
              </div>
            </div>

            {/* Time Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Temps (secondes)</label>
                <span className="text-lg font-bold text-primary">{time[0]}s</span>
              </div>
              <Slider
                value={time}
                onValueChange={setTime}
                min={30}
                max={180}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>30s</span>
                <span>180s</span>
              </div>
            </div>

            {/* Validate Button */}
            <Button 
              onClick={handleValidate}
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Calibration...' : '🚀 Lancer la calibration'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
