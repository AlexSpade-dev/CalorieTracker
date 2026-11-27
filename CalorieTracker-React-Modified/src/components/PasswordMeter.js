import { View } from 'react-native';
import { C, Row, T } from './kit';

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['', '#ff7a90', '#f5c24a', '#79d1ff', '#55d6a4'];

// same rules Supabase enforces: lower + upper + number + symbol (and 8+ characters)
export const checkPassword = (pw = '') => {
  const rules = [
    ['8+ characters', pw.length >= 8],
    ['a lowercase letter', /[a-z]/.test(pw)],
    ['an uppercase letter', /[A-Z]/.test(pw)],
    ['a number', /[0-9]/.test(pw)],
    ['a symbol', /[^A-Za-z0-9]/.test(pw)],
  ];
  const met = rules.filter((r) => r[1]).length;
  const ok = met === rules.length;
  let level = 0;
  if (pw.length) level = ok ? (pw.length >= 12 ? 4 : 3) : met >= 4 ? 2 : 1;
  return { ok, level, missing: rules.filter((r) => !r[1]).map((r) => r[0]) };
};

export function PasswordMeter({ value }) {
  const { level, missing } = checkPassword(value);
  const col = COLORS[level];
  return (
    <View style={{ marginBottom: 14 }}>
      <Row style={{ gap: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= level ? col : 'rgba(136,146,154,0.25)' }} />
        ))}
      </Row>
      <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
        <T s={10} c={C.outline} style={{ flex: 1, paddingRight: 8 }}>
          {missing.length ? `Needs ${missing.join(', ')}` : 'Meets all requirements'}
        </T>
        {level > 0 && <T w="bold" s={10} c={col}>{LABELS[level]}</T>}
      </Row>
    </View>
  );
}