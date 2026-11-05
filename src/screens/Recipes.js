import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, BottomNav, C, CTA, Icon, Pill, Row, Scroll, Sheet, T } from '../components/kit';
import { IMG } from '../data/images';

const border = 'rgba(62,72,79,0.45)';
export const RECIPES = [
  { id: 'r1', featured: true, name: 'Mediterranean Lemon Herb Salmon', img: IMG.featured, time: 20, kcal: 485, protein: 42, carbs: 18, fats: 18, tags: ['High Protein', 'Keto'], slot: 'Dinner', label: 'Deficit-Friendly' },
  { id: 'r2', name: 'Avocado & Poached Egg Toast', img: IMG.toast, time: 12, kcal: 340, protein: 18, carbs: 22, fats: 17, tags: ['Low Calorie (<400)', 'Quick Prep (<15m)'], slot: 'Breakfast', label: 'Breakfast' },
  { id: 'r3', name: 'Zesty Lime Chicken Quinoa', img: IMG.chicken, time: 18, kcal: 520, protein: 46, carbs: 48, fats: 14, tags: ['High Protein'], slot: 'Lunch', label: 'Lunch / Post-WOD' },
  { id: 'r4', name: 'Blueberry Chia Superfood Parfait', img: IMG.parfait, time: 5, kcal: 290, protein: 15, carbs: 32, fats: 9, tags: ['Low Calorie (<400)', 'Quick Prep (<15m)'], slot: 'Snack', label: 'Snack / Fast Fuel' },
];
const SORTS = [['default', 'Featured first'], ['kcalAsc', 'Calories: low to high'], ['kcalDesc', 'Calories: high to low'], ['protein', 'Protein: most first'], ['time', 'Prep time: quickest']];
const FILTERS = ['All', 'High Protein', 'Keto', 'Low Calorie (<400)', 'Quick Prep (<15m)', 'Vegan'];

export default function Recipes({ tab, onTab, onAddRecipe, remaining, proteinLeft }) {
  const [q, setQ] = useState('');
  const [f, setF] = useState('All');
  const [saved, setSaved] = useState({});
  const [liked, setLiked] = useState({});
  const [sort, setSort] = useState('default');
  const [sortOpen, setSortOpen] = useState(false);
  const base = RECIPES.filter((r) => (f === 'All' || r.tags.includes(f)) && r.name.toLowerCase().includes(q.trim().toLowerCase()));
  const cmp = { kcalAsc: (a, b) => a.kcal - b.kcal, kcalDesc: (a, b) => b.kcal - a.kcal, protein: (a, b) => b.protein - a.protein, time: (a, b) => a.time - b.time }[sort];
  const list = cmp ? [...base].sort(cmp) : base;
  const feat = sort === 'default' ? list.find((r) => r.featured) : null;
  const rest = feat ? list.filter((r) => !r.featured) : list;
  const add = (r) => onAddRecipe({ meal: r.slot, name: r.name, kcal: r.kcal, protein: r.protein, carbs: r.carbs, fats: r.fats });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: C.bg }}><AppHeader recipes /></SafeAreaView>
      <Scroll>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <T w="extrabold" s={28} style={{ letterSpacing: -0.6 }}>Recipe Browser</T>
            <T s={12} c={C.onSurfaceVariant} style={{ marginTop: 3 }}>Fuel your deficit with macro-aligned precision</T>
          </View>
          <Pressable onPress={() => setSortOpen(true)} accessibilityLabel="Sort recipes" style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: sort === 'default' ? C.surface : 'rgba(121,209,255,0.16)', borderWidth: 1, borderColor: sort === 'default' ? border : C.primary, alignItems: 'center', justifyContent: 'center' }}><Icon n="tune" s={18} c={C.primary} /></Pressable>
        </Row>

        <Row style={{ marginTop: 16, paddingHorizontal: 12, height: 46, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: border }}>
          <Icon n="search" s={19} c={C.outline} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search healthy recipes, ingredients..." placeholderTextColor="rgba(136,146,154,0.7)" style={{ flex: 1, color: C.text, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, marginHorizontal: 8 }} />
          <Icon n="mic" s={19} c={C.primary} />
        </Row>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14, marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {FILTERS.map((x) => { const on = f === x; return (
            <Pressable key={x} onPress={() => setF(x)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 34, borderRadius: 999, borderWidth: 1, marginRight: 8, borderColor: on ? C.primary : border, backgroundColor: on ? C.primary : C.surface }}>
              {x === 'All' && <Icon n="local_fire_department" s={14} c={on ? C.onPrimaryContainer : C.primary} style={{ marginRight: 4 }} />}
              <T w="bold" s={12} c={on ? C.onPrimaryContainer : C.onSurfaceVariant}>{x}</T>
            </Pressable>); })}
        </ScrollView>

        {feat && (
          <View style={{ marginTop: 20 }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
              <Row><Icon n="star" s={13} c={C.primary} /><T w="bold" s={10} c={C.primary} style={{ marginLeft: 5, letterSpacing: 1.1 }}>FEATURED RECIPE OF THE DAY</T></Row>
              <T w="semibold" s={11} c={C.outline}>Daily Pick</T>
            </Row>
            <View style={{ borderRadius: 24, borderWidth: 1, borderColor: border, backgroundColor: C.surface, overflow: 'hidden' }}>
              <View style={{ height: 200, backgroundColor: C.surfaceHigh }}>
                <Image source={{ uri: feat.img }} style={{ width: '100%', height: 200 }} />
                <LinearGradient colors={['rgba(13,15,50,0)', 'rgba(13,15,50,0.55)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90 }} />
                <Row style={{ position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(13,15,50,0.8)', borderWidth: 1, borderColor: 'rgba(121,209,255,0.4)' }}>
                  <Icon n="star" s={12} c={C.primary} /><T w="bold" s={10} c={C.primary} style={{ marginLeft: 4 }}>Top Chef Pick</T>
                </Row>
                <Pressable onPress={() => setSaved((s) => ({ ...s, [feat.id]: !s[feat.id] }))} style={{ position: 'absolute', top: 10, right: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(13,15,50,0.8)', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon n="bookmark" s={18} c={saved[feat.id] ? C.primary : C.text} />
                </Pressable>
              </View>
              <View style={{ padding: 16 }}>
                <T w="bold" s={20} style={{ letterSpacing: -0.3, lineHeight: 25 }}>{feat.name}</T>
                <Row style={{ marginTop: 8, flexWrap: 'wrap' }}>
                  <Icon n="schedule" s={14} c={C.outline} /><T s={11} c={C.onSurfaceVariant} style={{ marginLeft: 4, marginRight: 12 }}>{feat.time} min</T>
                  <Icon n="speed" s={14} c={C.outline} /><T s={11} c={C.onSurfaceVariant} style={{ marginLeft: 4, marginRight: 12 }}>Easy Prep</T>
                  <Pill><T w="bold" s={10} c={C.primary}>{feat.label}</T></Pill>
                </Row>
                <Row style={{ gap: 8, marginTop: 14 }}>
                  {[['Calories', feat.kcal, 'kcal'], ['Protein', feat.protein + 'g', 'P'], ['Fat', feat.fats + 'g', 'F']].map(([l, v, u]) => (
                    <View key={l} style={{ flex: 1, padding: 10, borderRadius: 12, backgroundColor: C.bg, borderWidth: 1, borderColor: border }}>
                      <T s={10} c={C.outline}>{l}</T>
                      <Row style={{ alignItems: 'baseline', marginTop: 2 }}><T w="bold" s={18}>{v}</T><T s={10} c={C.outline}> {u}</T></Row>
                    </View>
                  ))}
                </Row>
                <CTA title="Quick Log Recipe" icon="add_circle" onPress={() => add(feat)} style={{ marginTop: 14 }} />
              </View>
            </View>
          </View>
        )}

        <Row style={{ justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
          <T w="bold" s={19}>Curated Macros</T><T w="semibold" s={12} c={C.primary}>{sort === 'default' ? `${list.length} recipes` : SORTS.find((x) => x[0] === sort)[1]}</T>
        </Row>
        {rest.map((r) => (
          <Row key={r.id} style={{ alignItems: 'flex-start', padding: 12, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: border, marginBottom: 12 }}>
            <View style={{ width: 92, height: 92, borderRadius: 14, overflow: 'hidden', backgroundColor: C.surfaceHigh }}>
              <Image source={{ uri: r.img }} style={{ width: 92, height: 92 }} />
              <View style={{ position: 'absolute', left: 6, bottom: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(13,15,50,0.85)' }}><T w="bold" s={9} c={C.text}>{r.time} min</T></View>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <T w="bold" s={14} style={{ flex: 1, lineHeight: 18 }}>{r.name}</T>
                <Pressable onPress={() => setLiked((s) => ({ ...s, [r.id]: !s[r.id] }))} hitSlop={8}><Icon n="favorite" s={17} c={liked[r.id] ? '#ff7a90' : C.outline} style={{ marginLeft: 6 }} /></Pressable>
              </Row>
              <Row style={{ marginTop: 4 }}><T w="bold" s={12} c={C.primary}>{r.kcal} kcal</T><T s={11} c={C.outline}>  •  {r.protein}g P  {r.carbs}g C</T></Row>
              <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
                <T s={10} c={C.onSurfaceVariant} style={{ flex: 1 }} numberOfLines={1}>{r.label}</T>
                <Pressable onPress={() => add(r)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: C.primaryContainer }}>
                  <Icon n="add" s={13} c={C.onPrimaryContainer} /><T w="bold" s={11} c={C.onPrimaryContainer} style={{ marginLeft: 2 }}>Add to Log</T>
                </Pressable>
              </Row>
            </View>
          </Row>
        ))}
        {!list.length && <View style={{ alignItems: 'center', padding: 30 }}><Icon n="search" s={30} c={C.outline} /><T s={13} c={C.onSurfaceVariant} style={{ marginTop: 8, textAlign: 'center' }}>No recipes match “{q || f}”. Try another filter.</T></View>}

        <Row style={{ padding: 14, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: border, marginTop: 4, justifyContent: 'space-between' }}>
          <Row style={{ flex: 1 }}>
            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(121,209,255,0.1)', alignItems: 'center', justifyContent: 'center' }}><Icon n="pie_chart" s={19} c={C.primary} /></View>
            <View style={{ marginLeft: 12, flex: 1 }}><T w="bold" s={13}>Target Remaining Today</T><T s={11} c={C.onSurfaceVariant} style={{ marginTop: 2 }}>{Math.round(remaining).toLocaleString('en-US')} kcal • {Math.max(0, Math.round(proteinLeft))}g Protein left</T></View>
          </Row>
          <Pill><T w="bold" s={10} c={C.primary}>In Range</T></Pill>
        </Row>
      </Scroll>
      <Sheet visible={sortOpen} onClose={() => setSortOpen(false)}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <T w="bold" s={20}>Sort recipes</T>
          <Pressable onPress={() => setSortOpen(false)} hitSlop={10}><Icon n="close" s={20} c={C.outline} /></Pressable>
        </Row>
        {SORTS.map(([id, label]) => { const on = sort === id; return (
          <Pressable key={id} onPress={() => { setSort(id); setSortOpen(false); }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: on ? C.primary : border, backgroundColor: on ? '#123a56' : C.bg }}>
            <T w={on ? 'bold' : 'semibold'} s={14} c={on ? C.primary : C.text}>{label}</T>
            {on && <Icon n="check" s={18} c={C.primary} />}
          </Pressable>); })}
      </Sheet>
      <BottomNav active={tab} onChange={onTab} />
    </View>
  );
}
