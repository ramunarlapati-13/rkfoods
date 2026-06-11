import { createClient } from '@supabase/supabase-js';
import { clientEnv } from './env';

const supabaseUrl = clientEnv.supabase.url;
const supabaseAnonKey = clientEnv.supabase.anonKey;

// Using placeholder strings if keys are missing to prevent runtime crash in local dev
// when the user has not yet configured their .env.local file.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
