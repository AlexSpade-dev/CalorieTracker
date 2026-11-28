import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Line, Path, Rect, LinearGradient as SG, Text as SText, Stop } from 'react-native-svg';
import { buildCsv, buildXlsx } from '../lib/xlsxWriter';
import { saveFile } from '../lib/exportFiles';
import { AppHeader, Bar, BottomNav, C, CTA, Icon, Pill, Row, Scroll, Sheet, T } from '../components/kit';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const border = 'rgba(62,72,79,0.45)';
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const SLOTS = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
const RANGE_NAMES = ['Day', 'Week', 'Month', 'Year'];
const ADJ = { Day: 'Daily', Week: 'Weekly', Month: 'Monthly', Year: 'Yearly' };
const CURRENT = { Day: 'Today', Week: 'This week', Month: 'This month', Year: 'This year' };
const THIS = { Day: 'on this day', Week: 'this week', Month: 'this month', Year: 'this year' };
const HINT = {
  Week: 'Tap a bar to pick a day. Tap the highlighted day again to open it.',
  Month: 'Tap any date to open that day.',
  Year: 'Scroll the years and tap one to open its January. Use the arrows to move between months.',
};
const WATER_GOAL = 2500;
// how far you can browse: 1900 up to 5000
const MIN_YEAR = 1900, MAX_YEAR = 5000;
const MIN_KEY = `${MIN_YEAR}-01-01`, MAX_KEY = `${MAX_YEAR}-12-31`;
const YEAR_ROWS = Array.from({ length: Math.ceil((MAX_YEAR - MIN_YEAR + 1) / 2) }, (_, i) => MIN_YEAR + i * 2); // two years per row
const ROW_H = 100, LIST_H = ROW_H * 3;

const fmtDate = (d, o) => d.toLocaleDateString('en-US', o);
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mondayOf = (d) => addDays(d, -((d.getDay() + 6) % 7));
const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
const EMPTY = { kcal: 0, carbs: 0, protein: 0, fats: 0, water: 0, meals: [] };
const blank = () => ({ kcal: 0, carbs: 0, protein: 0, fats: 0, water: 0, meals: [] });

// first and last day of the period that contains date `a`
function bounds(range, a) {
  if (range === 'Day') return [a, a];
  if (range === 'Week') { const m = mondayOf(a); return [m, addDays(m, 6)]; }
  if (range === 'Month') return [new Date(a.getFullYear(), a.getMonth(), 1), new Date(a.getFullYear(), a.getMonth() + 1, 0)];
  return [new Date(a.getFullYear(), 0, 1), new Date(a.getFullYear(), 11, 31)];
}

// every day key in the period (Year only lists days that have data)
function keysFor(range, a, byDay) {
  if (range === 'Day') return [dayKey(a)];
  if (range === 'Week') { const m = mondayOf(a); return Array.from({ length: 7 }, (_, i) => dayKey(addDays(m, i))); }
  if (range === 'Month') return Array.from({ length: daysIn(a.getFullYear(), a.getMonth()) }, (_, i) => dayKey(new Date(a.getFullYear(), a.getMonth(), i + 1)));
  const y = String(a.getFullYear());
  return Object.keys(byDay).filter((k) => k.startsWith(y)).sort();
}

// ---------------------------------------------------------------------------
// Small UI pieces
// ---------------------------------------------------------------------------
const Panel = ({ children, style }) => (
  <View style={[{ borderRadius: 24, borderWidth: 1, borderColor: border, overflow: 'hidden', marginBottom: 16 }, style]}>
    <LinearGradient colors={['#1d2046', '#16183a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18 }}>{children}</LinearGradient>
  </View>
);
const Eyebrow = ({ children }) => <T w="bold" s={10} c={C.secondary} style={{ letterSpacing: 1.1 }}>{children}</T>;
const NavBtn = ({ icon, disabled, onPress, label }) => (
  <Pressable disabled={disabled} onPress={onPress} hitSlop={6} accessibilityLabel={label}
    style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: border, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : pressed ? 0.7 : 1 })}>
    <Icon n={icon} s={22} c={C.primary} />
  </Pressable>
);
const Legend = ({ items }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 }}>
    {items.map(([kind, col, text]) => (
      <Row key={text} style={{ marginBottom: 4, marginRight: 8 }}>
        {kind === 'box' && <View style={{ width: 12, height: 8, borderRadius: 3, backgroundColor: col, marginRight: 6 }} />}
        {kind === 'line' && <View style={{ width: 12, height: 2, backgroundColor: col, marginRight: 6 }} />}
        {kind === 'dash' && <View style={{ width: 12, height: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: col, marginRight: 6 }} />}
        <T s={10} c={C.onSurfaceVariant}>{text}</T>
      </Row>
    ))}
  </View>
);

// ---------------------------------------------------------------------------
// DAY: intake per meal, running total, burn and budget lines
// ---------------------------------------------------------------------------
function DayChart({ width, slotKcal, target, burn }) {
  const H = 200, padL = 6, padR = 34, top = 22, base = 164;
  let run = 0;
  const cum = slotKcal.map((v) => (run += v));
  const max = Math.max(target * 1.15, burn, run, 1);
  const colW = (width - padL - padR) / 4, bw = Math.min(38, colW - 16);
  const cx = (i) => padL + colW * (i + 0.5);
  const y = (v) => base - (v / max) * (base - top);
  const pts = run > 0 ? cum.map((v, i) => [cx(i), y(v)]) : [];
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  return (
    <Svg width={width} height={H}>
      <Defs>
        <SG id="bar" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#79d1ff" stopOpacity="0.95" /><Stop offset="1" stopColor="#1a5f86" stopOpacity="0.85" /></SG>
      </Defs>
      {slotKcal.map((v, i) => (v > 0
        ? <Rect key={i} x={cx(i) - bw / 2} y={y(v)} width={bw} height={base - y(v)} rx={7} fill="url(#bar)" />
        : <Rect key={i} x={cx(i) - bw / 2} y={base - 4} width={bw} height={4} rx={2} fill="rgba(62,72,79,0.55)" />))}
      {slotKcal.map((v, i) => (v > 0 ? <SText key={`t${i}`} x={cx(i)} y={y(v) - 6} fontSize={9} fontWeight="700" fill="#e0e0ff" textAnchor="middle">{fmt(v)}</SText> : null))}
      {burn > 0 && <Line x1={padL} x2={width - padR} y1={y(burn)} y2={y(burn)} stroke="#8ccff2" strokeWidth={1.5} opacity={0.75} />}
      {pts.length > 1 && <Path d={path} stroke="#e0e0ff" strokeWidth={1.5} fill="none" opacity={0.85} />}
      {pts.map((p, i) => <Circle key={`c${i}`} cx={p[0]} cy={p[1]} r={3} fill="#e0e0ff" />)}
      <Line x1={0} x2={width - padR} y1={y(target)} y2={y(target)} stroke="#b6c4fd" strokeWidth={1} strokeDasharray="4 4" opacity={0.7} />
      <SText x={width - padR + 3} y={y(target) + 3} fontSize={8} fill="#b6c4fd">TARGET</SText>
      {SLOTS.map((s, i) => <SText key={s} x={cx(i)} y={base + 22} fontSize={10} fill={slotKcal[i] > 0 ? '#79d1ff' : '#bec8d0'} fontWeight="600" textAnchor="middle">{s}</SText>)}
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// WEEK: seven bars, tap one to select that day
// ---------------------------------------------------------------------------
function WeekChart({ width, keys, sel, onSel, intake, burn, target, todayKey }) {
  const H = 206, padL = 6, padR = 34, top = 14, base = 160;
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
      {intake.map((v, i) => (v > 0
        ? <Rect key={i} x={x(i)} y={y(v)} width={bw} height={base - y(v)} rx={7} fill={i === sel ? 'url(#barSel)' : 'url(#bar)'} />
        : <Rect key={i} x={x(i)} y={base - 4} width={bw} height={4} rx={2} fill={i === sel ? 'rgba(121,209,255,0.55)' : 'rgba(62,72,79,0.55)'} />))}
      {burnPts.length > 1 && <Path d={burnPath} stroke="#8ccff2" strokeWidth={1.5} fill="none" opacity={0.75} />}
      {burnPts.map((p, i) => <Circle key={i} cx={p[0]} cy={p[1]} r={3} fill="#8ccff2" />)}
      <Line x1={0} x2={width - padR} y1={y(target)} y2={y(target)} stroke="#b6c4fd" strokeWidth={1} strokeDasharray="4 4" opacity={0.7} />
      <SText x={width - padR + 3} y={y(target) + 3} fontSize={8} fill="#b6c4fd">TARGET</SText>
      {DAYS.map((d, i) => (
        <SText key={`d${i}`} x={x(i) + bw / 2} y={base + 22} fontSize={11} fill={i === sel ? '#79d1ff' : '#bec8d0'} fontWeight="600" textAnchor="middle">{d}</SText>
      ))}
      {keys.map((k, i) => (
        <SText key={`n${i}`} x={x(i) + bw / 2} y={base + 37} fontSize={9} fill={k === todayKey ? '#79d1ff' : i === sel ? '#79d1ff' : '#88929a'} fontWeight={k === todayKey ? '700' : '400'} textAnchor="middle">{Number(k.slice(8))}</SText>
      ))}
      {/* full-height touch targets so thin bars are easy to hit */}
      {keys.map((k, i) => (
        <Rect key={`h${i}`} x={x(i) - gap / 2} y={top} width={bw + gap} height={base - top + 44} fill="transparent" onPress={() => onSel(i)} />
      ))}
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// MONTH: calendar grid
// ---------------------------------------------------------------------------
function MonthCalendar({ width, keys, anchor, todayKey, get, goal, onPick }) {
  const gap = 4;
  const cw = Math.floor((width - gap * 6) / 7);
  const lead = (parseKey(keys[0]).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...keys];
  while (cells.length % 7) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return (
    <View>
      <Row style={{ marginBottom: 6 }}>
        {DAYS.map((d, i) => <View key={i} style={{ width: cw, marginRight: i < 6 ? gap : 0, alignItems: 'center' }}><T w="semibold" s={10} c={C.outline}>{d}</T></View>)}
      </Row>
      {rows.map((r, ri) => (
        <Row key={ri} style={{ marginBottom: gap }}>
          {r.map((k, ci) => {
            const mr = ci < 6 ? gap : 0;
            if (!k) return <View key={ci} style={{ width: cw, height: 46, marginRight: mr }} />;
            const kcal = get(k).kcal;
            const future = k > todayKey, over = kcal > goal, on = k === anchor;
            const pct = goal ? Math.min(100, (kcal / goal) * 100) : 0;
            return (
              <Pressable key={ci} onPress={() => onPick(k)} accessibilityLabel={`Open ${k}`}
                style={({ pressed }) => ({ width: cw, height: 46, marginRight: mr, borderRadius: 11, paddingTop: 6, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6,
                  backgroundColor: kcal > 0 ? (over ? 'rgba(255,180,171,0.16)' : 'rgba(121,209,255,0.14)') : 'rgba(8,10,44,0.45)',
                  borderWidth: on ? 1.5 : 1, borderColor: on ? C.primary : kcal > 0 ? 'rgba(121,209,255,0.18)' : 'rgba(62,72,79,0.3)',
                  opacity: pressed ? 0.7 : future ? 0.55 : 1 })}>
                <T w={k === todayKey || on ? 'extrabold' : 'semibold'} s={12} c={k === todayKey ? C.primary : C.text}>{Number(k.slice(8))}</T>
                <View style={{ alignSelf: 'stretch', height: 3, borderRadius: 2, backgroundColor: 'rgba(62,72,79,0.5)', overflow: 'hidden' }}>
                  {kcal > 0 ? <View style={{ width: `${pct}%`, height: 3, backgroundColor: over ? C.error : C.primary }} /> : null}
                </View>
              </Pressable>
            );
          })}
        </Row>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// YEAR: scrollable list of years (1900 - 5000), two per row
// ---------------------------------------------------------------------------
function YearList({ width, year, thisYear, agg, goal, onPick }) {
  const ref = useRef(null);
  const first = useRef(true);
  const rowOf = (y) => Math.floor((y - MIN_YEAR) / 2);
  useEffect(() => { // keep the selected year in view when the arrows change it
    if (first.current) { first.current = false; return; }
    try { ref.current && ref.current.scrollToIndex({ index: rowOf(year), animated: true, viewPosition: 0.5 }); } catch (e) { /* ignore */ }
  }, [year]);
  const gap = 10, tw = Math.floor((width - gap) / 2);
  const tile = (y, left) => {
    const g = agg[y], avg = g ? g.kcal / g.n : 0, on = y === year, now = y === thisYear;
    return (
      <Pressable key={y} onPress={() => onPick(y)} accessibilityLabel={`Open ${y}`}
        style={({ pressed }) => ({ width: tw, height: ROW_H - gap, marginRight: left ? gap : 0, padding: 10, borderRadius: 14, justifyContent: 'space-between', overflow: 'hidden',
          backgroundColor: g ? 'rgba(121,209,255,0.1)' : 'rgba(8,10,44,0.45)', borderWidth: on ? 1.5 : 1, borderColor: on ? C.primary : 'rgba(62,72,79,0.35)',
          opacity: pressed ? 0.7 : y > thisYear ? 0.6 : 1 })}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T w="extrabold" s={18} c={on ? C.primary : C.text} style={{ letterSpacing: -0.3 }}>{y}</T>
          {now ? <Pill><T w="bold" s={8} c={C.primary}>NOW</T></Pill> : null}
        </Row>
        <T s={10} c={C.onSurfaceVariant}>{g ? `${fmt(avg)} kcal/day` : 'no data'}</T>
        <Bar pct={g && goal ? (avg / goal) * 100 : 0} h={3} color={avg > goal ? C.error : C.primary} track="rgba(62,72,79,0.5)" />
        <T s={9} c={C.outline}>{g ? `${g.n} ${g.n === 1 ? 'day' : 'days'} logged` : ' '}</T>
      </Pressable>
    );
  };
  return (
    <FlatList ref={ref} data={YEAR_ROWS} keyExtractor={(y) => String(y)} style={{ height: LIST_H }} nestedScrollEnabled showsVerticalScrollIndicator={false}
      initialScrollIndex={Math.max(0, rowOf(year) - 1)} initialNumToRender={8} windowSize={7}
      getItemLayout={(_, i) => ({ length: ROW_H, offset: ROW_H * i, index: i })}
      renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', height: ROW_H }}>{tile(item, true)}{item + 1 <= MAX_YEAR ? tile(item + 1, false) : null}</View>
      )} />
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

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
// history = { meals, water, weighIns } rows loaded from Supabase (see App.js)
// live    = { meals, water } for today, only used when there is no database (demo mode)
export default function Analytics({ split = { c: 40, p: 30, f: 30 }, tab, onTab, goal = 2200, weight = null, targetWeight = null, baseBurn = 1820, history, live }) {
  const todayKey = dayKey();
  const today = parseKey(todayKey);
  const [range, setRange] = useState('Week');
  const [anchor, setAnchor] = useState(todayKey); // the one selected date every view is built around
  const [w, setW] = useState(300);
  const [report, setReport] = useState(false);
  const [exportMsg, setExportMsg] = useState(null); // { ok, text } shown in the export sheet
  const [exporting, setExporting] = useState(false);
  const a = parseKey(anchor);

  // ----- per-day totals -----
  const byDay = useMemo(() => {
    const m = {};
    const day = (k) => m[k] || (m[k] = blank());
    const addMeal = (k, meal) => {
      const d = day(k);
      const slot = SLOTS.includes(meal.meal) ? meal.meal : 'Snack';
      d.kcal += meal.kcal || 0; d.carbs += meal.carbs || 0; d.protein += meal.protein || 0; d.fats += meal.fats || 0;
      d.meals.push({ meal: slot, name: meal.name, kcal: meal.kcal || 0, carbs: meal.carbs || 0, protein: meal.protein || 0, fats: meal.fats || 0 });
    };
    (history?.meals || []).forEach((r) => addMeal(r.eaten_on, { meal: r.slot, name: r.name, kcal: r.kcal, carbs: Number(r.carbs_g), protein: Number(r.protein_g), fats: Number(r.fats_g) }));
    (history?.water || []).forEach((r) => { day(r.logged_on).water += r.ml; });
    if (live) { (live.meals || []).forEach((x) => addMeal(todayKey, x)); day(todayKey).water += live.water || 0; }
    return m;
  }, [history, live, todayKey]);
  const get = (k) => byDay[k] || EMPTY;
  const yearAgg = useMemo(() => { // { 2026: { n: days logged, kcal: total } }
    const out = {};
    Object.keys(byDay).forEach((k) => { if (byDay[k].kcal > 0) { const y = Number(k.slice(0, 4)); const g = out[y] || (out[y] = { n: 0, kcal: 0 }); g.n += 1; g.kcal += byDay[k].kcal; } });
    return out;
  }, [byDay]);

  // totals for a list of day keys (only days up to today that have a meal count as "logged")
  const stats = (keys) => {
    const elapsed = keys.filter((k) => k <= todayKey);
    const logged = elapsed.filter((k) => get(k).kcal > 0);
    const tot = (f) => logged.reduce((n, k) => n + f(get(k)), 0);
    const n = logged.length;
    const intake = tot((d) => d.kcal);
    const waterDays = elapsed.filter((k) => get(k).water > 0);
    return {
      elapsed: elapsed.length, logged: n, loggedKeys: logged, intake, avg: n ? intake / n : 0,
      deficit: n ? baseBurn - intake / n : 0,
      carbs: tot((d) => d.carbs), protein: tot((d) => d.protein), fats: tot((d) => d.fats),
      avgWater: waterDays.length ? waterDays.reduce((s, k) => s + get(k).water, 0) / waterDays.length : 0,
    };
  };

  const keys = keysFor(range, a, byDay);
  const st = stats(keys);
  const [startD, endD] = bounds(range, a);
  const sk = dayKey(startD), ek = dayKey(endD);

  // ----- navigation -----
  const [curS, curE] = bounds(range, today);
  const isCurrent = anchor >= dayKey(curS) && anchor <= dayKey(curE);
  const canNext = dayKey(addDays(endD, 1)) <= MAX_KEY;
  const canPrev = dayKey(addDays(startD, -1)) >= MIN_KEY;
  const shift = (dir) => {
    let n;
    if (range === 'Day') n = addDays(a, dir);
    else if (range === 'Week') n = addDays(a, 7 * dir);
    else if (range === 'Month') { n = new Date(a.getFullYear(), a.getMonth() + dir, 1); n.setDate(Math.min(a.getDate(), daysIn(n.getFullYear(), n.getMonth()))); }
    else { n = new Date(a.getFullYear() + dir, a.getMonth(), 1); n.setDate(Math.min(a.getDate(), daysIn(n.getFullYear(), n.getMonth()))); }
    const nk = dayKey(n);
    setAnchor(nk > MAX_KEY ? MAX_KEY : nk < MIN_KEY ? MIN_KEY : nk);
  };
  const openDay = (k) => { setAnchor(k); setRange('Day'); };
  const openMonth = (m) => {
    const sameAsAnchor = dayKey(m.d).slice(0, 7) === anchor.slice(0, 7);
    const isThisMonth = m.d.getMonth() === today.getMonth() && m.d.getFullYear() === today.getFullYear();
    setAnchor(sameAsAnchor ? anchor : isThisMonth ? todayKey : dayKey(m.d));
    setRange('Month');
  };
  const pickYear = (y) => { setAnchor(dayKey(new Date(y, 0, 1))); setRange('Month'); }; // open January of that year


  // ----- labels -----
  const yr = a.getFullYear() !== today.getFullYear();
  const chip = {
    Day: fmtDate(a, { month: 'short', day: 'numeric', ...(yr ? { year: 'numeric' } : {}) }),
    Week: `${fmtDate(startD, { month: 'short', day: 'numeric' })} - ${fmtDate(endD, startD.getMonth() === endD.getMonth() ? { day: 'numeric' } : { month: 'short', day: 'numeric' })}`,
    Month: fmtDate(a, { month: 'long', ...(yr ? { year: 'numeric' } : {}) }),
    Year: String(a.getFullYear()),
  }[range];
  const longLabel = {
    Day: fmtDate(a, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
    Week: `${fmtDate(startD, { month: 'short', day: 'numeric' })} - ${fmtDate(endD, { month: 'short', day: 'numeric', year: 'numeric' })}`,
    Month: fmtDate(a, { month: 'long', year: 'numeric' }),
    Year: String(a.getFullYear()),
  }[range];

  // ----- the selected day / month row inside the calorie panel -----
  const isDay = range === 'Day', isYear = range === 'Year';
  const months = isYear ? Array.from({ length: 12 }, (_, m) => { const d = new Date(a.getFullYear(), m, 1); return { m, d, future: dayKey(d) > todayKey, ...stats(keysFor('Month', d, byDay)) }; }) : [];
  const monthSt = isYear ? months[a.getMonth()] : null;
  const dayData = get(anchor);
  const dayNet = dayData.kcal > 0 ? dayData.kcal - baseBurn : 0;
  const sel = isYear
    ? { title: fmtDate(a, { month: 'long', year: 'numeric' }), label: 'Avg:', value: monthSt.avg, net: monthSt.logged ? monthSt.avg - baseBurn : 0, onOpen: () => setRange('Month') }
    : { title: fmtDate(a, { weekday: 'long', month: 'short', day: 'numeric' }), label: 'Intake:', value: dayData.kcal, net: dayNet, onOpen: isDay ? null : () => setRange('Day') };

  // ----- chart data -----
  const intake = range === 'Week' ? keys.map((k) => get(k).kcal) : [];
  const burn = intake.map((v) => (v > 0 ? baseBurn : 0));
  const slotKcal = SLOTS.map((s) => dayData.meals.filter((m) => m.meal === s).reduce((n, m) => n + m.kcal, 0));

  const bigNum = isDay ? dayData.kcal : st.avg;
  const deficit = st.deficit;

  // ----- macros (day totals, or the average per logged day) -----
  const den = isDay ? 1 : st.logged || 1;
  const carbs = st.carbs / den, protein = st.protein / den, fats = st.fats / den;
  const macroKcal = carbs * 4 + protein * 4 + fats * 9;
  const share = (kcal) => (macroKcal ? Math.round((kcal / macroKcal) * 100) : 0);
  const mac = [
    ['Carbs', carbs, Math.round((goal * split.c) / 400), share(carbs * 4), '#79d1ff'],
    ['Protein', protein, Math.round((goal * split.p) / 400), share(protein * 4), '#b6c4fd'],
    ['Fats', fats, Math.round((goal * split.f) / 900), share(fats * 9), '#8ccff2'],
  ];
  const goalPct = goal ? Math.round((bigNum / goal) * 100) : 0;

  // ----- weigh-ins -----
  const wi = (history?.weighIns || []).map((r) => ({ k: r.logged_on, kg: Number(r.weight_kg) })).sort((x, y) => (x.k < y.k ? -1 : 1));
  const inRange = wi.filter((r) => r.k >= sk && r.k <= ek);
  const before = wi.filter((r) => r.k < sk).pop();
  const upTo = wi.filter((r) => r.k <= ek).pop();
  const shownWeight = upTo ? upTo.kg : weight && ek >= todayKey ? weight : null;
  const change = inRange.length >= 2 ? inRange[inRange.length - 1].kg - inRange[0].kg : inRange.length === 1 && before ? inRange[0].kg - before.kg : 0;
  const left = shownWeight && targetWeight ? Math.abs(shownWeight - targetWeight) : null;
  const lw = 150, lh = 58;
  let spark = null;
  if (inRange.length >= 2) {
    const lo = Math.min(...inRange.map((r) => r.kg)), hi = Math.max(...inRange.map((r) => r.kg));
    const sy = (kg) => (hi === lo ? lh / 2 : lh - 8 - ((kg - lo) / (hi - lo)) * (lh - 16));
    const sx = (i) => 4 + (i * (lw - 8)) / (inRange.length - 1);
    spark = inRange.map((r, i) => [sx(i), sy(r.kg)]);
  }

  // ----- insights -----
  const hydrationMl = isDay ? dayData.water : st.avgWater;
  const biggest = isDay ? [...dayData.meals].sort((x, y) => y.kcal - x.kcal)[0] : null;
  const peakKey = !isDay && !isYear && st.logged ? st.loggedKeys.reduce((b, k) => (get(k).kcal > get(b).kcal ? k : b)) : null;
  const peakMonth = isYear ? months.filter((m) => m.logged).sort((x, y) => y.avg - x.avg)[0] : null;
  const peak = isDay
    ? { title: 'Biggest Meal', value: biggest ? biggest.meal : '--', sub: biggest ? `${biggest.name} - ${fmt(biggest.kcal)} kcal` : 'No meals logged yet', onPress: null }
    : isYear
      ? { title: 'Peak Density Month', value: peakMonth ? fmtDate(peakMonth.d, { month: 'long' }) : '--', sub: peakMonth ? `${fmt(peakMonth.avg)} kcal/day on average` : 'No meals logged yet', onPress: peakMonth ? () => openMonth(peakMonth) : null }
      : { title: 'Peak Density Day', value: peakKey ? fmtDate(parseKey(peakKey), range === 'Week' ? { weekday: 'long' } : { month: 'short', day: 'numeric' }) : '--', sub: peakKey ? `${fmt(get(peakKey).kcal)} kcal logged - tap to open` : 'No meals logged yet', onPress: peakKey ? () => openDay(peakKey) : null };
  const surplus = st.logged > 0 && deficit < 0;
  const insights = [
    ['speed', `${isDay ? 'Daily' : 'Average Daily'} ${surplus ? 'Surplus' : 'Deficit'}`, `${fmt(surplus ? -deficit : Math.max(0, deficit))} kcal`,
      st.logged ? (isDay ? 'Burn minus intake for this day' : 'Based on the days you logged') : isDay ? 'No meals logged on this day' : 'Log a meal to see your trend', null],
    ['water_drop', isDay ? (anchor === todayKey ? 'Hydration Today' : 'Hydration') : 'Avg Hydration', `${Math.min(100, Math.round(hydrationMl / (WATER_GOAL / 100)))}%`,
      `${(hydrationMl / 1000).toFixed(1)}L of ${(WATER_GOAL / 1000).toFixed(1)}L daily benchmark`, null],
    ['local_fire_department', peak.title, peak.value, peak.sub, peak.onPress],
  ];

  // ----- export -----
  const rangeText = longLabel;
  const rows = [
    ...(isDay ? [] : [['Days logged', `${st.logged} / ${st.elapsed}`]]),
    [isDay ? 'Calories' : 'Total intake', `${fmt(isDay ? dayData.kcal : st.intake)} kcal`],
    ...(isDay ? [['Daily goal', `${fmt(goal)} kcal`]] : [['Average / logged day', `${fmt(st.avg)} kcal`]]),
    [isDay ? 'Carbs / Protein / Fats' : 'Carbs / Protein / Fats (avg/day)', `${Math.round(carbs)}g / ${Math.round(protein)}g / ${Math.round(fats)}g`],
    [isDay ? 'Water' : 'Avg water', `${(hydrationMl / 1000).toFixed(1)} L`],
  ];
  const reportText = [
    `CalorieTracker+ ${ADJ[range].toLowerCase()} report (${rangeText})`,
    ...rows.map(([k, v]) => `${k}: ${v}`),
    shownWeight ? `Weight: ${shownWeight} kg${targetWeight ? ` (target ${targetWeight} kg)` : ''}` : '',
  ].filter(Boolean).join('\n');
  // records for the selected period (every day up to today; in the Year view only days that have data)
  const r1 = (n) => Math.round(n * 10) / 10;
  const weekday = (k) => fmtDate(parseKey(k), { weekday: 'long' });
  const expKeys = keys.filter((k) => k <= todayKey);
  const mealRows = expKeys.flatMap((k) => SLOTS.flatMap((sl) => get(k).meals.filter((m) => m.meal === sl)
    .map((m) => [k, weekday(k), m.meal, m.name, m.kcal, r1(m.carbs), r1(m.protein), r1(m.fats)])));
  const dayRows = expKeys.map((k) => {
    const d = get(k), lg = d.kcal > 0;
    return [k, weekday(k), d.kcal, lg ? baseBurn : 0, lg ? d.kcal - baseBurn : 0, goal, r1(d.carbs), r1(d.protein), r1(d.fats), d.water, d.meals.length];
  });
  const MEAL_HEAD = ['Date', 'Day', 'Meal', 'Food', 'Calories (kcal)', 'Carbs (g)', 'Protein (g)', 'Fats (g)'];
  const DAY_HEAD = ['Date', 'Day', 'Intake (kcal)', 'Burn (kcal)', 'Net (kcal)', 'Goal (kcal)', 'Carbs (g)', 'Protein (g)', 'Fats (g)', 'Water (ml)', 'Meals logged'];
  const summaryRows = [
    ['Metric', 'Value'],
    ['Report', `CalorieTracker+ ${ADJ[range].toLowerCase()} report`],
    ['Period', rangeText],
    ['Days logged', `${st.logged} / ${st.elapsed}`],
    ['Total intake (kcal)', Math.round(st.intake)],
    ['Average intake per logged day (kcal)', Math.round(st.avg)],
    ['Daily goal (kcal)', goal],
    ['Estimated burn per logged day (kcal)', baseBurn],
    [deficit < 0 ? 'Average daily surplus (kcal)' : 'Average daily deficit (kcal)', Math.round(Math.abs(deficit))],
    ['Carbs (g per logged day)', r1(carbs)], ['Protein (g per logged day)', r1(protein)], ['Fats (g per logged day)', r1(fats)],
    ['Water (ml per day with water logged)', Math.round(hydrationMl)],
    ['Weight (kg)', shownWeight || ''], ['Target weight (kg)', targetWeight || ''],
  ];
  const fileTag = { Day: anchor, Week: `${sk}_to_${ek}`, Month: anchor.slice(0, 7), Year: String(a.getFullYear()) }[range];
  const fileBase = `CalorieTracker_${range.toLowerCase()}_${fileTag}`;
  const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const runExport = async (kind) => {
    if (exporting) return;
    setExporting(true); setExportMsg(null);
    try {
      let name, data, mime, uti;
      if (kind === 'xlsx') {
        name = `${fileBase}.xlsx`; mime = XLSX_MIME; uti = 'org.openxmlformats.spreadsheetml.sheet';
        data = buildXlsx([
          { name: 'Summary', widths: [38, 34], rows: summaryRows },
          { name: 'Daily Summary', widths: [12, 12, 14, 12, 12, 12, 11, 12, 10, 11, 13], rows: [DAY_HEAD, ...dayRows] },
          { name: 'Meals', widths: [12, 12, 12, 34, 16, 11, 12, 10], rows: [MEAL_HEAD, ...mealRows] },
        ]);
      } else {
        name = `${fileBase}.csv`; mime = 'text/csv'; uti = 'public.comma-separated-values-text';
        data = buildCsv([MEAL_HEAD, ...mealRows]);
      }
      const how = await saveFile(name, data, mime, uti);
      setExportMsg({ ok: true, text: how === 'downloaded' ? `Downloaded ${name}` : `Ready to save or share: ${name}` });
    } catch (e) {
      setExportMsg({ ok: false, text: `Could not create the file${e && e.message ? `: ${e.message}` : '.'}` });
    }
    setExporting(false);
  };
  const send = (message, title) => { Share.share({ message, title }).catch(() => {}); };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: C.bg }}><AppHeader /></SafeAreaView>
      <Scroll>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Row><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary, marginRight: 6 }} /><Eyebrow>TELEMETRY ENGINE</Eyebrow></Row>
            <T w="extrabold" s={26} style={{ letterSpacing: -0.6, marginTop: 4 }}>Analytics & Trends</T>
          </View>
          <Pressable onPress={() => setAnchor(todayKey)} accessibilityLabel="Jump to today">
            <Row style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: border }}>
              <Icon n="calendar_today" s={13} c={C.primary} /><T w="semibold" s={11} style={{ marginLeft: 6 }}>{chip}</T>
            </Row>
          </Pressable>
        </Row>

        <Row style={{ marginTop: 16, marginBottom: 12, padding: 4, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: border }}>
          {RANGE_NAMES.map((k) => { const on = range === k; return (
            <Pressable key={k} onPress={() => setRange(k)} style={{ flex: 1, height: 36, borderRadius: 10, backgroundColor: on ? C.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              <T w="semibold" s={13} c={on ? C.onPrimaryContainer : C.onSurfaceVariant}>{k}</T></Pressable>); })}
        </Row>

        {/* previous / next period */}
        <Row style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <NavBtn icon="chevron_left" disabled={!canPrev} onPress={() => shift(-1)} label="Previous" />
          <Pressable disabled={isCurrent} onPress={() => setAnchor(todayKey)} style={{ alignItems: 'center', flex: 1 }}>
            <T w="bold" s={14}>{longLabel}</T>
            <T w={isCurrent ? 'regular' : 'bold'} s={11} c={isCurrent ? C.onSurfaceVariant : C.primary} style={{ marginTop: 2 }}>{isCurrent ? CURRENT[range] : `Back to ${CURRENT[range].toLowerCase()}`}</T>
          </Pressable>
          <NavBtn icon="chevron_right" disabled={!canNext} onPress={() => shift(1)} label="Next" />
        </Row>

        <Panel>
          <Eyebrow>CALORIE INTAKE VS BURN</Eyebrow>
          <Row style={{ justifyContent: 'space-between', marginTop: 6, alignItems: 'flex-start' }}>
            <Row style={{ alignItems: 'baseline' }}><T w="extrabold" s={38} style={{ letterSpacing: -1 }}>{fmt(bigNum)}</T><T s={11} c={C.onSurfaceVariant}>{isDay ? ' kcal logged' : ' avg kcal/day'}</T></Row>
            <View style={{ alignItems: 'flex-end' }}>
              <Pill style={{ backgroundColor: 'rgba(1,94,124,0.5)' }}><Row><Icon n={deficit < 0 ? 'trending_up' : 'trending_down'} s={12} c={C.primary} /><T w="bold" s={11} c={C.primary} style={{ marginLeft: 3 }}>{deficit < 0 ? '+' : '-'}{fmt(Math.abs(deficit))} kcal</T></Row></Pill>
              <T s={10} c={C.onSurfaceVariant} style={{ marginTop: 4 }}>{isDay ? (deficit < 0 ? 'Net Surplus' : 'Net Deficit') : deficit < 0 ? 'Avg Net Surplus' : 'Avg Net Deficit'}</T>
            </View>
          </Row>

          {/* selected day (or month in the Year view); tap to open it */}
          <Pressable disabled={!sel.onOpen} onPress={sel.onOpen}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', marginTop: 14, padding: 10, borderRadius: 12, backgroundColor: 'rgba(8,10,44,0.45)', justifyContent: 'space-between', opacity: pressed ? 0.8 : 1 })}>
            <Row style={{ flex: 1 }}><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary, marginRight: 8 }} />
              <T w="bold" s={12} style={{ flex: 1 }} numberOfLines={1}>{sel.title}</T></Row>
            <T s={11} c={C.onSurfaceVariant}>{sel.label} <T w="bold" s={11} c={C.primary}>{fmt(sel.value)} kcal</T></T>
            <View style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#0b0d2b' }}><T w="bold" s={10} c={sel.net <= 0 ? C.text : C.error}>{sel.net > 0 ? '+' : ''}{fmt(sel.net)} net</T></View>
            {sel.onOpen ? <Icon n="chevron_right" s={18} c={C.primary} style={{ marginLeft: 4 }} /> : null}
          </Pressable>

          <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ marginTop: 14 }}>
            {range === 'Day' && <DayChart width={w} slotKcal={slotKcal} target={goal} burn={dayData.kcal > 0 ? baseBurn : 0} />}
            {range === 'Week' && <WeekChart width={w} keys={keys} sel={keys.indexOf(anchor)} todayKey={todayKey} intake={intake} burn={burn} target={goal}
              onSel={(i) => (keys[i] === anchor ? openDay(keys[i]) : setAnchor(keys[i]))} />}
            {range === 'Month' && <MonthCalendar width={w} keys={keys} anchor={anchor} todayKey={todayKey} get={get} goal={goal} onPick={openDay} />}
            {range === 'Year' && <YearList width={w} year={a.getFullYear()} thisYear={today.getFullYear()} agg={yearAgg} goal={goal} onPick={pickYear} />}
          </View>

          {range === 'Day' && <Legend items={[['box', C.primary, 'Intake (kcal)'], ['line', '#e0e0ff', 'Running total'], ['line', '#8ccff2', 'Burn Velocity'], ['dash', '#b6c4fd', 'Budget Line']]} />}
          {range === 'Week' && <Legend items={[['box', C.primary, 'Intake (kcal)'], ['line', '#8ccff2', 'Burn Velocity'], ['dash', '#b6c4fd', 'Budget Line']]} />}
          {(range === 'Month' || range === 'Year') && <Legend items={[['box', C.primary, 'Within goal'], ['box', C.error, 'Over goal'], ['box', 'rgba(62,72,79,0.7)', 'No log']]} />}
          {HINT[range] ? <T s={10} c={C.outline} style={{ marginTop: 4 }}>{HINT[range]}</T> : null}

          {/* the day's record */}
          {isDay && (
            <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: border }}>
              {dayData.meals.length === 0
                ? <T s={12} c={C.onSurfaceVariant}>No meals logged on this day.</T>
                : SLOTS.flatMap((s) => dayData.meals.filter((m) => m.meal === s)).map((m, i) => (
                  <Row key={i} style={{ justifyContent: 'space-between', paddingVertical: 6 }}>
                    <View style={{ flex: 1, paddingRight: 10 }}><T w="bold" s={12} numberOfLines={1}>{m.name}</T><T s={10} c={C.onSurfaceVariant}>{m.meal}</T></View>
                    <T w="bold" s={12} c={C.primary}>{fmt(m.kcal)} kcal</T>
                  </Row>
                ))}
            </View>
          )}
        </Panel>

        <Panel>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}><Eyebrow>{ADJ[range].toUpperCase()} FUEL BALANCE</Eyebrow><T w="bold" s={20} style={{ marginTop: 4, lineHeight: 25 }}>Macronutrient{'\n'}Distribution</T></View>
            <Pill style={{ backgroundColor: 'rgba(1,94,124,0.55)' }}><T w="bold" s={10} c={C.primary}>{st.logged ? (isDay ? 'Tracking' : `${st.logged} ${st.logged === 1 ? 'day' : 'days'}\nlogged`) : 'No data\nyet'}</T></Pill>
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
          {!isDay && <T s={10} c={C.outline} style={{ marginTop: 2 }}>Average per logged day</T>}
        </Panel>

        <Panel>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View><Eyebrow>BODY COMPOSITION</Eyebrow><T w="bold" s={20} style={{ marginTop: 4 }}>Weigh-in Telemetry</T></View>
            <Row><Icon n={change > 0 ? 'arrow_upward' : 'arrow_downward'} s={12} c={C.primary} /><T w="bold" s={11} c={C.primary}> {Math.abs(change).toFixed(1)} kg {THIS[range]}</T></Row>
          </Row>
          <Row style={{ justifyContent: 'space-between', marginTop: 14 }}>
            <View>
              <Row style={{ alignItems: 'baseline' }}><T w="extrabold" s={40} style={{ letterSpacing: -1 }}>{shownWeight ? shownWeight : '--'}</T><T s={13} c={C.onSurfaceVariant}> kg</T></Row>
              <T s={11} c={C.onSurfaceVariant}>{targetWeight ? `Target: ${targetWeight} kg${left !== null ? ` (${left.toFixed(1)} left)` : ''}` : 'Add your weight in Profile'}</T>
            </View>
            <Svg width={lw} height={lh}>
              {spark ? (
                <>
                  <Path d={spark.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')} stroke="#79d1ff" strokeWidth={2} fill="none" />
                  {spark.map((p, i) => <Circle key={i} cx={p[0]} cy={p[1]} r={i === spark.length - 1 ? 4 : 2.5} fill="#79d1ff" />)}
                </>
              ) : (
                <>
                  <Line x1={4} x2={lw - 4} y1={lh / 2} y2={lh / 2} stroke="#79d1ff" strokeWidth={2} opacity={shownWeight ? 1 : 0.3} />
                  {shownWeight ? <Circle cx={lw - 4} cy={lh / 2} r={4} fill="#79d1ff" /> : null}
                </>
              )}
            </Svg>
          </Row>
        </Panel>

        <T w="bold" s={10} c={C.onSurfaceVariant} style={{ letterSpacing: 1.1, marginBottom: 10 }}>{ADJ[range].toUpperCase()} TELEMETRY INSIGHTS</T>
        {insights.map(([ic, t, v, s, onPress]) => (
          <Pressable key={t} disabled={!onPress} onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: border, marginBottom: 10, opacity: pressed ? 0.85 : 1 })}>
            <View style={{ width: 40, alignItems: 'center', paddingTop: 4 }}><Icon n={ic} s={22} c={C.primary} /></View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Row style={{ justifyContent: 'space-between' }}><T w="bold" s={15} style={{ flex: 1 }}>{t}</T><T w="bold" s={13}>{v}</T>{onPress ? <Icon n="chevron_right" s={18} c={C.primary} /> : null}</Row>
              <T s={11} c={C.onSurfaceVariant} style={{ marginTop: 3 }}>{s}</T>
            </View>
          </Pressable>
        ))}
        <Pressable onPress={() => { setExportMsg(null); setReport(true); }} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 20, backgroundColor: C.primaryContainer, marginTop: 6, opacity: pressed ? 0.9 : 1 })}>
          <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(0,45,64,0.25)', alignItems: 'center', justifyContent: 'center' }}><Icon n="ios_share" s={20} c={C.onPrimaryContainer} /></View>
          <View style={{ flex: 1, marginLeft: 12 }}><T w="bold" s={15} c={C.onPrimaryContainer}>Export {ADJ[range]} Report</T><T s={11} c={C.onPrimaryContainer} style={{ opacity: 0.8 }}>Summary & CSV Nutrition Log</T></View>
          <Icon n="chevron_right" s={22} c={C.onPrimaryContainer} />
        </Pressable>
      </Scroll>
      <Sheet visible={report} onClose={() => setReport(false)}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flex: 1 }}><T w="bold" s={20}>{ADJ[range]} Report</T><T s={12} c={C.onSurfaceVariant}>{rangeText}</T></View>
          <Pressable onPress={() => setReport(false)} hitSlop={10}><Icon n="close" s={20} c={C.outline} /></Pressable>
        </Row>
        <View style={{ padding: 14, borderRadius: 14, backgroundColor: C.bg, borderWidth: 1, borderColor: border, marginBottom: 14 }}>
          {rows.map(([k, v]) => (
            <Row key={k} style={{ justifyContent: 'space-between', paddingVertical: 5 }}><T s={12} c={C.onSurfaceVariant} style={{ flex: 1, paddingRight: 8 }}>{k}</T><T w="bold" s={12}>{v}</T></Row>
          ))}
        </View>
        {st.logged === 0 && <T s={11} c={C.outline} style={{ marginBottom: 12 }}>No meals logged in this period, so the report is empty.</T>}
        <CTA title={exporting ? 'Preparing...' : 'Download Excel (.xlsx)'} icon="table_chart" onPress={() => runExport('xlsx')} />
        <CTA tone="ghost" title="Download CSV" icon="description" onPress={() => runExport('csv')} style={{ marginTop: 10 }} />
        <CTA tone="ghost" title="Share Summary as Text" icon="ios_share" onPress={() => send(reportText, `CalorieTracker+ ${ADJ[range].toLowerCase()} report`)} style={{ marginTop: 10 }} />
        {exportMsg ? <T s={11} c={exportMsg.ok ? C.primary : C.error} style={{ marginTop: 12, textAlign: 'center' }}>{exportMsg.text}</T> : null}
        <T s={10} c={C.outline} style={{ marginTop: 8, textAlign: 'center' }}>Excel has 3 sheets: Summary, Daily Summary and Meals. CSV has the meal log.</T>
      </Sheet>
      <BottomNav active={tab} onChange={onTab} />
    </View>
  );
}
