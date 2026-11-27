// Expo Router reads this file for incoming deep links (native only).
// The OAuth callback is handled in socialAuth.js, so send the link to the
// home route instead of letting the router look for a missing screen.
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  if (path.includes('auth/callback')) return '/';
  return path;
}