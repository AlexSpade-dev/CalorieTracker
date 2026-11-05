import React, { useState } from 'react';
import { View, Pressable, Modal, Image, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glow, T, Row, Icon, Pill, Bar, Ring, IconBox, CTA, C } from '../components/kit';
import { Field } from '../components/Field';
import { IMG } from '../data/images';

const border = 'rgba(62,72,79,0.5)';
const fmt = (n) => Math.round(n).toLocaleString('en-US');

// full-screen frame with the "Modal title" header used by the three dialog designs
function Frame({ visible, title, onBack, children }) {
  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent navigationBarTranslucent onRequestClose={onBack}>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <Glow size={380} color={C.secondaryContainer} opacity={0.3} style={{ top: -120, alignSelf: 'center' }} />
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'rgba(13,15,50,0.9)' }}>
          <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 }}>
            <Row>
              <Pressable onPress={onBack} hitSlop={10}><Icon n="arrow_back" s={22} c={C.text} /></Pressable>
              <T w="bold" s={17} style={{ marginLeft: 14 }}>{title}</T>
            </Row>
            <Row>
              <Icon n="more_vert" s={22} c={C.onSurfaceVariant} style={{ marginRight: 12 }} />
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.primaryContainer, alignItems: 'center', justifyContent: 'center' }}><Icon n="person" s={18} c={C.onPrimaryContainer} /></View>
            </Row>
          </Row>
        </SafeAreaView>
        {children}
      </View>
    </Modal>
  );
}

/* ===================== Quick Add ===================== */
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const QUICK = ['Grilled Chicken', 'Protein Shake', 'Avocado Toast', 'Oatmeal'];
const QUICK_KCAL = { 'Grilled Chicken': 420, 'Protein Shake': 190, 'Avocado Toast': 340, Oatmeal: 310 };

export function QuickAdd({ visible, onClose, onAdd, consumed, goal }) {
  const insets = useSafeAreaInsets();
  const [meal, setMeal] = useState('Lunch');
  const [name, setName] = useState('Grilled Chicken Salad');
  const [kcal, setKcal] = useState('420');
  const k = Math.max(0, +kcal || 0);
  const protein = Math.round((k * 0.3) / 4), carbs = Math.round((k * 0.4) / 4), fat = Math.round((k * 0.3) / 9);
  const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const set = (n) => { setName(n); setKcal(String(QUICK_KCAL[n])); };

  return (
    <Frame visible={visible} title="Quick Add Modal" onBack={onClose}>
      {/* dimmed dashboard peek behind the sheet */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14, opacity: 0.55 }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}><T w="semibold" s={12} c={C.onSurfaceVariant}>Today's Target</T><T w="bold" s={12} c={C.primary}>{fmt(consumed)} / {fmt(goal)} kcal</T></Row>
        <Row style={{ gap: 10 }}>
          {[[IMG.qaToast, 'Avocado Toast', 340], [IMG.qaShake, 'Whey Isolate', 190]].map(([u, n, kc]) => (
            <View key={n} style={{ flex: 1, height: 74, borderRadius: 14, overflow: 'hidden', backgroundColor: C.surfaceHigh }}>
              <Image source={{ uri: u }} style={{ width: '100%', height: 74 }} />
              <View style={{ position: 'absolute', left: 8, bottom: 6 }}><T w="bold" s={11}>{n}</T><T s={9} c={C.primary}>{kc} kcal</T></View>
            </View>
          ))}
        </Row>
      </View>

      <View style={{ flex: 1, marginTop: 14, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: C.surface, borderTopWidth: 1, borderColor: border }}>
        <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(136,146,154,0.45)', marginTop: 10 }} />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 + insets.bottom }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View><T w="bold" s={21} style={{ letterSpacing: -0.4 }}>Quick Log Entry</T><T s={12} c={C.onSurfaceVariant} style={{ marginTop: 2 }}>Add calories manually, tap a favourite, or scan</T></View>
            <Pressable onPress={onClose} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.surfaceHigh, alignItems: 'center', justifyContent: 'center' }}><Icon n="close" s={17} c={C.onSurfaceVariant} /></Pressable>
          </Row>

          <Row style={{ gap: 10, marginTop: 16 }}>
            {[['barcode_scanner', 'Scan Barcode', 'Instant look-up'], ['mic', 'AI Voice Log', '"2 eggs & toast"']].map(([ic, t, s]) => (
              <Pressable key={t} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, backgroundColor: C.bg, borderWidth: 1, borderColor: border }}>
                <IconBox n={ic} size={36} s={19} r={18} /><View style={{ marginLeft: 10, flex: 1 }}><T w="bold" s={12}>{t}</T><T s={10} c={C.outline}>{s}</T></View>
              </Pressable>
            ))}
          </Row>

          <Row style={{ justifyContent: 'space-between', marginTop: 20, marginBottom: 8 }}><T w="bold" s={10} c={C.outline} style={{ letterSpacing: 1 }}>MEAL CATEGORY</T><T w="semibold" s={10} c={C.primary}>Logged as {now}</T></Row>
          <Row style={{ gap: 8 }}>
            {MEALS.map((m) => { const on = meal === m; return (
              <Pressable key={m} onPress={() => setMeal(m)} style={{ paddingHorizontal: 13, height: 34, borderRadius: 999, backgroundColor: on ? C.primary : C.bg, borderWidth: 1, borderColor: on ? C.primary : border, alignItems: 'center', justifyContent: 'center' }}>
                <T w="bold" s={12} c={on ? C.onPrimaryContainer : C.onSurfaceVariant}>{m}</T></Pressable>); })}
          </Row>

          <T w="bold" s={10} c={C.outline} style={{ letterSpacing: 1, marginTop: 18, marginBottom: 8 }}>FOOD / DISH NAME</T>
          <Field icon="restaurant" value={name} onChangeText={setName} placeholder="e.g. Greek Yogurt with Walnuts" style={{ marginBottom: 8 }}
            right={name ? <Pressable onPress={() => setName('')} hitSlop={8}><Icon n="cancel" s={18} c={C.outline} /></Pressable> : null} />
          <Row style={{ flexWrap: 'wrap' }}>
            {QUICK.map((q) => (
              <Pressable key={q} onPress={() => set(q)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(121,209,255,0.08)', borderWidth: 1, borderColor: 'rgba(121,209,255,0.25)', marginRight: 8, marginBottom: 8 }}>
                <Icon n="history" s={12} c={C.primary} /><T w="semibold" s={11} c={C.primary} style={{ marginLeft: 4 }}>{q}</T>
              </Pressable>
            ))}
          </Row>

          <View style={{ marginTop: 10, padding: 14, borderRadius: 18, backgroundColor: C.bg, borderWidth: 1, borderColor: border, alignItems: 'center' }}>
            <Row style={{ justifyContent: 'space-between', alignSelf: 'stretch' }}>
              <T w="bold" s={10} c={C.outline} style={{ letterSpacing: 1 }}>ENERGY MEASURE</T>
              <Row><Icon n="bolt" s={13} c={C.primary} /><T w="bold" s={10} c={C.primary}> {goal ? Math.round((k / goal) * 100) : 0}% of Daily Budget</T></Row>
            </Row>
            <Row style={{ marginTop: 12, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 16, backgroundColor: '#0b0d2b', borderWidth: 1, borderColor: 'rgba(121,209,255,0.25)' }}>
              <Icon n="edit" s={16} c={C.primary} />
              <Field value={kcal} onChangeText={(v) => setKcal(v.replace(/[^0-9]/g, ''))} keyboardType="numeric" style={{ marginBottom: 0, marginHorizontal: 6, minWidth: 90 }} inputStyle={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 34, textAlign: 'center' }} />
              <T w="bold" s={16} c={C.primary}>kcal</T>
            </Row>
            <Row style={{ marginTop: 8 }}><Icon n="touch_app" s={13} c={C.outline} /><T s={11} c={C.outline}> Tap to type exact kcal</T></Row>
          </View>

          <Row style={{ justifyContent: 'space-between', marginTop: 18, marginBottom: 8 }}><T w="bold" s={10} c={C.outline} style={{ letterSpacing: 1 }}>MACRONUTRIENT SPLIT</T><T s={10} c={C.outline}>Auto-balanced</T></Row>
          <Row style={{ gap: 8 }}>
            {[['Protein', protein, C.primary, 70], ['Carbs', carbs, '#8ccff2', 45], ['Fat', fat, '#b6c4fd', 35]].map(([l, v, col, p]) => (
              <View key={l} style={{ flex: 1, padding: 10, borderRadius: 14, backgroundColor: C.bg, borderWidth: 1, borderColor: border }}>
                <Row style={{ justifyContent: 'space-between' }}><T w="bold" s={10} c={col}>{l}</T><View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: col }} /></Row>
                <Row style={{ alignItems: 'baseline', marginTop: 4 }}><T w="extrabold" s={22}>{v}</T><T s={10} c={C.outline}> g</T></Row>
                <Bar pct={p} h={3} color={col} style={{ marginTop: 6 }} />
              </View>
            ))}
          </Row>
          <Row style={{ marginTop: 12, padding: 10, borderRadius: 12, backgroundColor: 'rgba(121,209,255,0.07)' }}><Icon n="verified" s={15} c={C.primary} /><T s={11} c={C.onSurfaceVariant} style={{ marginLeft: 8, flex: 1 }}>Optimal macro density: High satiety index rating.</T></Row>

          <CTA title={`Add to Daily Log (${k} kcal)`} icon="add_task" disabled={!k || !name.trim()} style={{ marginTop: 18 }}
            onPress={() => onAdd({ meal, name: name.trim(), kcal: k, protein, carbs, fats: fat })} />
          <Pressable onPress={onClose} style={{ alignItems: 'center', paddingTop: 14 }}><T w="semibold" s={13} c={C.onSurfaceVariant}>Cancel</T></Pressable>
        </ScrollView>
      </View>
    </Frame>
  );
}

/* ===================== Calorie Overdraft ===================== */
export function Overdraft({ visible, pending, consumed, goal, onConfirm, onAdjust, onCancel }) {
  const [pick, setPick] = useState('borrow');
  if (!pending) return null;
  const total = consumed + pending.kcal;
  const over = Math.max(0, total - goal);
  const pct = Math.round((over / goal) * 100);
  const opts = [
    ['borrow', 'event', 'Borrow from Tomorrow', `Next day target automatically: ${fmt(goal - over)} kcal`],
    ['burn', 'directions_walk', 'Log Rest Day Burn', 'Offset via 45m walk (+250 kcal credit)'],
    ['accept', 'check_circle_outline', 'Accept & Keep Baseline', `Log pure surplus, reset to ${fmt(goal)} kcal tomorrow`],
  ];
  const totalBar = Math.max(total, goal);
  return (
    <Frame visible={visible} title="Calorie Overdraft Confirmation" onBack={onCancel}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ borderRadius: 28, borderWidth: 1, borderColor: border, backgroundColor: C.surface, padding: 20 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: C.bg, borderWidth: 1, borderColor: 'rgba(121,209,255,0.3)', alignItems: 'center', justifyContent: 'center' }}><Icon n="shield_with_heart" s={28} c={C.primary} /></View>
            <Row style={{ marginTop: -10, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: '#93000a' }}><Icon n="trending_up" s={12} c="#ffdad6" /><T w="bold" s={10} c="#ffdad6" style={{ marginLeft: 3 }}>+{fmt(over)} kcal</T></Row>
            <T w="extrabold" s={24} style={{ marginTop: 12, letterSpacing: -0.4 }}>Exceed Daily Target?</T>
            <T s={13} c={C.onSurfaceVariant} style={{ textAlign: 'center', marginTop: 6, lineHeight: 20 }}>Adding “{pending.name}” (+{fmt(pending.kcal)} kcal) will place you <T w="bold" s={13} c={C.primary}>{fmt(over)} kcal</T> over your {fmt(goal)} kcal target.</T>
          </View>

          <View style={{ marginTop: 18 }}>
            <Row style={{ justifyContent: 'space-between' }}><T w="semibold" s={11} c={C.onSurfaceVariant}>Daily Progress</T><T w="bold" s={11} c={C.primary}>{fmt(total)} / {fmt(goal)} kcal</T></Row>
            <Row style={{ height: 8, borderRadius: 4, overflow: 'hidden', marginVertical: 8, backgroundColor: C.surfaceLowest }}>
              <View style={{ flex: goal, backgroundColor: C.primaryContainer }} /><View style={{ flex: totalBar - goal || 0.0001, backgroundColor: '#b6e3ff' }} />
            </Row>
            <Row style={{ justifyContent: 'space-between' }}><T s={10} c={C.outline}>Target: {fmt(goal)} kcal</T><T w="bold" s={10} c={C.error}>Overdraft: {pct}%</T></Row>
          </View>

          <Row style={{ justifyContent: 'space-between', marginTop: 20, marginBottom: 8 }}>
            <T w="bold" s={10} c={C.outline} style={{ letterSpacing: 1 }}>CHOOSE SOLUTION</T>
            <Row><Icon n="auto_awesome" s={12} c={C.primary} /><T w="bold" s={10} c={C.primary}> Smart AI</T></Row>
          </Row>
          {opts.map(([id, ic, t, s]) => { const on = pick === id; return (
            <Pressable key={id} onPress={() => setPick(id)} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: on ? 1.5 : 1, borderColor: on ? C.primary : border, backgroundColor: on ? 'rgba(121,209,255,0.1)' : C.bg, marginBottom: 8 }}>
              <IconBox n={ic} size={34} s={18} r={17} bg="rgba(121,209,255,0.12)" />
              <View style={{ flex: 1, marginHorizontal: 12 }}><T w="bold" s={13}>{t}</T><T s={10} c={C.onSurfaceVariant} style={{ marginTop: 2 }}>{s}</T></View>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: on ? C.primary : 'transparent', borderWidth: on ? 0 : 1, borderColor: border, alignItems: 'center', justifyContent: 'center' }}>{on && <Icon n="check" s={14} c={C.onPrimaryContainer} />}</View>
            </Pressable>); })}

          <CTA title="Confirm & Log Meal" icon="verified" onPress={() => onConfirm(pick)} style={{ marginTop: 10 }} />
          <CTA tone="ghost" title="Adjust Portion Size (75%)" icon="tune" onPress={onAdjust} style={{ marginTop: 10, height: 44 }} />
          <Pressable onPress={onCancel} style={{ alignItems: 'center', paddingTop: 14 }}><T w="semibold" s={13} c={C.onSurfaceVariant}>Cancel</T></Pressable>
        </View>

        <Row style={{ marginTop: 16, padding: 14, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: border, justifyContent: 'space-between' }}>
          <Row style={{ flex: 1 }}>
            <IconBox n="ramen_dining" size={38} s={20} r={12} />
            <View style={{ marginLeft: 12, flex: 1 }}><T w="bold" s={13} numberOfLines={1}>{pending.name}</T><T s={10} c={C.onSurfaceVariant}>{pending.sub || '1 serving'}</T></View>
          </Row>
          <View style={{ alignItems: 'flex-end' }}><T w="bold" s={14} c={C.primary}>{fmt(pending.kcal)} kcal</T><T s={10} c={C.outline}>Carbs: {Math.round(pending.carbs || 0)}g</T></View>
        </Row>
      </ScrollView>
    </Frame>
  );
}

/* ===================== Goal hit ===================== */
const FEEL = [['Energized', '⚡'], ['Balanced', '🥑'], ['Hungry', '💧'], ['Heavy', '🛋️']];
export function GoalHit({ visible, consumed, goal, onDone, onReview }) {
  const [feel, setFeel] = useState('Energized');
  const [note, setNote] = useState('');
  const acc = Math.max(0, Math.round(100 - (Math.abs(consumed - goal) / goal) * 100));
  const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <Frame visible={visible} title="Goal Feedback Modal" onBack={() => onDone(feel, note)}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ borderRadius: 28, borderWidth: 1, borderColor: border, backgroundColor: C.surface, padding: 20 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: C.bg, borderWidth: 1, borderColor: 'rgba(121,209,255,0.35)', alignItems: 'center', justifyContent: 'center', shadowColor: C.primary, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8 }}><Icon n="military_tech" s={34} c={C.primary} /></View>
            <View style={{ width: 24, height: 3, borderRadius: 2, backgroundColor: C.primary, marginTop: 8 }} />
            <T w="extrabold" s={24} style={{ marginTop: 12, letterSpacing: -0.4 }}>Daily Calorie Goal Hit</T>
            <T s={12} c={C.onSurfaceVariant} style={{ marginTop: 4 }}>Precision tracking within target threshold</T>
          </View>
          <View style={{ alignItems: 'center', marginVertical: 18 }}>
            <Ring size={168} stroke={12} pct={Math.min(100, (consumed / goal) * 100)}>
              <T w="extrabold" s={36} style={{ letterSpacing: -1 }}>{fmt(consumed)}</T>
              <T s={11} c={C.onSurfaceVariant}>/ {fmt(goal)} kcal</T>
              <Pill style={{ marginTop: 6 }}><T w="bold" s={9} c={C.primary}>{acc}% Accuracy</T></Pill>
            </Ring>
          </View>

          <View style={{ padding: 14, borderRadius: 18, backgroundColor: C.bg, borderWidth: 1, borderColor: border }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row><Icon n="local_fire_department" s={17} c={C.primary} /><T w="bold" s={14} style={{ marginLeft: 6 }}>5-Day Perfect Streak</T></Row>
              <Pill><T w="bold" s={10} c={C.primary}>Week 42</T></Pill>
            </Row>
            <Row style={{ justifyContent: 'space-between', marginTop: 12 }}>
              {week.map((d, i) => (
                <View key={i} style={{ alignItems: 'center' }}>
                  <T w="bold" s={10} c={i < 5 ? C.primary : C.outline}>{d}</T>
                  <View style={{ width: 30, height: 30, borderRadius: 15, marginTop: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: i < 5 ? C.primary : 'rgba(62,72,79,0.35)' }}>
                    <Icon n={i < 5 ? 'check' : 'remove'} s={16} c={i < 5 ? C.onPrimaryContainer : C.outline} />
                  </View>
                </View>
              ))}
            </Row>
          </View>

          <T w="bold" s={15} style={{ marginTop: 20, marginBottom: 10 }}>How did today's nutrition feel?</T>
          <Row style={{ flexWrap: 'wrap', gap: 8 }}>
            {FEEL.map(([f, e]) => { const on = feel === f; return (
              <Pressable key={f} onPress={() => setFeel(f)} style={{ width: '48.5%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, height: 44, borderRadius: 12, borderWidth: on ? 1.5 : 1, borderColor: on ? C.primary : border, backgroundColor: on ? 'rgba(121,209,255,0.14)' : C.bg }}>
                <T w="bold" s={13} c={on ? C.primary : C.onSurfaceVariant}>{f} {e}</T>
                <Icon n={on ? 'radio_button_checked' : 'radio_button_unchecked'} s={18} c={on ? C.primary : C.outline} />
              </Pressable>); })}
          </Row>
          <Field icon="edit_note" value={note} onChangeText={setNote} placeholder="e.g. Felt great during afternoon workout" style={{ marginTop: 12, marginBottom: 14 }} />
          <CTA title="Save & View Summary" onPress={() => onDone(feel, note)} />
          <Pressable onPress={onReview} style={{ alignItems: 'center', paddingTop: 14 }}><T w="semibold" s={13} c={C.onSurfaceVariant}>Review Log Breakdown</T></Pressable>
        </View>
      </ScrollView>
    </Frame>
  );
}
