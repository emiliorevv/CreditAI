-- Add user_id column to transactions table if it doesn't exist
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Backfill user_id from user_cards (if possible)
UPDATE public.transactions t
SET user_id = c.user_id
FROM public.user_cards c
WHERE t.card_id = c.id
AND t.user_id IS NULL;

-- Make user_id NOT NULL after backfill (optional, might fail if there are orphaned transactions)
ALTER TABLE public.transactions ALTER COLUMN user_id SET NOT NULL;

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure other tables have RLS (redundant check if schema.sql ran, but good for safety)
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;
