import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field } from '../components/Field';
import { AppHeader, Bar, BottomNav, C, CTA, Icon, IconBox, Pill, Ring, Row, Scroll, Sheet, T } from '../components/kit';

const border = 'rgba(62,72,79,0.45)';
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const SLOT = { Breakfast: 'wb_twilight', Lunch: 'wb_sunny', Snack: 'cookie', Dinner: 'nights_stay' };

const Panel = ({ children, style }) => (
  <View style={[{ borderRadius: 24, borderWidth: 1, borderColor: border, overflow: 'hidden', marginBottom: 14 }, style]}>
    <LinearGradient colors={['#1d2046', '#16183a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18 }}>{children}</LinearGradient>
  </View>
);

export default function Dashboard({ name, goal, meals, water, waterGoal = 2500, tab, onTab, onAddWater, onLogMeal, onQuickAdd, toast }) {
  const [dlg, setDlg] = useState(null);
  const consumed = meals.reduce((n, m) => n + m.kcal, 0);
  const left = Math.max(0, goal - consumed);
  const sum = (k) => meals.reduce((n, m) => n + (m[k] || 0), 0);
  const macros = [['Carbs', sum('carbs'), Math.round((goal * 0.4) / 4)], ['Protein', sum('protein'), Math.round((goal * 0.3) / 4)], ['Fats', sum('fats'), Math.round((goal * 0.3) / 9)]];
  const slots = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
  const logged = slots.filter((s) => meals.some((m) => m.meal === s));
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const deficit = consumed <= goal;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: C.bg }}><AppHeader /></SafeAreaView>
      <Scroll>
        <Row style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <T w="bold" s={24} style={{ letterSpacing: -0.5 }}>{hello}, {name} 👋</T>
            <T s={12} c={C.onSurfaceVariant} style={{ marginTop: 3 }}>{today} • Caloric Deficit Target</T>
          </View>
          <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: border, alignItems: 'center', justifyContent: 'center' }}><Icon n="calendar_today" s={17} c={C.primary} /></View>
        </Row>

        {/* energy intake */}
        <Panel>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row><Icon n="local_fire_department" s={15} c={C.secondary} /><T w="bold" s={11} c={C.secondary} style={{ marginLeft: 6, letterSpacing: 1 }}>ENERGY INTAKE</T></Row>
            <Pill><T w="bold" s={10} c={C.primary}>{deficit ? 'Active Deficit' : 'Over Target'}</T></Pill>
          </Row>
          <View style={{ alignItems: 'center', marginVertical: 18 }}>
            <Ring size={170} stroke={13} pct={(consumed / goal) * 100}>
              <T w="extrabold" s={40} style={{ letterSpacing: -1 }}>{fmt(left)}</T>
              <T w="bold" s={10} c={C.secondary} style={{ letterSpacing: 1.2 }}>KCAL LEFT</T>
              <T s={11} c={C.onSurfaceVariant}>of {fmt(goal)}</T>
            </Ring>
          </View>
          {[['local_fire_department', 'Consumed', consumed], ['bolt', 'Base Burn', 1820]].map(([ic, l, v]) => (
            <Row key={l} style={{ justifyContent: 'space-between', padding: 12, borderRadius: 14, backgroundColor: 'rgba(8,10,44,0.45)', borderWidth: 1, borderColor: border, marginBottom: 8 }}>
              <Row><IconBox n={ic} size={32} s={17} r={16} /><T s={14} c={C.onSurfaceVariant} style={{ marginLeft: 10 }}>{l}</T></Row>
              <Row style={{ alignItems: 'baseline' }}><T w="bold" s={18}>{fmt(v)}</T><T s={11} c={C.outline}> kcal</T></Row>
            </Row>
          ))}
          <Row style={{ gap: 8, marginTop: 6 }}>
            {macros.map(([l, v, t], i) => (
              <View key={l} style={{ flex: 1 }}>
                <Row style={{ justifyContent: 'space-between' }}><T w="semibold" s={10} c={C.onSurfaceVariant}>{l}</T><T w="bold" s={10} c={C.primary}>{Math.round(v)}g</T></Row>
                <Bar pct={(v / t) * 100} h={4} color={i === 0 ? C.primary : i === 1 ? '#8ccff2' : '#b6c4fd'} style={{ marginVertical: 5 }} />
                <T s={9} c={C.outline}>Target: {t}g</T>
              </View>
            ))}
          </Row>
        </Panel>

        {/* hydration */}
        <Panel style={{ marginBottom: 18 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row style={{ flex: 1 }}>
              <IconBox n="water_drop" size={36} s={19} r={18} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Row style={{ justifyContent: 'space-between' }}><T w="bold" s={14}>Hydration</T><T w="bold" s={12} c={C.primary}>{(water / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L</T></Row>
                <Bar pct={(water / waterGoal) * 100} h={5} color={C.primary} style={{ marginTop: 6 }} />
              </View>
            </Row>
          </Row>
          <Pressable onPress={() => setDlg('water')} style={{ alignSelf: 'flex-end', marginTop: 12, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(121,209,255,0.4)', backgroundColor: 'rgba(121,209,255,0.1)', flexDirection: 'row', alignItems: 'center' }}>
            <Icon n="add" s={14} c={C.primary} /><T w="bold" s={12} c={C.primary} style={{ marginLeft: 4 }}>250ml</T>
          </Pressable>
        </Panel>

        {/* meals */}
        <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <T w="bold" s={19}>Today's Meals</T>
          <Pill tone="neutral"><T w="semibold" s={10} c={C.onSurfaceVariant}>{logged.length} of 4 logged</T></Pill>
        </Row>
        {slots.map((slot) => {
          const entries = meals.filter((m) => m.meal === slot);
          if (entries.length) {
            return entries.map((m) => (
              <Row key={m.id} style={{ padding: 14, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: border, marginBottom: 10 }}>
                <IconBox n={SLOT[slot]} size={40} s={20} r={20} bg="rgba(121,209,255,0.08)" />
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <Row><T w="bold" s={14}>{slot}</T><Icon n="check_circle" s={14} c={C.primary} style={{ marginLeft: 5 }} /></Row>
                  <T s={11} c={C.onSurfaceVariant} numberOfLines={1} style={{ marginTop: 2 }}>{m.name}</T>
                </View>
                <View style={{ alignItems: 'flex-end' }}><T w="bold" s={19}>{fmt(m.kcal)}</T><T s={10} c={C.outline}>kcal</T></View>
              </Row>
            ));
          }
          return (
            <Row key={slot} style={{ padding: 14, borderRadius: 18, backgroundColor: 'rgba(22,24,58,0.6)', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(121,209,255,0.35)', marginBottom: 10 }}>
              <IconBox n={SLOT[slot]} size={40} s={20} r={20} bg="rgba(121,209,255,0.08)" />
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <T w="bold" s={14}>{slot}</T>
                <T s={11} c={C.onSurfaceVariant} style={{ marginTop: 2 }}>Remaining budget: {fmt(left)} kcal</T>
              </View>
              <Pressable onPress={() => setDlg(slot)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: C.primary }}>
                <Icon n="add" s={15} c={C.onPrimaryContainer} /><T w="bold" s={12} c={C.onPrimaryContainer} style={{ marginLeft: 2 }}>Add</T>
              </Pressable>
            </Row>
          );
        })}

        <Pressable onPress={onQuickAdd} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: border, marginTop: 4, opacity: pressed ? 0.85 : 1 })}>
          <IconBox n="barcode_scanner" size={40} s={21} r={12} />
          <View style={{ flex: 1, marginHorizontal: 12 }}><T w="bold" s={14}>Fast Barcode Scan</T><T s={11} c={C.onSurfaceVariant} style={{ marginTop: 2 }}>Identify branded food items instantly</T></View>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(121,209,255,0.1)', alignItems: 'center', justifyContent: 'center' }}><Icon n="arrow_forward" s={17} c={C.primary} /></View>
        </Pressable>
      </Scroll>
      <BottomNav active={tab} onChange={onTab} />

      <HydrationDialog visible={dlg === 'water'} onClose={() => setDlg(null)} water={water} goal={waterGoal} onConfirm={(ml) => { onAddWater(ml); setDlg(null); }} />
      <MealDialog visible={!!dlg && dlg !== 'water'} slot={dlg} left={left} onClose={() => setDlg(null)} onConfirm={(m) => { setDlg(null); onLogMeal(m); }} />
    </View>
  );
}

/* ---------- Confirm Hydration ---------- */
function HydrationDialog({ visible, onClose, water, goal, onConfirm }) {
  const [vol, setVol] = useState(250);
  const after = water + vol;
  const pct = Math.min(100, (after / goal) * 100);
  const leftMl = Math.max(0, goal - after);
  const opts = [[250, '+250ml'], [500, '+500ml'], [750, '+750ml'], [1000, '+1.0L']];
  return (
    <Sheet visible={visible} onClose={onClose} mode="center">
      <Row style={{ justifyContent: 'space-between' }}>
        <Row><IconBox n="water_drop" size={38} s={20} r={19} /><View style={{ marginLeft: 10 }}><T w="bold" s={17}>Confirm Hydration</T><T s={11} c={C.onSurfaceVariant}>Daily Water Logging</T></View></Row>
        <Pressable onPress={onClose} hitSlop={10}><Icon n="close" s={20} c={C.outline} /></Pressable>
      </Row>
      <T w="bold" s={10} c={C.outline} style={{ marginTop: 18, marginBottom: 8, letterSpacing: 1 }}>INTAKE VOLUME</T>
      <Row style={{ gap: 8 }}>
        {opts.map(([v, l]) => { const on = vol === v; return (
          <Pressable key={v} onPress={() => setVol(v)} style={{ flex: 1, height: 38, borderRadius: 10, borderWidth: on ? 1.5 : 1, borderColor: on ? C.primary : 'rgba(62,72,79,0.6)', backgroundColor: on ? 'rgba(121,209,255,0.14)' : C.bg, alignItems: 'center', justifyContent: 'center' }}>
            <T w="bold" s={12} c={on ? C.primary : C.onSurfaceVariant}>{l}</T></Pressable>); })}
      </Row>
      <View style={{ marginTop: 16, padding: 12, borderRadius: 14, backgroundColor: C.bg, borderWidth: 1, borderColor: border }}>
        <Row style={{ justifyContent: 'space-between' }}><T s={11} c={C.onSurfaceVariant}>Target Preview</T><T w="bold" s={11} c={C.primary}>{(water / 1000).toFixed(1)}L → {(after / 1000).toFixed(2)}L / {(goal / 1000).toFixed(1)}L ({Math.round(pct)}%)</T></Row>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: C.surfaceLowest, overflow: 'hidden', marginVertical: 10, flexDirection: 'row' }}>
          <View style={{ width: `${Math.min(100, (water / goal) * 100)}%`, backgroundColor: C.primaryContainer }} />
          <View style={{ width: `${Math.max(0, pct - Math.min(100, (water / goal) * 100))}%`, backgroundColor: C.primary }} />
        </View>
        <Row><Icon n="info" s={14} c={C.primary} /><T s={11} c={C.onSurfaceVariant} style={{ flex: 1, marginLeft: 6, lineHeight: 16 }}>{leftMl > 0 ? `Almost there! ${leftMl}ml left to reach your daily hydration benchmark.` : 'Daily hydration benchmark reached. Great work!'}</T></Row>
      </View>
      <Row style={{ gap: 10, marginTop: 18 }}>
        <CTA tone="ghost" title="Cancel" icon={null} onPress={onClose} style={{ flex: 1 }} />
        <CTA title={`Confirm +${vol >= 1000 ? '1.0L' : vol + 'ml'}`} icon="check" onPress={() => onConfirm(vol)} style={{ flex: 1.6 }} />
      </Row>
    </Sheet>
  );
}

/* ---------- Log Dinner Meal ---------- */
function MealDialog({ visible, slot = 'Dinner', left, onClose, onConfirm }) {
  const [n, setN] = useState('Herb Roast Salmon with Quinoa & Asparagus');
  const [k, setK] = useState('580');
  const [c, setC] = useState('45'); const [p, setP] = useState('42'); const [f, setF] = useState('18');
  const sugg = [['star', 'Salmon & Quinoa (580 kcal)', 'Herb Roast Salmon with Quinoa & Asparagus', 580, 45, 42, 18], ['history', 'Chicken Bowl (520 kcal)', 'Grilled Chicken Power Bowl', 520, 48, 46, 14]];
  const pick = (s) => { setN(s[2]); setK(String(s[3])); setC(String(s[4])); setP(String(s[5])); setF(String(s[6])); };
  const num = (set) => (v) => set(v.replace(/[^0-9.]/g, ''));
  const ok = n.trim() && +k > 0;
  return (
    <Sheet visible={visible} onClose={onClose} mode="center">
      <Row style={{ justifyContent: 'space-between' }}>
        <Row><IconBox n={SLOT[slot] || 'restaurant'} size={38} s={20} r={19} /><View style={{ marginLeft: 10 }}><T w="bold" s={17}>Log {slot} Meal</T><Row><T s={11} c={C.onSurfaceVariant}>Remaining budget: </T><T w="bold" s={11} c={C.primary}>{fmt(left)} kcal</T></Row></View></Row>
        <Pressable onPress={onClose} hitSlop={10}><Icon n="close" s={20} c={C.outline} /></Pressable>
      </Row>
      <T w="bold" s={10} c={C.outline} style={{ marginTop: 16, marginBottom: 8, letterSpacing: 1 }}>SMART SUGGESTIONS</T>
      <Row style={{ flexWrap: 'wrap' }}>
        {sugg.map((s) => (
          <Pressable key={s[1]} onPress={() => pick(s)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(121,209,255,0.35)', backgroundColor: 'rgba(121,209,255,0.08)', marginRight: 8, marginBottom: 8 }}>
            <Icon n={s[0]} s={13} c={C.primary} /><T w="semibold" s={11} c={C.primary} style={{ marginLeft: 5 }}>{s[1]}</T>
          </Pressable>
        ))}
      </Row>
      <Field label="Meal Name" value={n} onChangeText={setN} style={{ marginBottom: 10, marginTop: 4 }} />
      <Field label="Total Calories" value={k} onChangeText={num(setK)} keyboardType="numeric" right={<T s={12} c={C.outline}>kcal</T>} style={{ marginBottom: 10 }} />
      <T w="semibold" s={12} style={{ marginBottom: 6 }}>Estimated Macro Breakdown</T>
      <Row style={{ gap: 8 }}>
        {[['Carbs', c, setC], ['Protein', p, setP], ['Fats', f, setF]].map(([l, v, s]) => (
          <View key={l} style={{ flex: 1 }}>
            <T w="bold" s={9} c={C.outline} style={{ letterSpacing: 0.8, marginBottom: 4 }}>{l.toUpperCase()}</T>
            <Field value={v} onChangeText={num(s)} keyboardType="numeric" right={<T s={11} c={C.outline}>g</T>} style={{ marginBottom: 0 }} />
          </View>
        ))}
      </Row>
      <Row style={{ gap: 10, marginTop: 18 }}>
        <CTA tone="ghost" title="Cancel" icon={null} onPress={onClose} style={{ flex: 1 }} />
        <CTA title={`Confirm & Log ${slot}`} icon="check" disabled={!ok} onPress={() => onConfirm({ meal: slot, name: n.trim(), kcal: Math.round(+k), carbs: +c || 0, protein: +p || 0, fats: +f || 0 })} style={{ flex: 1.8 }} />
      </Row>
    </Sheet>
  );
}
