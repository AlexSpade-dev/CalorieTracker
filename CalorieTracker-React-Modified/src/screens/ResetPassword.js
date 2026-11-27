import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field } from '../components/Field';
import { Backdrop, C, CTA, Icon, IconBox, Row, T } from '../components/kit';

export default function ResetPassword({ onSubmit, onCancel }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    if (pw.length < 8) { setErr('Use at least 8 characters.'); return; }
    if (pw !== pw2) { setErr('Passwords do not match.'); return; }
    setBusy(true);
    const r = await onSubmit(pw);
    setBusy(false);
    if (!r.ok) setErr(r.error || 'Could not update password.');
  };

  const eye = <Pressable onPress={() => setShow(!show)} hitSlop={8}><Icon n={show ? 'visibility_off' : 'visibility'} s={18} c={C.primary} /></Pressable>;

  return (
    <Backdrop>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }} keyboardShouldPersistTaps="handled">
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <IconBox n="lock_reset" size={56} s={28} r={16} bg="rgba(26,28,62,0.9)" />
              <T w="extrabold" s={26} style={{ marginTop: 14 }}>Set a new password</T>
              <T s={13} c={C.onSurfaceVariant} style={{ marginTop: 6, textAlign: 'center' }}>Choose a new password for your account.</T>
            </View>
            {!!err && (
              <Row style={{ backgroundColor: 'rgba(147,0,10,0.3)', borderColor: 'rgba(255,180,171,0.45)', borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 14 }}>
                <Icon n="error" s={18} c={C.error} /><T s={12} c={C.error} style={{ flex: 1, marginLeft: 8 }}>{err}</T>
              </Row>
            )}
            <Field label="New password" req icon="lock" placeholder="At least 8 characters" value={pw} onChangeText={(v) => { setPw(v); setErr(''); }} secureTextEntry={!show} right={eye} />
            <Field label="Confirm password" req icon="lock" placeholder="Repeat password" value={pw2} onChangeText={(v) => { setPw2(v); setErr(''); }} secureTextEntry={!show} />
            <CTA title={busy ? 'Saving…' : 'Update password'} icon="check" onPress={submit} disabled={busy} style={{ marginTop: 6 }} />
            <Pressable onPress={onCancel} hitSlop={8} style={{ alignSelf: 'center', marginTop: 18 }}><T w="semibold" s={13} c={C.primary}>Back to sign in</T></Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Backdrop>
  );
}