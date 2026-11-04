import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Line, Path, Rect, LinearGradient as SG, Text as SText, Stop } from 'react-native-svg';
import { AppHeader, Bar, BottomNav, C, Icon, Pill, Row, Scroll, T } from '../components/kit';

const border = 'rgba(62,72,79,0.45)';
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const todayIdx = (new Date().getDay() + 6) % 7; // Monday = 0
const weekDates = () => { const t = new Date(); return DAYS.map((_, i) => { const d = new Date(t); d.setDate(t.getDate() - todayIdx + i); return d; }); };
const fmtDate = (d, o) => d.toLocaleDateString('en-US', o);
const fmt = (n) => Math.round(n).toLocaleString('en-US');

const Panel = ({ children, style }) => (
  <View style={[{ borderRadius: 24, borderWidth: 1, borderColor: border, overflow: 'hidden', marginBottom: 16 }, style]}>
    <LinearGradient colors={['#1d2046', '#16183a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18 }}>{children}</LinearGradient>
  </View>
);
const Eyebrow = ({ children }) => <T w="bold" s={10} c={C.secondary} style={{ letterSpacing: 1.1 }}>{children}</T>;

function Chart({ width, sel, onSel, intake, burn, target }) {
  const H = 190, padL = 6, padR = 34, top = 14, base = 160;
  const max = Math.max(target * 1.15, ...intake, ...burn, 1);
  const bw = 26, gap = (width - padL - padR - bw * 7) / 6;
  const y = (v) => base - (v / max) * (base - top);
  const x = (i) => padL + i * (bw + gap);
  const burnPts = burn.map((v, i) => (v > 0 ? [x(i) + bw / 2, y(v)] : null)).filter(Boolean);
  const burnPath = burnPts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  return (
    <Svg width={width} height={H}>
      <Defs>
        <SG id="bar" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#79d1ff" stopOpacity="0.95" /><Stop offset="1" stopColor="#1a5f86" stopOpacity="0.85" /></SG>
        <SG id="barSel" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#c3e8ff" /><Stop offset="1" stopColor="#5fb9e8" /></SG>
      </Defs>
      {intake.map((v, i) => (
        v > 0
          ? <Rect key={i} x={x(i)} y={y(v)} width={bw} height={base - y(v)} rx={7} fill={i === sel ? 'url(#barSel)' : 'url(#bar)'} onPress={() => onSel(i)} />
          : <Rect key={i} x={x(i)} y={base - 4} width={bw} height={4} rx={2} fill="rgba(62,72,79,0.55)" onPress={() => onSel(i)} />
      ))}
      {burnPts.length > 1 && <Path d={burnPath} stroke="#8ccff2" strokeWidth={1.5} fill="none" opacity={0.75} />}
      {burnPts.map((p, i) => <Circle key={i} cx={p[0]} cy={p[1]} r={3} fill="#8ccff2" />)}
      <Line x1={0} x2={width - padR} y1={y(target)} y2={y(target)} stroke="#b6c4fd" strokeWidth={1} strokeDasharray="4 4" opacity={0.7} />
      <SText x={width - padR + 3} y={y(target) + 3} fontSize={8} fill="#b6c4fd">TARGET</SText>
      {DAYS.map((d, i) => <SText key={i} x={x(i) + bw / 2} y={base + 22} fontSize={11} fill={i === sel ? '#79d1ff' : '#bec8d0'} fontWeight="600" textAnchor="middle">{d}</SText>)}
    </Svg>
  );
}

function Donut({ size = 128, segs, label, sub }) {
  const stroke = 16, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  let off = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(62,72,79,0.4)" strokeWidth={stroke} fill="none" />
        {segs.map(([p, col], i) => {
          if (p <= 0) return null;
          const len = (circ * p) / 100;
          const el = <Circle key={i} cx={size / 2} cy={size / 2} r={r} stroke={col} strokeWidth={stroke} fill="none" strokeDasharray={`${Math.max(0, len - 2)} ${circ}`} strokeDashoffset={-off} />;
          off += len; return el;
        })}
      </Svg>
      <T w="extrabold" s={24}>{label}</T><T s={11} c={C.onSurfaceVariant}>{sub}</T>
    </View>
  );
}

export default function Analytics({ tab, onTab, meals = [], goal = 2200, water = 0, weight = null, targetWeight = null, baseBurn = 1820 }) {
  const [range, setRange] = useState('Week');
  const [sel, setSel] = useState(todayIdx);
  const [w, setW] = useState(300);

  const dates = weekDates();
  const RANGES = { Day: fmtDate(dates[todayIdx], { month: 'short', day: 'numeric' }), Week: `${fmtDate(dates[0], { month: 'short', day: 'numeric' })} - ${fmtDate(dates[6], { day: 'numeric' })}`, Month: fmtDate(new Date(), { month: 'long' }), Year: String(new Date().getFullYear()) };
  const sum = (k) => meals.reduce((n, m) => n + (m[k] || 0), 0);
  const consumed = sum('kcal');
  const INTAKE = DAYS.map((_, i) => (i === todayIdx ? consumed : 0));
  const BURN = DAYS.map((_, i) => (i === todayIdx && consumed > 0 ? baseBurn : 0));
  const logged = INTAKE.filter((v) => v > 0).length;
  const avg = logged ? INTAKE.reduce((a, b) => a + b, 0) / logged : 0;
  const deficit = logged ? (BURN.reduce((a, b) => a + b, 0) - INTAKE.reduce((a, b) => a + b, 0)) / logged : 0;
  const net = INTAKE[sel] > 0 ? INTAKE[sel] - BURN[sel] : 0;
  const peak = INTAKE.indexOf(Math.max(...INTAKE));

  const carbs = sum('carbs'), protein = sum('protein'), fats = sum('fats');
  const macroKcal = carbs * 4 + protein * 4 + fats * 9;
  const share = (kcal) => (macroKcal ? Math.round((kcal / macroKcal) * 100) : 0);
  const mac = [
    ['Carbs', carbs, Math.round((goal * 0.4) / 4), share(carbs * 4), '#79d1ff'],
    ['Protein', protein, Math.round((goal * 0.3) / 4), share(protein * 4), '#b6c4fd'],
    ['Fats', fats, Math.round((goal * 0.3) / 9), share(fats * 9), '#8ccff2'],
  ];
  const goalPct = goal ? Math.round((consumed / goal) * 100) : 0;
  const left = weight && targetWeight ? Math.abs(weight - targetWeight) : null;
  const lw = 150, lh = 58;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: C.bg }}><AppHeader /></SafeAreaView>
      <Scroll>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Row><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary, marginRight: 6 }} /><Eyebrow>TELEMETRY ENGINE</Eyebrow></Row>
            <T w="extrabold" s={26} style={{ letterSpacing: -0.6, marginTop: 4 }}>Analytics & Trends</T>
          </View>
          <Row style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: border }}>
            <Icon n="calendar_today" s={13} c={C.primary} /><T w="semibold" s={11} style={{ marginLeft: 6 }}>{RANGES[range]}</T>
          </Row>
        </Row>

        <Row style={{ marginTop: 16, marginBottom: 16, padding: 4, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: border }}>
          {Object.keys(RANGES).map((k) => { const on = range === k; return (
            <Pressable key={k} onPress={() => setRange(k)} style={{ flex: 1, height: 36, borderRadius: 10, backgroundColor: on ? C.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              <T w="semibold" s={13} c={on ? C.onPrimaryContainer : C.onSurfaceVariant}>{k}</T></Pressable>); })}
        </Row>

        <Panel>
          <Eyebrow>CALORIE INTAKE VS BURN</Eyebrow>
          <Row style={{ justifyContent: 'space-between', marginTop: 6, alignItems: 'flex-start' }}>
            <Row style={{ alignItems: 'baseline' }}><T w="extrabold" s={38} style={{ letterSpacing: -1 }}>{fmt(avg)}</T><T s={11} c={C.onSurfaceVariant}> avg kcal/day</T></Row>
            <View style={{ alignItems: 'flex-end' }}>
              <Pill style={{ backgroundColor: 'rgba(1,94,124,0.5)' }}><Row><Icon n={deficit < 0 ? 'trending_up' : 'trending_down'} s={12} c={C.primary} /><T w="bold" s={11} c={C.primary} style={{ marginLeft: 3 }}>{deficit < 0 ? '+' : '-'}{fmt(Math.abs(deficit))} kcal</T></Row></Pill>
              <T s={10} c={C.onSurfaceVariant} style={{ marginTop: 4 }}>{deficit < 0 ? 'Avg Net Surplus' : 'Avg Net Deficit'}</T>
            </View>
          </Row>
          <Row style={{ marginTop: 14, padding: 10, borderRadius: 12, backgroundColor: 'rgba(8,10,44,0.45)', justifyContent: 'space-between' }}>
            <Row style={{ flex: 1 }}><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary, marginRight: 8 }} />
              <T w="bold" s={12} style={{ flex: 1 }}>{fmtDate(dates[sel], { weekday: 'long', month: 'short', day: 'numeric' })}</T></Row>
            <T s={11} c={C.onSurfaceVariant}>Intake: <T w="bold" s={11} c={C.primary}>{fmt(INTAKE[sel])} kcal</T></T>
            <View style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#0b0d2b' }}><T w="bold" s={10} c={net <= 0 ? C.text : C.error}>{net > 0 ? '+' : ''}{fmt(net)} net</T></View>
          </Row>
          <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ marginTop: 14 }}><Chart width={w} sel={sel} onSel={setSel} intake={INTAKE} burn={BURN} target={goal} /></View>
          <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <Row><View style={{ width: 12, height: 8, borderRadius: 3, backgroundColor: C.primary, marginRight: 6 }} /><T s={10} c={C.onSurfaceVariant}>Intake (kcal)</T></Row>
            <Row><View style={{ width: 12, height: 2, backgroundColor: '#8ccff2', marginRight: 6 }} /><T s={10} c={C.onSurfaceVariant}>Burn Velocity</T></Row>
            <Row><View style={{ width: 12, height: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#b6c4fd', marginRight: 6 }} /><T s={10} c={C.onSurfaceVariant}>Budget Line</T></Row>
          </Row>
        </Panel>

        <Panel>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}><Eyebrow>WEEKLY FUEL BALANCE</Eyebrow><T w="bold" s={20} style={{ marginTop: 4, lineHeight: 25 }}>Macronutrient{'\n'}Distribution</T></View>
            <Pill style={{ backgroundColor: 'rgba(1,94,124,0.55)' }}><T w="bold" s={10} c={C.primary}>{consumed ? 'Tracking' : 'No data\nyet'}</T></Pill>
          </Row>
          <Row style={{ marginTop: 16 }}>
            <Donut segs={mac.map((m) => [m[3], m[4]])} label={`${goalPct}%`} sub="of goal" />
            <View style={{ flex: 1, marginLeft: 16 }}>
              {mac.map(([n, v, t, sh, col]) => (
                <View key={n} style={{ marginBottom: 12 }}>
                  <Row style={{ justifyContent: 'space-between' }}><Row><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: col, marginRight: 6 }} /><T w="bold" s={11} c={col}>{n} ({sh}%)</T></Row><T w="semibold" s={10}>{Math.round(v)}g / {t}g</T></Row>
                  <Bar pct={t ? (v / t) * 100 : 0} h={4} color={col} track="rgba(62,72,79,0.5)" style={{ marginTop: 5 }} />
                </View>
              ))}
            </View>
          </Row>
        </Panel>

        <Panel>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View><Eyebrow>BODY COMPOSITION</Eyebrow><T w="bold" s={20} style={{ marginTop: 4 }}>Weigh-in Telemetry</T></View>
            <Row><Icon n="arrow_downward" s={12} c={C.primary} /><T w="bold" s={11} c={C.primary}> 0.0 kg this week</T></Row>
          </Row>
          <Row style={{ justifyContent: 'space-between', marginTop: 14 }}>
            <View>
              <Row style={{ alignItems: 'baseline' }}><T w="extrabold" s={40} style={{ letterSpacing: -1 }}>{weight ? weight : '--'}</T><T s={13} c={C.onSurfaceVariant}> kg</T></Row>
              <T s={11} c={C.onSurfaceVariant}>{targetWeight ? `Target: ${targetWeight} kg${left !== null ? ` (${left.toFixed(1)} left)` : ''}` : 'Add your weight in Profile'}</T>
            </View>
            <Svg width={lw} height={lh}>
              <Line x1={4} x2={lw - 4} y1={lh / 2} y2={lh / 2} stroke="#79d1ff" strokeWidth={2} opacity={weight ? 1 : 0.3} />
              {weight ? <Circle cx={lw - 4} cy={lh / 2} r={4} fill="#79d1ff" /> : null}
            </Svg>
          </Row>
        </Panel>

        <T w="bold" s={10} c={C.onSurfaceVariant} style={{ letterSpacing: 1.1, marginBottom: 10 }}>WEEKLY TELEMETRY INSIGHTS</T>
        {[
          ['speed', 'Average Daily Deficit', `${fmt(Math.max(0, deficit))} kcal`, logged ? 'Based on the days you logged' : 'Log a meal to see your trend'],
          ['water_drop', 'Hydration Today', `${Math.min(100, Math.round(water / 25))}%`, `${(water / 1000).toFixed(1)}L of 2.5L daily benchmark`],
          ['local_fire_department', 'Peak Density Day', logged ? fmtDate(dates[peak], { weekday: 'long' }) : '--', logged ? `${fmt(INTAKE[peak])} kcal logged` : 'No meals logged yet'],
        ].map(([ic, t, v, s]) => (
          <Row key={t} style={{ padding: 16, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: border, marginBottom: 10, alignItems: 'flex-start' }}>
            <View style={{ width: 40, alignItems: 'center', paddingTop: 4 }}><Icon n={ic} s={22} c={C.primary} /></View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Row style={{ justifyContent: 'space-between' }}><T w="bold" s={15} style={{ flex: 1 }}>{t}</T><T w="bold" s={13}>{v}</T></Row>
              <T s={11} c={C.onSurfaceVariant} style={{ marginTop: 3 }}>{s}</T>
            </View>
          </Row>
        ))}
        <Pressable style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 20, backgroundColor: C.primaryContainer, marginTop: 6, opacity: pressed ? 0.9 : 1 })}>
          <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(0,45,64,0.25)', alignItems: 'center', justifyContent: 'center' }}><Icon n="ios_share" s={20} c={C.onPrimaryContainer} /></View>
          <View style={{ flex: 1, marginLeft: 12 }}><T w="bold" s={15} c={C.onPrimaryContainer}>Export Weekly Report</T><T s={11} c={C.onPrimaryContainer} style={{ opacity: 0.8 }}>PDF Summary & CSV Nutrition Log</T></View>
          <Icon n="chevron_right" s={22} c={C.onPrimaryContainer} />
        </Pressable>
      </Scroll>
      <BottomNav active={tab} onChange={onTab} />
    </View>
  );
}
