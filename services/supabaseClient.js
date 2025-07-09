import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://imqfsgfxwwbiwdabqqid.supabase.co'; // ✅ altere aqui
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcWZzZ2Z4d3diaXdkYWJxcWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NjU4OTEsImV4cCI6MjA2MzQ0MTg5MX0.8NcXh1l3Bpe7CwZfEk_sDCMeVewCWRLnYHWZbd_pjOQ'; // ✅ altere aqui

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

