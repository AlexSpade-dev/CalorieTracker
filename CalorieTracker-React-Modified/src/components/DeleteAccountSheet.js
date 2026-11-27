import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Field } from './Field';
import { C, CTA, IconBox, Row, Sheet, T } from './kit';

export default function DeleteAccountSheet({ visible, onClose, onConfirm }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const ok = text.trim().toUpperCase() === 'DELETE' && !busy;

  const close = () => { if (busy) return; setText(''); setErr(''); onClose(); };
  const go = async () => {
    setBusy(true); setErr('');
    try { await onConfirm(); setText(''); }
    catch (e) { setErr(e?.message || 'Could not delete your account. Please try again.'); }
    finally { setBusy(false); }
  };

  return (
    <Sheet visible={visible} onClose={close} mode="center">
      <Row>
        <IconBox n="warning" size={40} s={22} r={20} bg="rgba(147,0,10,0.3)" c={C.error} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <T w="bold" s={18}>Delete account?</T>
          <T s={12} c={C.onSurfaceVariant}>This cannot be undone.</T>
        </View>
      </Row>
      <T s={13} c={C.onSurfaceVariant} style={{ marginTop: 14, lineHeight: 19 }}>
        Your profile, meals, water logs, weigh-ins and streak will be permanently deleted. Type DELETE to confirm.
      </T>
      <Field placeholder="DELETE" value={text} onChangeText={setText} autoCapitalize="characters" style={{ marginTop: 14, marginBottom: err ? 6 : 14 }} />
      {!!err && <T s={11} c={C.error} style={{ marginBottom: 12 }}>{err}</T>}
      <Row style={{ gap: 10 }}>
        <CTA tone="ghost" title="Cancel" icon={null} onPress={close} style={{ flex: 1 }} />
        <Pressable onPress={go} disabled={!ok} style={{ flex: 1.4, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: ok ? '#93000a' : 'rgba(147,0,10,0.35)' }}>
          {busy ? <ActivityIndicator color="#fff" /> : <T w="bold" s={14} c="#ffdad6">Delete my account</T>}
        </Pressable>
      </Row>
    </Sheet>
  );
}