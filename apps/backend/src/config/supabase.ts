import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const hasUrl = !!supabaseUrl;
const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasAnonKey = !!process.env.SUPABASE_ANON_KEY || !!process.env.VITE_SUPABASE_ANON_KEY;

console.log('--- Supabase Config ---');
console.log('URL Present:', hasUrl);
console.log('Service Role Key Present:', hasServiceKey);
console.log('Anon Key Present:', hasAnonKey);
console.log('Using Key Type:', hasServiceKey ? 'SERVICE_ROLE' : 'ANON');
console.log('-----------------------');

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase URL or Key is missing. Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
