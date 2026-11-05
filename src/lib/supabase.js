import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Put these in a .env file in the project root (Supabase -> Project Settings -> API):
// EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
// EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } },
);