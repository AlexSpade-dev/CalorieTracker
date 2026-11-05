import React, { useState } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { Backdrop, T, Row, Icon, CTA, Pill, Sheet, IconBox, C } from '../components/kit';
import { Field } from '../components/Field';
import { IMG } from '../data/images';

const AREAS = ['Nutrition Logging', 'Recipe Sync', 'Analytics', 'General Bug', 'UI Design'];
const RATING = ['', 'Poor', 'Fair', 'Good', 'Great', 'Radiant'];
const border = 'rgba(62,72,79,0.55)';

export default function Login({ onLogin, onSignUp }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState(false);
  const [dlg, setDlg] = useState(null); // 'apple' | 'google' | 'forgot' | 'feedback'

  const submit = () => { const ok = onLogin(email.trim(), pw); setErr(!ok); };
  const social = () => { setDlg(null); onLogin('alex@example.com', '1412'); };

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
                  <Icon n="error" s={18} c={C.error} /><T s={12} c={C.error} style={{ flex: 1, marginLeft: 8 }}>Invalid email or password. Try alex@example.com / 1412</T>
                </Row>
              )}
              <Field label="Email Address" req icon="mail" placeholder="alex@example.com" value={email} onChangeText={(v) => { setEmail(v); setErr(false); }} keyboardType="email-address" autoCapitalize="none" error={err} />
              <Field label="Password" req icon="lock" placeholder="••••••••" value={pw} onChangeText={(v) => { setPw(v); setErr(false); }} secureTextEntry={!show} error={err}
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
              <CTA title="Sign In" onPress={submit} />

              <Row style={{ marginVertical: 20 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: border }} />
                <T s={11} c={C.outline} style={{ marginHorizontal: 12 }}>or continue with</T>
                <View style={{ flex: 1, height: 1, backgroundColor: border }} />
              </Row>
              <Row style={{ gap: 12 }}>
                {[['google', 'Google', '#8ab4f8'], ['apple', 'Apple', C.text]].map(([ic, label, col]) => (
                  <Pressable key={label} onPress={() => setDlg(ic)} style={({ pressed }) => ({ flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: border, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', opacity: pressed ? 0.8 : 1 })}>
                    <FontAwesome name={ic} size={17} color={col} /><T w="semibold" s={14} style={{ marginLeft: 8 }}>{label}</T>
                  </Pressable>
                ))}
              </Row>
              <Row style={{ justifyContent: 'center', marginTop: 28 }}>
                <T s={13} c={C.onSurfaceVariant}>Don't have an account? </T>
                <Pressable onPress={onSignUp} hitSlop={8}><T w="bold" s={13} c={C.primary}>Sign Up</T></Pressable>
              </Row>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <AppleSheet visible={dlg === 'apple'} onClose={() => setDlg(null)} onContinue={social} />
      <GoogleSheet visible={dlg === 'google'} onClose={() => setDlg(null)} onPick={social} />
      <ForgotSheet visible={dlg === 'forgot'} onClose={() => setDlg(null)} initial={email} />
      <FeedbackSheet visible={dlg === 'feedback'} onClose={() => setDlg(null)} />
    </Backdrop>
  );
}

/* ---------------- Apple ---------------- */
function AppleSheet({ visible, onClose, onContinue }) {
  const [hide, setHide] = useState(true);
  const Opt = ({ on, label, sub, badge, onPress }) => (
    <Pressable onPress={onPress} style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: on ? 'rgba(10,132,255,0.6)' : 'rgba(255,255,255,0.1)', backgroundColor: on ? 'rgba(10,132,255,0.1)' : 'rgba(255,255,255,0.04)', marginTop: 8 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Row><T w="semibold" s={13} c="#fff">{label}</T>{badge && <View style={{ marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: 'rgba(10,132,255,0.3)' }}><T w="bold" s={9} c="#8ec5ff">{badge}</T></View>}</Row>
          {sub ? <T s={11} c="#9aa0a6" style={{ marginTop: 2 }}>{sub}</T> : null}
        </View>
        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? '#0a84ff' : '#48484a', backgroundColor: on ? '#0a84ff' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{on && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}</View>
      </Row>
    </Pressable>
  );
  return (
    <Sheet visible={visible} onClose={onClose} style={{ backgroundColor: '#1c1c1e', borderColor: 'rgba(255,255,255,0.12)' }}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}><FontAwesome name="apple" size={26} color="#000" /></View>
        <T w="bold" s={17} c="#fff" style={{ marginTop: 10 }}>Sign in with Apple</T>
        <T s={12} c="#9aa0a6" style={{ marginTop: 3, textAlign: 'center' }}>Use your Apple ID to sign in to <T w="semibold" s={12} c="#8ec5ff">CalorieTracker+</T></T>
      </View>
      <View style={{ marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View><T s={10} c="#9aa0a6">Apple ID</T><Row><T w="bold" s={13} c="#fff">alex@example.com </T><Icon n="check_circle" s={13} c="#30d158" /></Row></View>
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)' }}><T w="bold" s={9} c="#d0d0d0">FACE ID</T></View>
        </Row>
        <Row style={{ justifyContent: 'space-between', marginTop: 10 }}><T s={12} c="#9aa0a6">Name</T><T w="bold" s={13} c="#fff">Alex Rivera</T></Row>
      </View>
      <Opt on={!hide} label="Share My Email" sub="alex@example.com" onPress={() => setHide(false)} />
      <Opt on={hide} label="Hide My Email" badge="Private Relay" sub="alx_89f2k5@privaterelay.appleid.com" onPress={() => setHide(true)} />
      <Row style={{ marginTop: 12, justifyContent: 'center' }}><Icon n="fingerprint" s={14} c="#0a84ff" /><T s={11} c="#9aa0a6" style={{ marginLeft: 6 }}>Double-click Side Button or tap Continue for Face ID</T></Row>
      <Pressable onPress={onContinue} style={{ height: 48, borderRadius: 999, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 14 }}>
        <Icon n="fingerprint" s={18} c="#000" /><T w="bold" s={14} c="#000" style={{ marginLeft: 8 }}>Continue with Password / Face ID</T>
      </Pressable>
      <Pressable onPress={onClose} style={{ alignItems: 'center', paddingTop: 14 }}><T w="semibold" s={13} c="#9aa0a6">Cancel</T></Pressable>
    </Sheet>
  );
}

/* ---------------- Google ---------------- */
function GoogleSheet({ visible, onClose, onPick }) {
  const acct = (name, mail, avatar, initial) => (
    <Pressable onPress={onPick} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', marginTop: 8 })}>
      {avatar ? <Image source={{ uri: avatar }} style={{ width: 36, height: 36, borderRadius: 18 }} />
        : <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#3c4a73', alignItems: 'center', justifyContent: 'center' }}><T w="bold" s={14} c="#fff">{initial}</T></View>}
      <View style={{ flex: 1, marginLeft: 12 }}><T w="semibold" s={13} c="#fff">{name}</T><T s={11} c="#9aa0a6">{mail}</T></View>
      <Icon n="chevron_right" s={20} c="#9aa0a6" />
    </Pressable>
  );
  return (
    <Sheet visible={visible} onClose={onClose} style={{ backgroundColor: '#202124', borderColor: 'rgba(255,255,255,0.1)' }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row><FontAwesome name="google" size={16} color="#8ab4f8" /><T w="semibold" s={14} c="#fff" style={{ marginLeft: 8 }}>Sign in with Google</T></Row>
        <Pressable onPress={onClose} hitSlop={10}><Icon n="close" s={20} c="#9aa0a6" /></Pressable>
      </Row>
      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 14 }} />
      <T w="bold" s={20} c="#fff">Choose an account</T>
      <T s={12} c="#9aa0a6" style={{ marginTop: 4 }}>to continue to <T w="semibold" s={12} c="#8ab4f8">CalorieTracker+ Precision Health</T></T>
      {acct('Alex Rivera', 'alex@example.com', IMG.googleAvatar)}
      {acct('Morgan Vance', 'morgan.vance@calorietracker.fit', null, 'M')}
      <Row style={{ padding: 12, marginTop: 8 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}><Icon n="person_add" s={18} c="#c4c7c5" /></View>
        <T w="semibold" s={13} c="#fff" style={{ marginLeft: 12 }}>Use another account</T>
      </Row>
      <T s={10} c="#9aa0a6" style={{ lineHeight: 15, marginTop: 6 }}>To continue, Google will share your name, email address, language preference, and profile picture with CalorieTracker+. Before using this app, review CalorieTracker+'s <T s={10} c="#8ab4f8">Privacy Policy</T> and <T s={10} c="#8ab4f8">Terms of Service</T>.</T>
      <Pressable onPress={onClose} style={{ height: 44, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}><T w="semibold" s={13} c="#e8eaed">Cancel</T></Pressable>
    </Sheet>
  );
}

/* ---------------- Forgot password ---------------- */
function ForgotSheet({ visible, onClose, initial }) {
  const [mail, setMail] = useState(initial || '');
  const [sent, setSent] = useState(false);
  const [bad, setBad] = useState(false);
  const close = () => { setSent(false); setBad(false); onClose(); };
  const send = () => { if (!/^\S+@\S+\.\S+$/.test(mail.trim())) { setBad(true); return; } setBad(false); setSent(true); };
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
