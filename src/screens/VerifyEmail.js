import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field } from '../components/Field';
import { Backdrop, C, CTA, Icon, IconBox, Row, T } from '../components/kit';

// Sign-up step between "Profile & Goals" and "Body & Macros":
// the user types the code we emailed to prove the address is theirs.
export default function VerifyEmail({ email, onSubmit, onResend, onBack }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(30); // seconds before "Resend" is allowed

  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const submit = async () => {
    if (busy) return;
    if (code.length < 6) { setErr('Enter the code from the email.'); return; }
    setBusy(true); setErr('');
    const r = await onSubmit(code);
    if (!r.ok) { setBusy(false); setErr(r.error || 'Wrong or expired code.'); }
  };
  const resend = async () => {
    if (wait > 0 || busy) return;
    setErr('');
    const r = await onResend();
    if (r.ok) setWait(30); else setErr(r.error || 'Could not resend the code.');
  };

  return (
    <Backdrop>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }} keyboardShouldPersistTaps="handled">
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <IconBox n="mark_email_read" size={56} s={28} r={16} bg="rgba(26,28,62,0.9)" />
              <T w="extrabold" s={26} style={{ marginTop: 14 }}>Verify your email</T>
              <T s={13} c={C.onSurfaceVariant} style={{ marginTop: 6, textAlign: 'center', lineHeight: 19 }}>We sent a verification code to {email}. Enter it below to continue.</T>
            </View>
            {!!err && (
              <Row style={{ backgroundColor: 'rgba(147,0,10,0.3)', borderColor: 'rgba(255,180,171,0.45)', borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 14 }}>
                <Icon n="error" s={18} c={C.error} /><T s={12} c={C.error} style={{ flex: 1, marginLeft: 8 }}>{err}</T>
              </Row>
            )}
            <Field label="Verification code" req icon="pin" placeholder="12345678" value={code} onChangeText={(v) => { setCode(v.replace(/[^0-9]/g, '')); setErr(''); }} keyboardType="numeric" maxLength={8} />
            <CTA title={busy ? 'Verifying…' : 'Verify & continue'} icon="check" onPress={submit} disabled={busy} style={{ marginTop: 6 }} />
            <Pressable onPress={resend} disabled={wait > 0 || busy} hitSlop={8} style={{ alignSelf: 'center', marginTop: 18, opacity: wait > 0 ? 0.5 : 1 }}>
              <T w="semibold" s={13} c={C.primary}>{wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}</T>
            </Pressable>
            <Pressable onPress={onBack} hitSlop={8} style={{ alignSelf: 'center', marginTop: 14 }}>
              <T w="semibold" s={13} c={C.onSurfaceVariant}>Use a different email</T>
            </Pressable>
            <T s={11} c={C.outline} style={{ textAlign: 'center', marginTop: 18 }}>Can't find it? Check your spam folder.</T>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Backdrop>
  );
}