import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field } from '../components/Field';
import { Backdrop, C, Choice, CTA, Icon, IconBox, Pill, Row, Sheet, T } from '../components/kit';

const border = 'rgba(62,72,79,0.55)';

function TopBar({ step, label, onBack }) {
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: border, alignItems: 'center', justifyContent: 'center' }}>
        <Icon n="arrow_back" s={18} c={C.text} />
      </Pressable>
      <Row style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: C.surface, borderWidth: 1, borderColor: border }}>
        <View style={{ width: 34, height: 4, borderRadius: 2, backgroundColor: 'rgba(62,72,79,0.6)', overflow: 'hidden', marginRight: 8 }}>
          <View style={{ width: step === 1 ? '50%' : '100%', height: 4, backgroundColor: C.primary }} />
        </View>
        <T w="semibold" s={11} c={C.onSurfaceVariant}>{label}</T>
      </Row>
      <Icon n="bolt" s={20} c={C.primary} />
    </Row>
  );
}

const Head = ({ title, sub }) => (
  <View style={{ marginTop: 22, marginBottom: 20 }}>
    <Pill style={{ alignSelf: 'flex-start', marginBottom: 10 }}><T w="bold" s={10} c={C.primary}>CalorieTracker+</T></Pill>
    <T w="extrabold" s={32} style={{ letterSpacing: -0.8, lineHeight: 38 }}>{title}</T>
    <T s={13} c={C.onSurfaceVariant} style={{ marginTop: 6 }}>{sub}</T>
  </View>
);

function strength(pw) {
  const checks = [pw.length >= 8, /\d/.test(pw), /[^A-Za-z0-9]/.test(pw), /[A-Z]/.test(pw)];
  const n = checks.filter(Boolean).length;
  return { n: pw ? n : 0, label: !pw ? 'Enter a password' : n <= 1 ? 'Weak' : n === 2 ? 'Fair' : n === 3 ? 'Good' : 'Strong' };
}

function Missing({ items, onClose }) {
  return (
    <Sheet visible={items.length > 0} onClose={onClose} mode="center">
      <Row>
        <IconBox n="error_outline" c={C.error} bg="rgba(255,180,171,0.12)" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <T w="bold" s={17}>Almost there!</T>
          <T s={12} c={C.onSurfaceVariant}>Please complete these to continue:</T>
        </View>
      </Row>
      <View style={{ marginTop: 14, marginBottom: 18 }}>
        {items.map((m) => (
          <Row key={m} style={{ marginBottom: 8, alignItems: 'flex-start' }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.error, marginTop: 6, marginRight: 10 }} />
            <T s={13} c={C.text} style={{ flex: 1 }}>{m}</T>
          </Row>
        ))}
      </View>
      <CTA title="Got it" icon={null} onPress={onClose} />
    </Sheet>
  );
}

const GOALS = [
  { kcal: 1800, tag: 'DEFICIT', desc: 'Fat Loss & Lean Conditioning', icon: 'local_fire_department', tint: '#ffb4ab' },
  { kcal: 2200, tag: 'OPTIMAL', desc: 'Maintenance & Daily Energy', icon: 'balance', tint: C.primary },
  { kcal: 2600, tag: 'SURPLUS', desc: 'Muscle Gain & Hypertrophy', icon: 'fitness_center', tint: '#b6c4fd' },
];

export function SignUp1({ draft, onNext, onBack, onSignIn }) {
  const [d, setD] = useState({ name: '', email: '', password: '', goal: 2200, agree: false, ...draft });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState({});
  const [miss, setMiss] = useState([]);
  const set = (k, v) => { setD((x) => ({ ...x, [k]: v })); setErr((e) => ({ ...e, [k]: false })); };
  const st = strength(d.password);
  const barCol = st.n <= 1 ? C.error : st.n === 2 ? '#ffd27a' : C.primary;

  const next = () => {
    const e = { name: !d.name.trim(), email: !/^\S+@\S+\.\S+$/.test(d.email.trim()), password: d.password.length < 6, agree: !d.agree };
    setErr(e);
    const list = [];
    if (e.name) list.push('Enter your full name');
    if (e.email) list.push('Enter a valid email address');
    if (e.password) list.push('Password must be at least 6 characters');
    if (e.agree) list.push('Agree to the Terms of Service and Privacy Policy');
    if (list.length) setMiss(list); else onNext(d);
  };

  return (
    <Backdrop>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TopBar step={1} label="Step 1 of 2: Profile & Goals" onBack={onBack} />
            <Head title={'Start Your Health\nJourney'} sub="Join 50,000+ members tracking nutrition daily" />

            <Field label="Full Name" hint="Required" icon="person_outline" placeholder="e.g. Alex Morgan" value={d.name} onChangeText={(v) => set('name', v)} error={err.name} />
            <Field label="Email Address" hint="Verification link will be sent" icon="mail_outline" placeholder="alex@example.com" value={d.email} onChangeText={(v) => set('email', v)} keyboardType="email-address" autoCapitalize="none" error={err.email} />
            <Field label="Password" hint={st.n ? st.label : undefined} icon="vpn_key" placeholder="Create a strong password" value={d.password} onChangeText={(v) => set('password', v)} secureTextEntry={!show} error={err.password} style={{ marginBottom: 8 }}
              right={<Pressable onPress={() => setShow(!show)} hitSlop={8}><Icon n={show ? 'visibility_off' : 'visibility'} s={18} c={C.outline} /></Pressable>} />
            <Row style={{ gap: 6, marginBottom: 6 }}>
              {[0, 1, 2, 3].map((i) => <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i < st.n ? barCol : 'rgba(62,72,79,0.6)' }} />)}
            </Row>
            <T s={10} c={C.outline} style={{ marginBottom: 18 }}>Includes numbers, symbols, and uppercase letters</T>

            <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}><T w="semibold" s={13}>Daily Calorie Goal</T><T s={10} c={C.outline}>Can be changed later</T></Row>
            {GOALS.map((g) => {
              const on = d.goal === g.kcal;
              return (
                <Choice key={g.kcal} on={on} onPress={() => set('goal', g.kcal)}>
                  <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: on ? C.primary : 'rgba(136,146,154,0.6)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>{on && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary }} />}</View>
                  <View style={{ flex: 1 }}>
                    <Row><T w="bold" s={15}>{g.kcal.toLocaleString('en-US')} kcal</T><View style={{ marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: 'rgba(121,209,255,0.12)' }}><T w="bold" s={9} c={g.tint} style={{ letterSpacing: 0.6 }}>{g.tag}</T></View></Row>
                    <T s={11} c={C.onSurfaceVariant} style={{ marginTop: 2 }}>{g.desc}</T>
                  </View>
                  <Icon n={g.icon} s={18} c={on ? C.primary : C.outline} />
                </Choice>
              );
            })}

            <Pressable onPress={() => set('agree', !d.agree)} style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 4, marginBottom: 18 }}>
              <View style={{ width: 18, height: 18, borderRadius: 5, borderWidth: 1, borderColor: err.agree ? C.error : d.agree ? C.primaryContainer : border, backgroundColor: d.agree ? C.primaryContainer : 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{d.agree && <Icon n="check" s={14} c={C.onPrimaryContainer} />}</View>
              <T s={12} c={C.onSurfaceVariant} style={{ flex: 1, marginLeft: 10, lineHeight: 18 }}>I agree to the <T w="semibold" s={12} c={C.text} style={{ textDecorationLine: 'underline' }}>Terms of Service</T> and acknowledge the <T w="semibold" s={12} c={C.text} style={{ textDecorationLine: 'underline' }}>Privacy Policy</T>.</T>
            </Pressable>
            <CTA title="Next" onPress={next} />
            <Missing items={miss} onClose={() => setMiss([])} />
            <Row style={{ justifyContent: 'center', marginTop: 20 }}>
              <T s={13} c={C.onSurfaceVariant}>Already have an account? </T>
              <Pressable onPress={onSignIn} hitSlop={8}><T w="bold" s={13} c={C.primary}>Sign In</T></Pressable>
            </Row>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Backdrop>
  );
}

const LEVELS = [
  { id: 'light', title: 'Light / Sedentary', mult: '1.2x BMR', desc: 'Desk job, little to no structured workout', icon: 'weekend' },
  { id: 'moderate', title: 'Moderately Active', mult: '1.55x BMR', desc: '3–5 training sessions / gym workouts per week', icon: 'fitness_center' },
  { id: 'very', title: 'Very Active / Athlete', mult: '1.75x BMR', desc: 'Heavy daily training, endurance or labor work', icon: 'sprint' },
];

export function SignUp2({ draft, onBack, onComplete, onSkip }) {
  const [d, setD] = useState({ sex: 'Male', age: '', height: '', weight: '', target: '', level: 'moderate', ...draft });
  const [err, setErr] = useState({});
  const [miss, setMiss] = useState([]);
  const set = (k, v) => { setD((x) => ({ ...x, [k]: v })); setErr((e) => ({ ...e, [k]: false })); };
  const num = (k) => (v) => set(k, v.replace(/[^0-9.]/g, ''));

  const done = () => {
    const e = { age: !+d.age, height: !+d.height, weight: !+d.weight, target: !+d.target };
    setErr(e);
    const list = [];
    if (e.age) list.push('Enter your age');
    if (e.height) list.push('Enter your height (cm)');
    if (e.weight) list.push('Enter your current weight (kg)');
    if (e.target) list.push('Enter your target weight (kg)');
    if (list.length) setMiss(list); else onComplete(d);
  };

  return (
    <Backdrop>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TopBar step={2} label="Step 2 of 2: Body & Macros" onBack={onBack} />
            <Head title="Physical Stats & Targets" sub="Personalize your metabolic burn rate and macro ratios" />

            <T w="semibold" s={13} style={{ marginBottom: 8 }}>Biological Sex</T>
            <Row style={{ gap: 12, marginBottom: 16 }}>
              {[['Male', 'male'], ['Female', 'female']].map(([s, ic]) => {
                const on = d.sex === s;
                return (
                  <Pressable key={s} onPress={() => set('sex', s)} style={{ flex: 1, height: 46, borderRadius: 12, borderWidth: on ? 1.5 : 1, borderColor: on ? C.primary : border, backgroundColor: on ? 'rgba(26,155,205,0.16)' : C.surface, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                    <Icon n={ic} s={17} c={on ? C.primary : C.outline} /><T w="semibold" s={13} c={on ? C.primary : C.onSurfaceVariant} style={{ marginLeft: 7 }}>{s}</T>
                  </Pressable>
                );
              })}
            </Row>

            <Row style={{ gap: 12 }}>
              <Field style={{ flex: 1 }} label="Age" hint="Years" icon="calendar_today" placeholder="e.g. 26" value={d.age} onChangeText={num('age')} keyboardType="numeric" error={err.age} />
              <Field style={{ flex: 1 }} label="Height" hint="cm" icon="height" placeholder="e.g. 178" value={d.height} onChangeText={num('height')} keyboardType="numeric" error={err.height} />
            </Row>
            <Row style={{ gap: 12 }}>
              <Field style={{ flex: 1 }} label="Current Weight" hint="kg" icon="monitor_weight" placeholder="e.g. 74.5" value={d.weight} onChangeText={num('weight')} keyboardType="numeric" error={err.weight} />
              <Field style={{ flex: 1 }} label="Target Goal" hint="kg" icon="flag" placeholder="e.g. 70.0" value={d.target} onChangeText={num('target')} keyboardType="numeric" error={err.target} />
            </Row>

            <Row style={{ justifyContent: 'space-between', marginTop: 4, marginBottom: 8 }}><T w="semibold" s={13}>Daily Activity Level</T><T s={10} c={C.outline}>Can be changed later</T></Row>
            {LEVELS.map((l) => {
              const on = d.level === l.id;
              return (
                <Choice key={l.id} on={on} onPress={() => set('level', l.id)}>
                  <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: on ? C.primary : 'rgba(136,146,154,0.6)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>{on && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary }} />}</View>
                  <View style={{ flex: 1 }}>
                    <Row><T w="bold" s={14}>{l.title}</T><View style={{ marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: on ? 'rgba(121,209,255,0.2)' : 'rgba(136,146,154,0.15)' }}><T w="bold" s={9} c={on ? C.primary : C.outline}>{l.mult}</T></View></Row>
                    <T s={11} c={C.onSurfaceVariant} style={{ marginTop: 2 }}>{l.desc}</T>
                  </View>
                  <Icon n={l.icon} s={18} c={on ? C.primary : C.outline} />
                </Choice>
              );
            })}

            <View style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: border, backgroundColor: C.surface, marginTop: 2, marginBottom: 20 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Row><Icon n="pie_chart" s={16} c={C.primary} /><T w="semibold" s={12} style={{ marginLeft: 6 }}>Macro Split Target</T></Row>
                <Row><T w="bold" s={10} c={C.primary}>Balanced (40/30/30) </T><Icon n="autorenew" s={13} c={C.primary} /></Row>
              </Row>
              <Row style={{ height: 6, borderRadius: 3, overflow: 'hidden', marginVertical: 12 }}>
                <View style={{ flex: 40, height: 6, backgroundColor: C.primary }} /><View style={{ flex: 30, height: 6, backgroundColor: '#8ccff2', opacity: 0.65 }} /><View style={{ flex: 30, height: 6, backgroundColor: '#b6c4fd' }} />
              </Row>
              <Row style={{ gap: 8 }}>
                {[['Carbs', '40%'], ['Protein', '30%'], ['Fats', '30%']].map(([k, v]) => (
                  <View key={k} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: C.bg, borderWidth: 1, borderColor: 'rgba(62,72,79,0.4)' }}>
                    <T s={10} c={C.outline}>{k}</T><T w="bold" s={16} style={{ marginTop: 2 }}>{v}</T>
                  </View>
                ))}
              </Row>
            </View>

            <CTA title="Complete Registration" onPress={done} />
            <Missing items={miss} onClose={() => setMiss([])} />
            <Row style={{ justifyContent: 'center', marginTop: 18 }}>
              <T s={12} c={C.onSurfaceVariant}>Prefer to fill this in later? </T>
              <Pressable onPress={onSkip} hitSlop={8}><T w="bold" s={12} c={C.primary}>Skip to Dashboard</T></Pressable>
            </Row>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Backdrop>
  );
}
