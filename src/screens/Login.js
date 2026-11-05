import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field } from '../components/Field';
import { Backdrop, C, CTA, Icon, IconBox, Pill, Row, Sheet, T } from '../components/kit';
import { sendReset } from '../lib/auth';
import { signInWithProvider } from '../lib/socialAuth';

const AREAS = ['Nutrition Logging', 'Recipe Sync', 'Analytics', 'General Bug', 'UI Design'];
const RATING = ['', 'Poor', 'Fair', 'Good', 'Great', 'Radiant'];
const border = 'rgba(62,72,79,0.55)';

export default function Login({ onLogin, onSignUp, onSocial }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [dlg, setDlg] = useState(null); // 'forgot' | 'feedback'
  const [busy, setBusy] = useState(null); // 'google' | 'apple' while the provider page is open
  const [socialErr, setSocialErr] = useState('');

  const submit = async () => {
    if (loading) return;
    setLoading(true);
    const r = await onLogin(email.trim(), pw);
    setLoading(false);
    setErr(r.ok ? '' : (r.error || 'Invalid email or password.'));
  };
  // Opens Google's account chooser / Apple's sign-in via Supabase, then logs in with the verified account
  const social = async (provider) => {
    if (busy) return;
    setSocialErr(''); setBusy(provider);
    try {
      const u = await signInWithProvider(provider);
      if (u) onSocial && onSocial(provider, u.email, u.name, u.avatar);
    } catch (e) {
      setSocialErr(e?.message || 'Sign-in failed. Please try again.');
    } finally { setBusy(null); }
  };

  return (
    <Backdrop>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* top bar */}
            <Row style={{ justifyContent: 'space-between' }}>
              <Pill tone="neutral" style={{ paddingVertical: 5, flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary, marginRight: 6 }} />
                <T w="bold" s={9} c={C.secondary} style={{ letterSpacing: 0.8 }}>CALORIETRACKER+ PRECISION HEALTH</T>
              </Pill>
              <Pressable onPress={() => setDlg('feedback')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: border, backgroundColor: 'rgba(26,28,62,0.7)', marginLeft: 8 }}>
                <Icon n="feedback" s={14} c={C.primary} /><T w="semibold" s={11} c={C.onSurfaceVariant} style={{ marginLeft: 5 }}>Feedback</T>
              </Pressable>
            </Row>

            {/* hero */}
            <View style={{ alignItems: 'center', marginTop: 34 }}>
              <IconBox n="vital_signs" size={56} s={28} r={16} bg="rgba(26,28,62,0.9)" style={{ borderWidth: 1, borderColor: 'rgba(121,209,255,0.3)' }} />
              <Pill style={{ marginTop: 14 }}><T w="bold" s={9} c={C.primary} style={{ letterSpacing: 1.2 }}>INTELLIGENT NUTRITION ANALYTICS</T></Pill>
              <T w="extrabold" s={30} style={{ textAlign: 'center', marginTop: 12, lineHeight: 36, letterSpacing: -0.6 }}>Master your nutrition with scientific clarity.</T>
              <T s={13} c={C.onSurfaceVariant} style={{ textAlign: 'center', marginTop: 10, lineHeight: 19, maxWidth: 320 }}>Join over 50,000+ fitness enthusiasts tracking macros, caloric deficit, and energy burn in real time.</T>
            </View>

            {/* form */}
            <View style={{ marginTop: 26 }}>
              {err && (
                <Row style={{ backgroundColor: 'rgba(147,0,10,0.3)', borderColor: 'rgba(255,180,171,0.45)', borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 14 }}>
                  <Icon n="error" s={18} c={C.error} /><T s={12} c={C.error} style={{ flex: 1, marginLeft: 8 }}>{err}</T>
                </Row>
              )}
              <Field label="Email Address" req icon="mail" placeholder="alex@example.com" value={email} onChangeText={(v) => { setEmail(v); setErr(false); }} keyboardType="email-address" autoCapitalize="none" error={!!err} />
              <Field label="Password" req icon="lock" placeholder="••••••••" value={pw} onChangeText={(v) => { setPw(v); setErr(false); }} secureTextEntry={!show} error={!!err}
                right={<Pressable onPress={() => setShow(!show)} hitSlop={8}><Icon n={show ? 'visibility_off' : 'visibility'} s={18} c={C.primary} /></Pressable>} />
              <Row style={{ justifyContent: 'space-between', marginBottom: 18 }}>
                <Pressable onPress={() => setRemember(!remember)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 18, height: 18, borderRadius: 5, borderWidth: 1, borderColor: remember ? C.primaryContainer : border, backgroundColor: remember ? C.primaryContainer : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {remember && <Icon n="check" s={14} c={C.onPrimaryContainer} />}
                  </View>
                  <T s={12} c={C.onSurfaceVariant} style={{ marginLeft: 8 }}>Remember me</T>
                </Pressable>
                <Pressable onPress={() => setDlg('forgot')} hitSlop={8}><T w="semibold" s={12} c={C.primary}>Forgot Password?</T></Pressable>
              </Row>
              <CTA title={loading ? 'Signing in…' : 'Sign In'} onPress={submit} disabled={loading} />

              <Row style={{ marginVertical: 20 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: border }} />
                <T s={11} c={C.outline} style={{ marginHorizontal: 12 }}>or continue with</T>
                <View style={{ flex: 1, height: 1, backgroundColor: border }} />
              </Row>
              <Row style={{ gap: 12 }}>
                {[['google', 'Google', '#8ab4f8'], ['apple', 'Apple', C.text]].map(([ic, label, col]) => (
                  <Pressable key={label} onPress={() => social(ic)} disabled={!!busy} style={({ pressed }) => ({ flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: border, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', opacity: pressed || (busy && busy !== ic) ? 0.6 : 1 })}>
                    <FontAwesome name={ic} size={17} color={col} /><T w="semibold" s={14} style={{ marginLeft: 8 }}>{busy === ic ? 'Opening…' : label}</T>
                  </Pressable>
                ))}
              </Row>
              {socialErr ? <T s={11} c={C.error} style={{ marginTop: 10, textAlign: 'center' }}>{socialErr}</T> : null}
              <Row style={{ justifyContent: 'center', marginTop: 28 }}>
                <T s={13} c={C.onSurfaceVariant}>Don't have an account? </T>
                <Pressable onPress={onSignUp} hitSlop={8}><T w="bold" s={13} c={C.primary}>Sign Up</T></Pressable>
              </Row>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ForgotSheet visible={dlg === 'forgot'} onClose={() => setDlg(null)} initial={email} />
      <FeedbackSheet visible={dlg === 'feedback'} onClose={() => setDlg(null)} />
    </Backdrop>
  );
}

/* ---------------- Forgot password ---------------- */
function ForgotSheet({ visible, onClose, initial }) {
  const [mail, setMail] = useState(initial || '');
  const [sent, setSent] = useState(false);
  const [bad, setBad] = useState(false);
  const close = () => { setSent(false); setBad(false); onClose(); };
  const send = async () => {
    if (!/^\S+@\S+\.\S+$/.test(mail.trim())) { setBad(true); return; }
    setBad(false);
    try { await sendReset(mail); setSent(true); } catch (e) { setBad(true); }
  };
  return (
    <Sheet visible={visible} onClose={close}>
      {sent ? (
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <IconBox n="mark_email_read" size={52} s={26} r={26} bg="rgba(85,214,164,0.14)" c={C.green} />
          <T w="bold" s={20} style={{ marginTop: 12 }}>Link sent</T>
          <T s={13} c={C.onSurfaceVariant} style={{ textAlign: 'center', marginTop: 6, lineHeight: 19 }}>A password reset link was sent to {mail.trim()}. Check your inbox for the next steps.</T>
          <CTA title="Back to sign in" icon={null} onPress={close} style={{ alignSelf: 'stretch', marginTop: 18 }} />
        </View>
      ) : (
        <View>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Row style={{ flex: 1, alignItems: 'flex-start' }}>
              <IconBox n="lock_reset" size={40} s={22} bg="rgba(121,209,255,0.12)" style={{ borderWidth: 1, borderColor: 'rgba(121,209,255,0.25)' }} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <T w="bold" s={18}>Reset Password</T>
                <T s={12} c={C.onSurfaceVariant} style={{ marginTop: 2, lineHeight: 17 }}>Enter your registered email address to receive password reset telemetry and instructions.</T>
              </View>
            </Row>
            <Pressable onPress={close} hitSlop={10}><Icon n="close" s={20} c={C.outline} /></Pressable>
          </Row>
          <View style={{ height: 1, backgroundColor: 'rgba(62,72,79,0.5)', marginVertical: 16 }} />
          <Field label="Email Address" req icon="mail" placeholder="you@example.com" value={mail} onChangeText={(v) => { setMail(v); setBad(false); }} keyboardType="email-address" autoCapitalize="none" error={bad} style={{ marginBottom: bad ? 6 : 14 }} />
          {bad && <T s={11} c={C.error} style={{ marginBottom: 12 }}>Please enter a valid email address.</T>}
          <Row style={{ gap: 12 }}>
            <CTA tone="ghost" title="Back to Login" icon={null} onPress={close} style={{ flex: 1 }} />
            <CTA title="Send Reset Link" icon="send" onPress={send} style={{ flex: 1.2 }} />
          </Row>
        </View>
      )}
    </Sheet>
  );
}

/* ---------------- Feedback ---------------- */
function FeedbackSheet({ visible, onClose }) {
  const [stars, setStars] = useState(5);
  const [areas, setAreas] = useState(['Analytics']);
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const close = () => { setDone(false); onClose(); };
  const toggle = (a) => setAreas((x) => (x.includes(a) ? x.filter((i) => i !== a) : [...x, a]));
  return (
    <Sheet visible={visible} onClose={close}>
      {done ? (
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <IconBox n="check_circle" size={56} s={30} r={28} bg="rgba(85,214,164,0.14)" c={C.green} />
          <T w="bold" s={20} style={{ marginTop: 12 }}>Feedback Submitted!</T>
          <T s={13} c={C.onSurfaceVariant} style={{ textAlign: 'center', marginTop: 6, lineHeight: 19 }}>Thank you for your feedback! Your thoughts have been received and help us improve CalorieTracker+.</T>
          <Row style={{ marginTop: 14, padding: 10, borderRadius: 12, backgroundColor: C.bg, alignSelf: 'stretch', justifyContent: 'space-between' }}><T s={12} c={C.outline}>Confirmation Ref</T><T w="bold" s={12} c={C.primary}>#FB-94821-CT</T></Row>
          <CTA title="Done" icon={null} onPress={close} style={{ alignSelf: 'stretch', marginTop: 16 }} />
        </View>
      ) : (
        <ScrollView style={{ maxHeight: 560 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Row style={{ justifyContent: 'space-between' }}>
            <Row>
              <IconBox n="rate_review" size={40} s={20} style={{ borderWidth: 1, borderColor: 'rgba(121,209,255,0.25)' }} />
              <View style={{ marginLeft: 12 }}><T w="bold" s={18}>Share Your Feedback</T><T s={11} c={C.primary}>CalorieTracker+ Precision Health</T></View>
            </Row>
            <Pressable onPress={close} hitSlop={10}><Icon n="close" s={20} c={C.outline} /></Pressable>
          </Row>
          <View style={{ height: 1, backgroundColor: 'rgba(62,72,79,0.5)', marginVertical: 14 }} />
          <Row style={{ justifyContent: 'space-between' }}><T w="semibold" s={13}>Master your tracking experience</T><T w="bold" s={11} c={C.primary}>{stars} / 5 • {RATING[stars]}</T></Row>
          <Row style={{ marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: C.bg, justifyContent: 'space-between' }}>
            <Row>{[1, 2, 3, 4, 5].map((i) => <Pressable key={i} onPress={() => setStars(i)} hitSlop={4}><Icon n="star" s={30} c={i <= stars ? C.primary : 'rgba(136,146,154,0.4)'} style={{ marginRight: 6 }} /></Pressable>)}</Row>
            <T s={11} c={C.outline}>Tap to rate</T>
          </Row>
          <Row style={{ justifyContent: 'space-between', marginTop: 16 }}><T w="semibold" s={13}>What area are you reviewing?</T><T s={10} c={C.primary}>Select one or more</T></Row>
          <Row style={{ flexWrap: 'wrap', marginTop: 10 }}>
            {AREAS.map((a) => { const on = areas.includes(a); return (
              <Pressable key={a} onPress={() => toggle(a)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, marginRight: 8, marginBottom: 8, borderColor: on ? C.primary : 'rgba(62,72,79,0.6)', backgroundColor: on ? 'rgba(121,209,255,0.14)' : 'transparent' }}>
                <T w="semibold" s={12} c={on ? C.primary : C.onSurfaceVariant}>{a}</T>
              </Pressable>); })}
          </Row>
          <T w="semibold" s={13} style={{ marginTop: 8, marginBottom: 8 }}>Your Comments & Suggestions</T>
          <Field multiline value={text} onChangeText={setText} placeholder="Tell us what worked and what didn't..." style={{ marginBottom: 14 }} />
          <Row style={{ gap: 12 }}>
            <CTA tone="ghost" title="Cancel" icon={null} onPress={close} style={{ flex: 1 }} />
            <CTA title="Submit Feedback" icon="send" onPress={() => setDone(true)} style={{ flex: 1.5 }} />
          </Row>
        </ScrollView>
      )}
    </Sheet>
  );
}