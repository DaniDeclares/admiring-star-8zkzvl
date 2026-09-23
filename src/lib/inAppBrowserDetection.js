// Detects social apps' in-app "webview" browsers (Facebook, Instagram,
// LinkedIn, TikTok). These sandbox or wipe localStorage when the host app
// backgrounds or the webview is torn down, which breaks Supabase's PKCE
// auth flow: the code_verifier written during signUp()/signInWithOtp() in
// the webview may be gone by the time exchangeCodeForSession() runs against
// the confirmation link, failing the sign-up/sign-in silently or with an
// opaque "This sign-in link could not be completed" error.
const SIGNATURES = [
  { id: 'facebook', label: 'Facebook', pattern: /FBAN|FBAV|FB_IAB/i },
  { id: 'instagram', label: 'Instagram', pattern: /Instagram/i },
  { id: 'linkedin', label: 'LinkedIn', pattern: /LinkedInApp/i },
  { id: 'tiktok', label: 'TikTok', pattern: /BytedanceWebview|MusicalLy|TikTok/i },
];

export function detectInAppBrowser(userAgent) {
  const ua = userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  if (!ua) return null;
  const match = SIGNATURES.find(({ pattern }) => pattern.test(ua));
  return match ? { id: match.id, label: match.label } : null;
}
