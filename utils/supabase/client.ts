import { createClient } from '@supabase/supabase-js'

// We use the "!" at the end to tell TypeScript that we promise these variables exist in our .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This creates the single connection we will use throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)