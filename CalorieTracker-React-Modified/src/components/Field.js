import React from 'react';
import { View, TextInput } from 'react-native';
import { T, Row, Icon, C } from './kit';

export function Field({ label, req, hint, icon, right, multiline, error, style, inputStyle, ...p }) {
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      {(label || hint) && (
        <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <Row><T w="semibold" s={12} c={C.text}>{label}</T>{req && <T w="bold" s={12} c={C.error}> *</T>}</Row>
          {hint ? <T s={10} c={C.outline}>{hint}</T> : null}
        </Row>
      )}
      <Row style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: error ? C.error : 'rgba(62,72,79,0.55)', paddingHorizontal: 12, minHeight: multiline ? 88 : 48, alignItems: multiline ? 'flex-start' : 'center' }}>
        {icon ? <Icon n={icon} s={18} c={C.outline} style={{ marginRight: 10, marginTop: multiline ? 14 : 0 }} /> : null}
        <TextInput placeholderTextColor="rgba(136,146,154,0.7)" multiline={multiline}
          style={[{ flex: 1, color: C.text, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, paddingVertical: multiline ? 12 : 10, textAlignVertical: multiline ? 'top' : 'center' }, inputStyle]} {...p} />
        {right}
      </Row>
    </View>
  );
}
