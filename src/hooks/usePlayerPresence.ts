import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UsePlayerPresenceProps {
  sessionCode: string;
  playerId: string;
}

export const usePlayerPresence = ({ sessionCode, playerId }: UsePlayerPresenceProps) => {
  const heartbeatInterval = useRef<number | null>(null);
  const isCleaningUp = useRef(false);

  useEffect(() => {
    if (!sessionCode || !playerId) return;

    console.log('[Presence] Setting up player presence for:', playerId);

    // Marquer le joueur comme connecté
    const markAsConnected = async () => {
      try {
        const { error } = await supabase
          .from('players')
          .update({ 
            is_connected: true,
            last_seen: new Date().toISOString()
          })
          .eq('id', playerId);

        if (error) {
          console.error('[Presence] Error marking as connected:', error);
        } else {
          console.log('[Presence] Player marked as connected');
        }
      } catch (err) {
        console.error('[Presence] Error in markAsConnected:', err);
      }
    };

    // Marquer le joueur comme déconnecté
    const markAsDisconnected = async () => {
      if (isCleaningUp.current) return;
      isCleaningUp.current = true;

      try {
        console.log('[Presence] Marking player as disconnected:', playerId);
        
        // Mettre à jour le statut de connexion
        const { error: updateError } = await supabase
          .from('players')
          .update({ 
            is_connected: false,
            last_seen: new Date().toISOString()
          })
          .eq('id', playerId);

        if (updateError) {
          console.error('[Presence] Error marking as disconnected:', updateError);
          return;
        }

        // Vérifier s'il reste des joueurs connectés
        const { data: connectedPlayers, error: checkError } = await supabase
          .from('players')
          .select('id, is_connected')
          .eq('session_code', sessionCode)
          .eq('is_connected', true);

        if (checkError) {
          console.error('[Presence] Error checking connected players:', checkError);
          return;
        }

        console.log('[Presence] Connected players remaining:', connectedPlayers?.length || 0);

        // Si plus personne n'est connecté, ne nettoyer la session que si elle n'est PAS en attente
        if (!connectedPlayers || connectedPlayers.length === 0) {
          try {
            const { data: sessionRow, error: sessionErr } = await supabase
              .from('sessions')
              .select('status')
              .eq('code', sessionCode)
              .single();

            if (sessionErr) {
              console.error('[Presence] Error fetching session status before cleanup:', sessionErr);
              return;
            }

            if (sessionRow && sessionRow.status !== 'waiting') {
              console.log('[Presence] No players connected and session not waiting, cleaning up:', sessionCode);
              await supabase.rpc('cleanup_session', { session_code_param: sessionCode });
              console.log('[Presence] Session cleaned up successfully');
            } else {
              console.log('[Presence] Session is waiting with 0 players; skipping cleanup');
            }
          } catch (cleanupError) {
            console.error('[Presence] Error during conditional cleanup:', cleanupError);
          }
        }
      } catch (err) {
        console.error('[Presence] Error in markAsDisconnected:', err);
      }
    };

    // Heartbeat pour maintenir la présence
    const sendHeartbeat = async () => {
      try {
        await supabase
          .from('players')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', playerId);
      } catch (err) {
        console.error('[Presence] Heartbeat error:', err);
      }
    };

    // Initialiser la présence
    markAsConnected();

    // Démarrer le heartbeat toutes les 30 secondes
    heartbeatInterval.current = window.setInterval(sendHeartbeat, 30000);

    // Gérer la fermeture de la page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Marquer comme déconnecté immédiatement
      markAsDisconnected();
    };

    // Gérer la perte de visibilité (changement d'onglet)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendHeartbeat();
      }
    };

    // Ajouter les event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Nettoyage
    return () => {
      console.log('[Presence] Cleaning up presence hooks');
      
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }

      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Marquer comme déconnecté au démontage
      markAsDisconnected();
    };
  }, [sessionCode, playerId]);
};
