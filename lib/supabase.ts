
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://htjpyfepsofqxsdubnck.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0anB5ZmVwc29mcXhzZHVibmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzk3MzcsImV4cCI6MjA4MjYxNTczN30.cbAkVEHI6FMP2hcGX7gcR25ekl_RpTGhzp8BNTow4MU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
