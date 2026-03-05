import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from parent directory
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY; // Ideally Service Role Key, but anon for now if policies allow insert

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('🌱 Seeding Test User...');

    // 1. Create user in auth.users (This often requires Service Role Key or Admin API)
    // Since we might be restricted with anon key, let's try to just use a UUID that MIGHT exist or create a new one via SignUp

    const email = `test-${Date.now()}@credit.ai`;
    const password = 'password123';

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Error creating auth user:', authError.message);
        // If user already exists, maybe try login? Or just continue if we know the ID.
    }

    const userId = authData.user?.id;

    if (userId) {
        console.log(`✅ Created Auth User: ${userId} (${email})`);

        // 2. Insert into public.users (Profile)
        // This should happen automatically if triggers are set up, but let's manual safeguard
        const { error: profileError } = await supabase
            .from('users')
            .upsert({ id: userId, email, full_name: 'Test Dev User' });

        if (profileError) console.error('Error creating profile:', profileError.message);
        else console.log('✅ Created Public Profile');

        console.log('\nCopy this ID to your Frontend (client.ts):');
        console.log(userId);
    } else {
        console.log('⚠️ Could not create user. Check Supabase Auth settings (Is Email Signup enabled?)');
    }

    // Seeding Card Models (If not exist)
    const { count } = await supabase.from('card_models').select('*', { count: 'exact', head: true });
    if (count === 0) {
        console.log('Seeding Standard Card Models...');
        // ... insert logic ...
    }
}

seed();
