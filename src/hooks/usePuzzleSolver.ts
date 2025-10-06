import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePuzzleSolver = (sessionCode: string | null) => {
  const solvePuzzle = useCallback(async (puzzleId: string, reward?: string) => {
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
      
      // Ajouter la récompense à l'inventaire si elle existe
      const currentInventory = (session.inventory as any[]) || [];
      const newInventory = reward && !currentInventory.some((item: any) => item.id === reward)
        ? [...currentInventory, { id: reward, name: reward, description: `Obtenu en résolvant ${puzzleId}` }]
        : currentInventory;

      // Vérifier si toutes les énigmes de la zone sont résolues
      const zone1Puzzles = ['zone1_caesar', 'zone1_locker'];
      const zone2Puzzles = ['zone2_dna', 'zone2_microscope'];
      const zone3Puzzles = ['zone3_cryobox', 'zone3_mixer'];
      
      let newZone = session.current_zone;
      let newStatus = session.status;

      if (session.current_zone === 1 && zone1Puzzles.every(p => solvedPuzzles[p])) {
        newZone = 2;
        toast.success('🎉 Zone 1 complétée ! Accès au Laboratoire de Microbiologie.');
      } else if (session.current_zone === 2 && zone2Puzzles.every(p => solvedPuzzles[p])) {
        newZone = 3;
        toast.success('🎉 Zone 2 complétée ! Accès à la Salle de Confinement.');
      } else if (session.current_zone === 3 && zone3Puzzles.every(p => solvedPuzzles[p])) {
        newStatus = 'completed';
        toast.success('🏆 Mission accomplie ! Vous avez sauvé l\'humanité !');
      }

      // Mettre à jour la session
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          solved_puzzles: solvedPuzzles,
          inventory: newInventory,
          current_zone: newZone,
          status: newStatus,
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
