-- First drop the trigger, then the function
DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
DROP FUNCTION IF EXISTS public.update_sessions_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_sessions() CASCADE;

-- Recreate function with secure search_path
CREATE OR REPLACE FUNCTION public.update_sessions_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sessions_updated_at();

-- Recreate cleanup function with secure search_path
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.sessions
  WHERE updated_at < now() - interval '24 hours'
    AND status IN ('completed', 'failed');
END;
$$;