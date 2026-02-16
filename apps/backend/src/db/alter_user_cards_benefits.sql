-- MIGRATION: Support for Custom Card Benefits
-- Run this in Supabase SQL Editor

-- Add a JSONB column to store custom benefits (e.g. {"Dining": 4, "Groceries": 2})
ALTER TABLE public.user_cards ADD COLUMN custom_benefits jsonb DEFAULT '{}'::jsonb;

-- Add a column to store the reward type for custom cards (Points vs Cashback)
ALTER TABLE public.user_cards ADD COLUMN rewards_type_override text CHECK (rewards_type_override IN ('points', 'cashback'));
