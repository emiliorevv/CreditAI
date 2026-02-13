import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''; // Use Service Role Key if strict backend admin access is needed

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase URL or Key is missing. Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
