

// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = 'https://htjpyfepsofqxsdubnck.supabase.co';
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0anB5ZmVwc29mcXhzZHVibmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzk3MzcsImV4cCI6MjA4MjYxNTczN30.cbAkVEHI6FMP2hcGX7gcR25ekl_RpTGhzp8BNTow4MU';

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dummy supabase object for localstorage implementation to prevent errors.
// All actual data operations will be handled via localStorage directly in components.
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    signInWithPassword: async () => ({ error: { message: 'Supabase is disabled. Use localStorage for login.' } }),
    signUp: async () => ({ error: { message: 'Supabase is disabled. Use localStorage for registration.' } }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({ single: async () => ({ data: null }), order: () => ({ data: null }) }),
      in: () => ({ data: null }),
      order: () => ({ data: null }),
      limit: () => ({ data: null }),
      match: () => ({ data: null }),
      count: '0'
    }),
    insert: async () => ({ data: null, error: { message: 'Supabase is disabled.' } }),
    update: async () => ({ data: null, error: { message: 'Supabase is disabled.' } }),
    delete: async () => ({ data: null, error: { message: 'Supabase is disabled.' } }),
    or: () => ({ data: null })
  })
};
