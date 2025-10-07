-- Activer les mises à jour en temps réel pour la table chat_messages
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Créer une fonction pour nettoyer automatiquement une session
CREATE OR REPLACE FUNCTION public.cleanup_session(session_code_param TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Supprimer tous les messages de chat de cette session
  DELETE FROM public.chat_messages WHERE session_code = session_code_param;
  
  -- Supprimer tous les joueurs de cette session
  DELETE FROM public.players WHERE session_code = session_code_param;
  
  -- Supprimer la session elle-même
  DELETE FROM public.sessions WHERE code = session_code_param;
  
  RAISE NOTICE 'Session % cleaned up successfully', session_code_param;
END;
$$;