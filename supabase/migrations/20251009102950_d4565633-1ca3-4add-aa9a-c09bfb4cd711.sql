-- Add is_preloading column to sessions table
ALTER TABLE public.sessions 
ADD COLUMN is_preloading boolean NOT NULL DEFAULT false;