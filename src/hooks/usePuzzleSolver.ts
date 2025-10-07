import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mapping des puzzles vers leurs indices (p1, p2, p3)
const PUZZLE_TO_HINT_MAP: Record<string, { zone: string; hint: string }> = {
  'zone1_caesar': { zone: 'zone1', hint: 'p1' },
  'zone1_locker': { zone: 'zone1', hint: 'p2' },
  'zone1_audio': { zone: 'zone1', hint: 'p3' },
  'zone2_dna': { zone: 'zone2', hint: 'p1' },
  'zone2_microscope': { zone: 'zone2', hint: 'p2' },
  'zone2_periodic': { zone: 'zone2', hint: 'p3' },
  'zone3_cryobox': { zone: 'zone3', hint: 'p1' },
  'zone3_mixer': { zone: 'zone3', hint: 'p2' },
  'zone3_final': { zone: 'zone3', hint: 'p3' },
};

export const usePuzzleSolver = (sessionCode: string | null) => {
  const solvePuzzle = useCallback(async (puzzleId: string) => {
    if (!sessionCode) return;

    try {
      // Récupérer la session actuelle
      const { data: session, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', sessionCode)
        .single();

      if (fetchError) throw fetchError;

      // Mettre à jour les puzzles résolus
      const solvedPuzzles = { ...(session.solved_puzzles as any || {}), [puzzleId]: true };
      
      // Révéler l'indice correspondant au puzzle
      const revealedHints = { ...(session.revealed_hints as any || { zone1: [], zone2: [], zone3: [] }) };
      const hintMapping = PUZZLE_TO_HINT_MAP[puzzleId];
      
      if (hintMapping && !revealedHints[hintMapping.zone].includes(hintMapping.hint)) {
        revealedHints[hintMapping.zone] = [...revealedHints[hintMapping.zone], hintMapping.hint];
        toast.success('🔍 Un nouvel indice a été révélé !');
      }

      // Vérifier si les 3 puzzles de la zone actuelle sont résolus
      const zone1Puzzles = ['zone1_caesar', 'zone1_locker', 'zone1_audio'];
      const zone2Puzzles = ['zone2_dna', 'zone2_microscope', 'zone2_periodic'];
      const zone3Puzzles = ['zone3_cryobox', 'zone3_mixer', 'zone3_final'];
      
      const doorVisible = { ...(session.door_visible as any || { zone1: false, zone2: false, zone3: false }) };

      // Vérifier si tous les puzzles de la zone sont résolus → afficher le cadenas
      if (session.current_zone === 1 && zone1Puzzles.every(p => solvedPuzzles[p])) {
        doorVisible.zone1 = true;
        toast.info('🔐 Tous les indices révélés ! Le cadenas de la porte est maintenant accessible.');
      } else if (session.current_zone === 2 && zone2Puzzles.every(p => solvedPuzzles[p])) {
        doorVisible.zone2 = true;
        toast.info('🔐 Tous les indices révélés ! Le cadenas de la porte est maintenant accessible.');
      } else if (session.current_zone === 3 && zone3Puzzles.every(p => solvedPuzzles[p])) {
        doorVisible.zone3 = true;
        toast.info('🔐 Tous les indices révélés ! Le cadenas de la porte est maintenant accessible.');
      }

      // Mettre à jour la session (sans changer de zone automatiquement)
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          solved_puzzles: solvedPuzzles,
          revealed_hints: revealedHints,
          door_visible: doorVisible,
        })
        .eq('code', sessionCode);

      if (updateError) throw updateError;

    } catch (err) {
      console.error('Error solving puzzle:', err);
      toast.error('Erreur lors de la validation du puzzle');
    }
  }, [sessionCode]);

  return { solvePuzzle };
};
