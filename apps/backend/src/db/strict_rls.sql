-- RESTORE STRICT SECURITY
-- Run this file when you have implemented Authentication (Phase 5).
-- This secures the database so only logged-in users with a valid JWT can access their data.

-- 1. Drop the development policies
DROP POLICY IF EXISTS "Users can insert their own cards (DEV)" ON public.user_cards;
DROP POLICY IF EXISTS "Users can view cards (DEV)" ON public.user_cards;

-- 2. Re-create the STRICT policies (Requiring Auth Token)
CREATE POLICY "Users can insert their own cards" ON public.user_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own cards" ON public.user_cards
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Verify
-- After running this, the "Add Card" feature will FAIL until the frontend sends a real Supabase Auth Token.
