import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

// provider: 'google' | 'apple'. Opens the provider's own sign-in page (Google shows its account chooser).
// Returns { email, name, avatar } or null if the user cancelled.
export async function signInWithProvider(provider) {
  const redirectTo = Linking.createURL('auth/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      // forces Google's "Choose an account" screen every time
      queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
    },
  });
  if (error) throw error;

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (res.type !== 'success') return null;

  const q = new URLSearchParams((res.url.split('#')[1] || res.url.split('?')[1] || ''));
  if (q.get('error_description')) throw new Error(q.get('error_description').replace(/\+/g, ' '));

  if (q.get('code')) {
    const { error: e } = await supabase.auth.exchangeCodeForSession(q.get('code'));
    if (e) throw e;
  } else if (q.get('access_token')) {
    const { error: e } = await supabase.auth.setSession({ access_token: q.get('access_token'), refresh_token: q.get('refresh_token') });
    if (e) throw e;
  } else return null;

  const { data: u, error: ue } = await supabase.auth.getUser();
  if (ue) throw ue;
  const m = u.user.user_metadata || {};
  return { email: u.user.email, name: m.full_name || m.name || '', avatar: m.avatar_url || m.picture || null };
}