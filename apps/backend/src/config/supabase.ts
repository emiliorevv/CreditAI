import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const hasUrl = !!supabaseUrl;
const hasServiceKey = !!supabaseServiceKey;
const hasAnonKey = !!supabaseAnonKey;

console.log('--- Supabase Config ---');
console.log('URL Present:', hasUrl);
console.log('Service Role Key Present:', hasServiceKey);
console.log('Anon Key Present:', hasAnonKey);
console.log('-----------------------');

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase URL or Anon Key is missing. Check .env file.');
}

// Default client uses Anon key for RLS adherence.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getServiceRoleClient() {
    if (!supabaseServiceKey) {
        throw new Error('Supabase Service Role Key is missing.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}
