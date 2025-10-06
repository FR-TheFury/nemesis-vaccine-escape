-- Create enum for session status
CREATE TYPE session_status AS ENUM ('waiting', 'active', 'completed', 'failed');

-- Create sessions table
CREATE TABLE public.sessions (
  code TEXT PRIMARY KEY,
  host_id UUID NOT NULL,
  current_zone INTEGER NOT NULL DEFAULT 1,
  timer_remaining INTEGER NOT NULL DEFAULT 3600,
  timer_running BOOLEAN NOT NULL DEFAULT false,
  inventory JSONB NOT NULL DEFAULT '[]'::jsonb,
  solved_puzzles JSONB NOT NULL DEFAULT '{}'::jsonb,
  hints_used INTEGER NOT NULL DEFAULT 0,
  status session_status NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT NOT NULL REFERENCES public.sessions(code) ON DELETE CASCADE,
  pseudo TEXT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_connected BOOLEAN NOT NULL DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_code, pseudo)
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT NOT NULL REFERENCES public.sessions(code) ON DELETE CASCADE,
  player_pseudo TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'chat',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Sessions are viewable by anyone with the code"
  ON public.sessions FOR SELECT
  USING (true);

CREATE POLICY "Sessions can be created by anyone"
  ON public.sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sessions can be updated by anyone"
  ON public.sessions FOR UPDATE
  USING (true);

-- RLS Policies for players
CREATE POLICY "Players are viewable by anyone in same session"
  ON public.players FOR SELECT
  USING (true);

CREATE POLICY "Players can be created by anyone"
  ON public.players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players can update their own data"
  ON public.players FOR UPDATE
  USING (true);

-- RLS Policies for chat_messages
CREATE POLICY "Chat messages are viewable by anyone in same session"
  ON public.chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Chat messages can be created by anyone"
  ON public.chat_messages FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_sessions_code ON public.sessions(code);
CREATE INDEX idx_players_session_code ON public.players(session_code);
CREATE INDEX idx_players_is_connected ON public.players(is_connected);
CREATE INDEX idx_chat_messages_session_code ON public.chat_messages(session_code);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sessions_updated_at();

-- Create function to clean up old sessions (optional, for maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.sessions
  WHERE updated_at < now() - interval '24 hours'
    AND status IN ('completed', 'failed');
END;
$$ LANGUAGE plpgsql;