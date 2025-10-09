import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Session = Database['public']['Tables']['sessions']['Row'];
type Player = Database['public']['Tables']['players']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

interface RealtimeSyncCallbacks {
  onSessionUpdate?: (session: Session) => void;
  onPlayerJoin?: (player: Player) => void;
  onPlayerLeave?: (player: Player) => void;
  onPlayerUpdate?: (player: Player) => void;
  onChatMessage?: (message: ChatMessage) => void;
}

export const useRealtimeSync = (
  sessionCode: string | null,
  callbacks: RealtimeSyncCallbacks
) => {
  // Utiliser useRef pour stocker les callbacks et éviter les re-souscriptions
  const callbacksRef = useRef(callbacks);
  
  // Mettre à jour la ref à chaque rendu (pas besoin de useEffect)
  callbacksRef.current = callbacks;
  
  useEffect(() => {
    if (!sessionCode) return;

    let channel: RealtimeChannel;

    const setupRealtimeSync = async () => {
      // Créer un canal Realtime pour la session
      channel = supabase.channel(`session:${sessionCode}`);

      // Écouter les changements sur la table sessions
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `code=eq.${sessionCode}`,
        },
        (payload) => {
          console.log('🔄 Session mise à jour en temps réel:', payload.new);
          if (callbacksRef.current.onSessionUpdate) {
            callbacksRef.current.onSessionUpdate(payload.new as Session);
          }
        }
      );

      // Écouter les changements sur la table players
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'players',
          filter: `session_code=eq.${sessionCode}`,
        },
        (payload) => {
          console.log('Player joined:', payload);
          if (callbacksRef.current.onPlayerJoin) {
            callbacksRef.current.onPlayerJoin(payload.new as Player);
          }
        }
      );

      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `session_code=eq.${sessionCode}`,
        },
        (payload) => {
          console.log('Player updated:', payload);
          const player = payload.new as Player;
          
          if (!player.is_connected && callbacksRef.current.onPlayerLeave) {
            callbacksRef.current.onPlayerLeave(player);
          } else if (callbacksRef.current.onPlayerUpdate) {
            callbacksRef.current.onPlayerUpdate(player);
          }
        }
      );

      // Écouter les nouveaux messages de chat
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_code=eq.${sessionCode}`,
        },
        (payload) => {
          console.log('Chat message received:', payload);
          if (callbacksRef.current.onChatMessage) {
            callbacksRef.current.onChatMessage(payload.new as ChatMessage);
          }
        }
      );

      // Souscrire au canal
      await channel.subscribe();
    };

    setupRealtimeSync();

    // Nettoyage
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [sessionCode]); // Retirer callbacks des dépendances
};
