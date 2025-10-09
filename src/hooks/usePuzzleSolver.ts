import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRewardQueue } from './useRewardQueue';
import hintsData from '@/data/hints.json';

// Mapping des puzzles vers leurs indices (p1, p2, p3)
// Les mini-jeux/distracteurs (test_tubes, puzzle) ne sont pas mappés car ils ne révèlent pas d'indices
const PUZZLE_TO_HINT_MAP: Record<string, { zone: string; hint: string }> = {
  'zone1_audio': { zone: 'zone1', hint: 'p1' },
  'zone1_caesar': { zone: 'zone1', hint: 'p2' },
  'zone1_locker': { zone: 'zone1', hint: 'p3' },
  'zone2_dna': { zone: 'zone2', hint: 'p1' },
  'zone2_microscope': { zone: 'zone2', hint: 'p2' },
  'zone2_periodic': { zone: 'zone2', hint: 'p3' },
  'zone3_cryobox': { zone: 'zone3', hint: 'p1' },
  'zone3_mixer': { zone: 'zone3', hint: 'p2' },
  'zone3_final': { zone: 'zone3', hint: 'p3' },
};

export const usePuzzleSolver = (sessionCode: string | null, playerPseudo: string = '') => {
  const { addReward } = useRewardQueue();
  
  const solvePuzzle = useCallback(async (puzzleId: string) => {
    if (!sessionCode) return;

    try {
      // 1. SELECT ciblé - récupérer uniquement les champs nécessaires
      const { data: session, error: fetchError } = await supabase
        .from('sessions')
        .select('solved_puzzles, revealed_hints, door_visible, current_zone')
        .eq('code', sessionCode)
        .maybeSingle();

      if (fetchError || !session) throw fetchError;

      // 2. Anti-doublon - vérifier si le puzzle est déjà résolu
      if ((session.solved_puzzles as any)?.[puzzleId]) {
        console.log('⚠️ Puzzle already solved, skipping');
        return;
      }

      // 3. Préparer les nouvelles données
      const solvedPuzzles = { ...(session.solved_puzzles as any || {}), [puzzleId]: true };
      const revealedHints = { ...(session.revealed_hints as any || { zone1: [], zone2: [], zone3: [] }) };
      const doorVisible = { ...(session.door_visible as any || { zone1: false, zone2: false, zone3: false }) };
      
      const hintMapping = PUZZLE_TO_HINT_MAP[puzzleId];
      let newHintRevealed = false;
      
      if (hintMapping && !revealedHints[hintMapping.zone].includes(hintMapping.hint)) {
        revealedHints[hintMapping.zone] = [...revealedHints[hintMapping.zone], hintMapping.hint];
        newHintRevealed = true;
        
        const zoneHints = (hintsData as any)[hintMapping.zone];
        const hintContent = zoneHints?.[hintMapping.hint];
        
        addReward({
          type: 'hint',
          title: `Énigme ${hintMapping.hint.replace('p', '')}`,
          description: hintContent || 'Un nouvel indice a été révélé !'
        });
      }

      // 4. Vérifier les puzzles de zone
      const zone1Puzzles = ['zone1_caesar', 'zone1_locker', 'zone1_audio'];
      const zone2Puzzles = ['zone2_dna', 'zone2_microscope', 'zone2_periodic'];
      const zone3Puzzles = ['zone3_cryobox', 'zone3_mixer', 'zone3_final'];

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

      // 5. Update session + chat message en parallèle (non bloquant)
      const updatePromise = supabase
        .from('sessions')
        .update({
          solved_puzzles: solvedPuzzles,
          revealed_hints: revealedHints,
          door_visible: doorVisible,
        })
        .eq('code', sessionCode);
      
      const chatPromise = (newHintRevealed && playerPseudo)
        ? supabase
            .from('chat_messages')
            .insert({
              session_code: sessionCode,
              player_pseudo: playerPseudo,
              message: `*${playerPseudo}* a débloqué l'énigme ${hintMapping.hint.replace('p', '')}`,
              type: 'system'
            })
        : Promise.resolve();
      
      // 6. Attendre les deux opérations sans bloquer l'UI
      const [updateResult, chatResult] = await Promise.allSettled([updatePromise, chatPromise]);
      
      if (updateResult.status === 'rejected') {
        throw updateResult.reason;
      }
      
      console.log('✅ Puzzle solved:', puzzleId);

    } catch (err) {
      console.error('Error solving puzzle:', err);
      toast.error('Erreur lors de la validation du puzzle');
    }
  }, [sessionCode, playerPseudo, addReward]);

  return { solvePuzzle };
};
