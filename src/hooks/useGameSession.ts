import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateSessionCode, getAllDoorCodes } from '@/lib/sessionCode';
import type { Database } from '@/integrations/supabase/types';

type Session = Database['public']['Tables']['sessions']['Row'];
type Player = Database['public']['Tables']['players']['Row'];

export const useGameSession = (sessionCode: string | null) => {
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Créer une nouvelle session
  const createSession = async (pseudo: string) => {
    try {
      const code = generateSessionCode();
      const playerId = crypto.randomUUID();
      const doorCodes = getAllDoorCodes();

      console.log('[useGameSession] Generated door codes:', doorCodes);

      // Créer la session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          code,
          host_id: playerId,
          current_zone: 1,
          timer_remaining: 3600,
          timer_running: false,
          inventory: [],
          solved_puzzles: {},
          hints_used: 0,
          status: 'waiting',
          door_codes: doorCodes,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Créer le joueur hôte
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          id: playerId,
          session_code: code,
          pseudo,
          is_host: true,
          is_connected: true,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      return { session: sessionData, player: playerData, code };
    } catch (err) {
      console.error('Error creating session:', err);
      throw err;
    }
  };

  // Rejoindre une session existante
  const joinSession = async (code: string, pseudo: string) => {
    try {
      // Vérifier que la session existe
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', code)
        .single();

      if (sessionError) throw new Error('Session non trouvée');

      // Vérifier que le pseudo n'est pas déjà pris
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('*')
        .eq('session_code', code)
        .eq('pseudo', pseudo)
        .single();

      if (existingPlayer) {
        // Reconnexion
        const { data: updatedPlayer, error: updateError } = await supabase
          .from('players')
          .update({ is_connected: true, last_seen: new Date().toISOString() })
          .eq('id', existingPlayer.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return { session: sessionData, player: updatedPlayer };
      }

      // Créer un nouveau joueur
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          session_code: code,
          pseudo,
          is_host: false,
          is_connected: true,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      return { session: sessionData, player: playerData };
    } catch (err) {
      console.error('Error joining session:', err);
      throw err;
    }
  };

  // Quitter la session
  const leaveSession = async () => {
    if (!currentPlayer) return;

    try {
      await supabase
        .from('players')
        .update({ is_connected: false })
        .eq('id', currentPlayer.id);
    } catch (err) {
      console.error('Error leaving session:', err);
    }
  };

  // Charger la session
  useEffect(() => {
    if (!sessionCode) {
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('code', sessionCode)
          .single();

        if (sessionError) throw sessionError;

        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('session_code', sessionCode)
          .order('joined_at', { ascending: true });

        if (playersError) throw playersError;

        setSession(sessionData);
        setPlayers(playersData || []);

        // Définir le joueur actuel depuis le localStorage
        const storedSession = localStorage.getItem('nemesis_session');
        if (storedSession && playersData) {
          try {
            const { playerId } = JSON.parse(storedSession);
            const player = playersData.find(p => p.id === playerId);
            if (player) {
              setCurrentPlayer(player);
            }
          } catch (e) {
            console.error('Error parsing stored session:', e);
          }
        }
      } catch (err) {
        console.error('Error loading session:', err);
        setError('Impossible de charger la session');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionCode]);

  return {
    session,
    players,
    currentPlayer,
    loading,
    error,
    createSession,
    joinSession,
    leaveSession,
    setCurrentPlayer,
    setSession,
    setPlayers,
  };
};
