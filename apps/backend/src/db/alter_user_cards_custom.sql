-- MIGRATION: Support for Custom Cards
-- Run this in Supabase SQL Editor

-- 1. Allow model_id to be NULL (for custom cards that don't match a preset)
ALTER TABLE public.user_cards ALTER COLUMN model_id DROP NOT NULL;

-- 2. Add fields for custom card details
ALTER TABLE public.user_cards ADD COLUMN name_override text;
ALTER TABLE public.user_cards ADD COLUMN issuer_override text;
ALTER TABLE public.user_cards ADD COLUMN card_network text; -- e.g. Visa, Mastercard, Amex

-- 3. Validation: Ensure either model_id IS SET OR (name_override AND issuer_override ARE SET)
-- note: this is a bit complex to enforce strictly in SQL without a function, 
-- but we can add a CHECK constraint if supported, or enforce in App Logic.
-- For now, we'll enforce in App Logic to keep it simple.
