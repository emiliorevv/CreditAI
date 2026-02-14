-- CRITICAL FIX FOR DEVELOPMENT WITHOUT AUTH
-- The current policy requires a JWT (auth.uid()) which we don't have in this simple prototype.
-- We will DROP the strict policy and add a permissive one for development.

-- 1. Drop the strict policy
DROP POLICY IF EXISTS "Users can insert their own cards" ON public.user_cards;

-- 2. Create a permissive policy (allows ANYONE with the Anon Key to insert for ANY user_id)
-- WARNING: This is insecure for production, but necessary for this prototype phase without Auth UI.
CREATE POLICY "Users can insert their own cards (DEV)" ON public.user_cards
  FOR INSERT WITH CHECK (true);

-- 3. Also fix the Select policy to allow viewing without JWT
DROP POLICY IF EXISTS "Users can view their own cards" ON public.user_cards;
CREATE POLICY "Users can view cards (DEV)" ON public.user_cards
  FOR SELECT USING (true);
