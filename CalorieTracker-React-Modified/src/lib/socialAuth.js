import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

// Android: start the Chrome Custom Tab service BEFORE the user taps Google,
// so the sign-in page opens instantly instead of cold-starting (~0.5-1.5 s).
// Call warmUpBrowser() when the Login screen mounts and coolDownBrowser() when it unmounts.
// Many Android phones (Xiaomi/MIUI, Samsung, etc.) have another browser set as default, and Google's
// sign-in page can load very slowly there. Prefer Chrome when it is installed.
const CHROME = 'com.android.chrome';
let browserPromise = null;
function pickBrowser() {
  if (Platform.OS !== 'android') return Promise.resolve(undefined);
  if (!browserPromise) {
    browserPromise = WebBrowser.getCustomTabsSupportingBrowsersAsync()
      .then((r) => {
        if (__DEV__) console.log('[auth] default browser =', r.defaultBrowserPackage, '| available =', r.browserPackages.join(', '));
        return r.browserPackages.includes(CHROME) ? CHROME : undefined;
      })
      .catch(() => undefined);
  }
  return browserPromise;
}

export async function warmUpBrowser() {
  if (Platform.OS !== 'android') return;
  const pkg = await pickBrowser();
  WebBrowser.warmUpAsync(pkg).catch(() => {});
}
export async function coolDownBrowser() {
  if (Platform.OS !== 'android') return;
  const pkg = await pickBrowser();
  WebBrowser.coolDownAsync(pkg).catch(() => {});
}

// dev-only timing so you can see which step is slow in the Metro terminal
const stamp = (t0) => (label) => { if (__DEV__) console.log(`[auth] ${label}: ${Date.now() - t0} ms`); };

// provider: 'google' | 'apple'. Opens the provider's own sign-in page (Google shows its account chooser).
// Returns { email, name, avatar } or null if the user cancelled.
export async function signInWithProvider(provider) {
  const log = stamp(Date.now());
  const redirectTo = Linking.createURL('auth/callback');
  if (__DEV__) console.log('[auth] redirectTo =', redirectTo); // this exact URL must be in Supabase > Auth > URL Configuration > Redirect URLs

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
  log('oauth url ready');

  const browserPackage = await pickBrowser();
  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, browserPackage ? { browserPackage } : undefined);
  log(`browser returned (${res.type})`);
  if (res.type !== 'success') return null;

  const q = new URLSearchParams(res.url.split('#')[1] || res.url.split('?')[1] || '');
  if (q.get('error_description')) throw new Error(q.get('error_description').replace(/\+/g, ' '));

  // exchangeCodeForSession / setSession already return the signed-in user,
  // so the extra supabase.auth.getUser() network round trip is not needed.
  let user = null;
  if (q.get('code')) {
    const { data: s, error: e } = await supabase.auth.exchangeCodeForSession(q.get('code'));
    if (e) throw e;
    user = s.session?.user ?? s.user;
  } else if (q.get('access_token')) {
    const { data: s, error: e } = await supabase.auth.setSession({ access_token: q.get('access_token'), refresh_token: q.get('refresh_token') });
    if (e) throw e;
    user = s.session?.user ?? s.user;
  } else return null;
  log('session set');

  if (!user) return null;
  const m = user.user_metadata || {};
  return { email: user.email, name: m.full_name || m.name || '', avatar: m.avatar_url || m.picture || null };
}