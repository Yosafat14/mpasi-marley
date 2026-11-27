import { createClient } from '@supabase/supabase-js';

// URL dinormalisasi agar endpoint Auth (/auth/v1) dan REST (/rest/v1) berfungsi sempurna
const rawUrl = 'https://wglbahwzqeocavoghbxp.supabase.co/rest/v1/';
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
export const supabaseAnonKey = 'sb_publishable_fWsMkBsqZxrEHfktqDlVTw_Qm3IYbiV';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
