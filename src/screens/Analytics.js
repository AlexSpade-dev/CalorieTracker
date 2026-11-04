import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Path, Line, Circle, Defs, LinearGradient as SG, Stop, Text as SText } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { T, Row, Icon, Pill, Bar, AppHeader, BottomNav, Scroll, C } from '../components/kit';

const border = 'rgba(62,72,79,0.45)';
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const FULL = ['Monday, Oct 14', 'Tuesday, Oct 15', 'Wednesday, Oct 16', 'Thursday, Oct 17', 'Friday, Oct 18', 'Saturday, Oct 19', 'Sunday, Oct 20'];
const INTAKE = [1900, 2050, 1850, 2050, 1850, 2350, 1810];
const BURN = [2300, 2350, 2250, 2200, 2300, 2450, 2250];
const TARGET = 2100;
const RANGES = { Day: 'Oct 17', Week: 'Oct 14 - 20', Month: 'October', Year: '2026' };
const fmt = (n) => Math.round(n).toLocaleString('en-US');

const Panel = ({ children, style }) => (
  <View style={[{ borderRadius: 24, borderWidth: 1, borderColor: border, overflow: 'hidden', marginBottom: 16 }, style]}>
    <LinearGradient colors={['#1d2046', '#16183a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18 }}>{children}</LinearGradient>
  </View>
);
const Eyebrow = ({ children }) => <T w="bold" s={10} c={C.secondary} style={{ letterSpacing: 1.1 }}>{children}</T>;

function Chart({ width, sel, onSel }) {
  const H = 190, padL = 6, padR = 34, top = 14, base = 160, max = 2600, min = 1400;
  const bw = 26, gap = (width - padL - padR - bw * 7) / 6;
  const y = (v) => base - ((v - min) / (max - min)) * (base - top);
  const x = (i) => padL + i * (bw + gap);
  const burnPath = BURN.map((v, i) => `${i ? 'L' : 'M'}${x(i) + bw / 2},${y(v)}`).join(' ');
  return (
    <Svg width={width} height={H}>
      <Defs>
        <SG id="bar" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#79d1ff" stopOpacity="0.95" /><Stop offset="1" stopColor="#1a5f86" stopOpacity="0.85" /></SG>
        <SG id="barSel" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#c3e8ff" /><Stop offset="1" stopColor="#5fb9e8" /></SG>
      </Defs>
      {INTAKE.map((v, i) => (
        <Rect key={i} x={x(i)} y={y(v)} width={bw} height={base - y(v)} rx={7} fill={i === sel ? 'url(#barSel)' : 'url(#bar)'} onPress={() => onSel(i)} />
      ))}
      <Path d={burnPath} stroke="#8ccff2" strokeWidth={1.5} fill="none" opacity={0.75} />
      <Line x1={0} x2={width - padR} y1={y(TARGET)} y2={y(TARGET)} stroke="#b6c4fd" strokeWidth={1} strokeDasharray="4 4" opacity={0.7} />
      <SText x={width - padR + 3} y={y(TARGET) + 3} fontSize={8} fill="#b6c4fd">TARGET</SText>
      {DAYS.map((d, i) => <SText key={i} x={x(i) + bw / 2} y={base + 22} fontSize={11} fill={i === sel ? '#79d1ff' : '#bec8d0'} fontWeight="600" textAnchor="middle">{d}</SText>)}
    </Svg>
  );
}

function Donut({ size = 128 }) {
  const stroke = 16, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const segs = [[45, '#79d1ff'], [30, '#b6c4fd'], [25, '#8ccff2']];
  let off = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        {segs.map(([p, col], i) => {
          const len = (circ * p) / 100; const el = <Circle key={i} cx={size / 2} cy={size / 2} r={r} stroke={col} strokeWidth={stroke} fill="none" strokeDasharray={`${len - 2} ${circ}`} strokeDashoffset={-off} />; off += len; return el; })}
      </Svg>
      <T w="extrabold" s={24}>100%</T><T s={11} c={C.onSurfaceVariant}>Matched</T>
    </View>
  );
}

export default function Analytics({ tab, onTab }) {
  const [range, setRange] = useState('Week');
  const [sel, setSel] = useState(3);
  const [w, setW] = useState(300);
  const avg = INTAKE.reduce((a, b) => a + b, 0) / 7;
  const net = INTAKE[sel] - BURN[sel];
  const weights = [74.9, 74.8, 74.6, 74.5, 74.4, 74.3, 74.2];
  const lw = 150, lh = 58;
  const pts = weights.map((v, i) => [(i / 6) * (lw - 8) + 4, 6 + ((v - 74.1) / 0.9) * (lh - 20)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');

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
              <Pill style={{ backgroundColor: 'rgba(1,94,124,0.5)' }}><Row><Icon n="trending_down" s={12} c={C.primary} /><T w="bold" s={11} c={C.primary} style={{ marginLeft: 3 }}>-320 kcal</T></Row></Pill>
              <T s={10} c={C.onSurfaceVariant} style={{ marginTop: 4 }}>Avg Net Deficit</T>
            </View>
          </Row>
          <Row style={{ marginTop: 14, padding: 10, borderRadius: 12, backgroundColor: 'rgba(8,10,44,0.45)', justifyContent: 'space-between' }}>
            <Row style={{ flex: 1 }}><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary, marginRight: 8 }} />
              <T w="bold" s={12} style={{ flex: 1 }}>{FULL[sel]}</T></Row>
            <T s={11} c={C.onSurfaceVariant}>Intake: <T w="bold" s={11} c={C.primary}>{fmt(INTAKE[sel])} kcal</T></T>
            <View style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#0b0d2b' }}><T w="bold" s={10} c={net <= 0 ? C.text : C.error}>{net > 0 ? '+' : ''}{net} net</T></View>
          </Row>
          <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ marginTop: 14 }}><Chart width={w} sel={sel} onSel={setSel} /></View>
          <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <Row><View style={{ width: 12, height: 8, borderRadius: 3, backgroundColor: C.primary, marginRight: 6 }} /><T s={10} c={C.onSurfaceVariant}>Intake (kcal)</T></Row>
            <Row><View style={{ width: 12, height: 2, backgroundColor: '#8ccff2', marginRight: 6 }} /><T s={10} c={C.onSurfaceVariant}>Burn Velocity</T></Row>
            <Row><View style={{ width: 12, height: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#b6c4fd', marginRight: 6 }} /><T s={10} c={C.onSurfaceVariant}>Budget Line</T></Row>
          </Row>
        </Panel>

        <Panel>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}><Eyebrow>WEEKLY FUEL BALANCE</Eyebrow><T w="bold" s={20} style={{ marginTop: 4, lineHeight: 25 }}>Macronutrient{'\n'}Distribution</T></View>
            <Pill style={{ backgroundColor: 'rgba(1,94,124,0.55)' }}><T w="bold" s={10} c={C.primary}>Optimal{'\n'}Range</T></Pill>
          </Row>
          <Row style={{ marginTop: 16 }}>
            <Donut />
            <View style={{ flex: 1, marginLeft: 16 }}>
              {[['Carbs (45%)', '222g / 225g', 98.7, '#79d1ff'], ['Protein (30%)', '148g / 150g', 98.7, '#b6c4fd'], ['Fats (25%)', '55g / 58g', 94.8, '#8ccff2']].map(([l, v, p, col]) => (
                <View key={l} style={{ marginBottom: 12 }}>
                  <Row style={{ justifyContent: 'space-between' }}><Row><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: col, marginRight: 6 }} /><T w="bold" s={11} c={col}>{l}</T></Row><T w="semibold" s={10}>{v}</T></Row>
                  <Bar pct={p} h={4} color={col} track="rgba(62,72,79,0.5)" style={{ marginTop: 5 }} />
                </View>
              ))}
            </View>
          </Row>
        </Panel>

        <Panel>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View><Eyebrow>BODY COMPOSITION</Eyebrow><T w="bold" s={20} style={{ marginTop: 4 }}>Weigh-in Telemetry</T></View>
            <Row><Icon n="arrow_downward" s={12} c={C.primary} /><T w="bold" s={11} c={C.primary}> -0.4 kg this week</T></Row>
          </Row>
          <Row style={{ justifyContent: 'space-between', marginTop: 14 }}>
            <View>
              <Row style={{ alignItems: 'baseline' }}><T w="extrabold" s={40} style={{ letterSpacing: -1 }}>74.2</T><T s={13} c={C.onSurfaceVariant}> kg</T></Row>
              <T s={11} c={C.onSurfaceVariant}>Target: 72.0 kg (-2.2 left)</T>
            </View>
            <Svg width={lw} height={lh}>
              <Defs><SG id="area" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#79d1ff" stopOpacity="0.3" /><Stop offset="1" stopColor="#79d1ff" stopOpacity="0" /></SG></Defs>
              <Path d={`${line} L${pts[6][0]},${lh} L${pts[0][0]},${lh} Z`} fill="url(#area)" />
              <Path d={line} stroke="#79d1ff" strokeWidth={2} fill="none" />
              <Circle cx={pts[6][0]} cy={pts[6][1]} r={4} fill="#79d1ff" />
            </Svg>
          </Row>
        </Panel>

        <T w="bold" s={10} c={C.onSurfaceVariant} style={{ letterSpacing: 1.1, marginBottom: 10 }}>WEEKLY TELEMETRY INSIGHTS</T>
        {[['speed', 'Average Daily Deficit', '320 kcal', 'Consistent with steady fat-loss phase target'], ['water_drop', 'Hydration Adherence', '92%', '6 of 7 days surpassed 2.5L benchmark'], ['local_fire_department', 'Peak Density Day', 'Saturday', '2,350 kcal (+250 kcal social dinner buffer)']].map(([ic, t, v, s]) => (
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
