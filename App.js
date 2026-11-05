import { PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, Avatar, BottomNav, C, Card, CTA, HeaderCtx, Icon, Row, Scroll, T } from './src/components/kit';
import { playNotify } from './src/lib/sounds';
import Analytics from './src/screens/Analytics';
import Dashboard from './src/screens/Dashboard';
import { GoalHit, Overdraft, QuickAdd } from './src/screens/Dialogs';
import Login from './src/screens/Login';
import Recipes from './src/screens/Recipes';
import { SignUp1, SignUp2 } from './src/screens/SignUp';
import SplashScreen from './src/screens/SplashScreen';

// demo account from the design (Login: alex@example.com / 1412)
const DEMO = { name: 'Alex', email: 'alex@example.com', password: '1412', goal: 2200 };
const DEMO_MEALS = [
  { id: 1, meal: 'Breakfast', name: 'Oatmeal with Berries & Whey', kcal: 420, carbs: 60, protein: 25, fats: 10 },
  { id: 2, meal: 'Lunch', name: 'Grilled Salmon Bowl & Quinoa', kcal: 680, carbs: 75, protein: 55, fats: 20 },
  { id: 3, meal: 'Snack', name: 'Greek Yogurt & Almonds', kcal: 350, carbs: 30, protein: 30, fats: 15 },
];

const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// streak = consecutive days (ending today, or yesterday) with at least one logged meal
const calcStreak = (days) => {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(dayKey(d))) { n += 1; d.setDate(d.getDate() - 1); }
  return n;
};

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <SafeAreaView edges={['top']} pointerEvents="box-none" style={{ position: 'absolute', top: 8, left: 0, right: 0, zIndex: 50 }}>
      <Row style={{ marginHorizontal: 16, padding: 12, borderRadius: 16, backgroundColor: '#1a1c3e', borderWidth: 1, borderColor: 'rgba(121,209,255,0.4)', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, elevation: 12 }}>
        <Icon n="check_circle" s={22} c={C.primary} />
        <View style={{ flex: 1, marginLeft: 10 }}><T w="bold" s={13}>{toast.title}</T><T s={11} c={C.onSurfaceVariant}>{toast.body}</T></View>
        <Pressable onPress={onClose} hitSlop={10}><Icon n="close" s={18} c={C.outline} /></Pressable>
      </Row>
    </SafeAreaView>
  );
}

function Profile({ user, goal, photo, onPick, onRemovePhoto, tab, onTab, onSignOut, onPreviewOverdraft, onPreviewGoal }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: C.bg }}><AppHeader /></SafeAreaView>
      <Scroll>
        <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 20 }}>
          <Avatar size={96} uri={photo} onPress={onPick} badge />
          <Pressable onPress={onPick} hitSlop={8} style={{ marginTop: 10 }}><T w="semibold" s={12} c={C.primary}>{photo ? 'Change photo' : 'Add profile photo'}</T></Pressable>
          {photo ? <Pressable onPress={onRemovePhoto} hitSlop={8} style={{ marginTop: 4 }}><T s={11} c={C.outline}>Remove photo</T></Pressable> : null}
          <T w="extrabold" s={24} style={{ marginTop: 12 }}>{user.name}</T>
          <T s={13} c={C.onSurfaceVariant}>{user.email}</T>
        </View>
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Row style={{ justifyContent: 'space-between' }}><T s={13} c={C.onSurfaceVariant}>Daily calorie goal</T><T w="bold" s={14} c={C.primary}>{goal.toLocaleString('en-US')} kcal</T></Row>
        </Card>
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <T w="bold" s={13} style={{ marginBottom: 10 }}>Preview dialogs</T>
          <CTA tone="ghost" title="Calorie Overdraft" icon="warning" onPress={onPreviewOverdraft} style={{ marginBottom: 10 }} />
          <CTA tone="ghost" title="Daily Goal Hit" icon="military_tech" onPress={onPreviewGoal} />
        </Card>
        <CTA tone="ghost" title="Sign Out" icon="logout" onPress={onSignOut} />
      </Scroll>
      <BottomNav active={tab} onChange={onTab} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold });
  const [screen, setScreen] = useState('welcome'); // welcome | login | signup1 | signup2 | app
  const [tab, setTab] = useState('Log');
  const [users, setUsers] = useState([DEMO]);
  const [user, setUser] = useState(DEMO);
  const [draft, setDraft] = useState({});
  const [meals, setMeals] = useState(DEMO_MEALS);
  const [water, setWater] = useState(1800);
  const [toast, setToast] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [activeDays, setActiveDays] = useState([]); // days on which a meal was logged
  const [seen, setSeen] = useState([]); // notification ids already opened
  const [quick, setQuick] = useState(false);
  const [pending, setPending] = useState(null);
  const [goalHit, setGoalHit] = useState(false);
  const [goalDemo, setGoalDemo] = useState(false);
  const goalShown = useRef(false);
  const timer = useRef(null);

  const goal = user.goal || 2200;
  const consumed = meals.reduce((n, m) => n + m.kcal, 0);
  const split = user.profile?.macros || { c: 40, p: 30, f: 30 };
  const proteinLeft = (goal * split.p) / 400 - meals.reduce((n, m) => n + (m.protein || 0), 0);

  const streak = calcStreak(activeDays);
  const notifs = [
    streak > 0
      ? { id: `streak-${streak}`, icon: 'local_fire_department', title: `${streak}-day streak`, body: 'Great job! Log a meal tomorrow to keep it going.' }
      : { id: 'streak-0', icon: 'local_fire_department', title: 'Start your streak', body: 'Log a meal today to begin your daily streak.' },
    ...(meals.length === 0 ? [{ id: 'first-meal', icon: 'restaurant', title: 'No meals logged yet', body: 'Use Quick Add or browse Recipes to log your first meal.' }] : []),
    ...(water < 1000 ? [{ id: 'water-low', icon: 'water_drop', title: 'Stay hydrated', body: `You've logged ${(water / 1000).toFixed(1)}L of 2.5L today.` }] : []),
    ...(consumed > goal ? [{ id: 'over-goal', icon: 'warning', tone: 'warn', title: 'Over your target', body: `You're ${Math.round(consumed - goal).toLocaleString('en-US')} kcal above today's goal.` }] : []),
    { id: 'photo', icon: 'person', title: 'Make it yours', body: 'Open Profile to add a profile photo.' },
  ];
  const unread = notifs.filter((n) => !seen.includes(n.id)).length;
  // chime whenever a new notification lands on the bell
  const prevUnread = useRef(unread);
  useEffect(() => { if (screen === 'app' && unread > prevUnread.current) playNotify(); prevUnread.current = unread; }, [unread, screen]);
  const headerCtx = { streak, notifs, unread, onOpenNotifs: () => setSeen(notifs.map((n) => n.id)) };

  const say = (title, body) => {
    playNotify();
    setToast({ title, body });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const pickPhoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!r.canceled && r.assets && r.assets[0]) { setPhoto(r.assets[0].uri); say('Photo updated', 'Your profile picture was changed.'); }
  };

  // ----- auth -----
  const login = (email, pw) => {
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === pw);
    if (!u) return false;
    setUser(u); setPhoto(null);
    setMeals([]);
    setWater(0);
    setActiveDays([]);
    setSeen([]);
    goalShown.current = false;
    setTab('Log');
    setScreen('app');
    return true;
  };
  const socialLogin = (provider, mail, fullName, avatar) => {
    const email = mail.trim().toLowerCase();
    let u = users.find((x) => x.email.toLowerCase() === email);
    if (!u) {
      const nm = (fullName || email.split('@')[0]).replace(/[._-]+/g, ' ');
      u = { name: nm.split(' ')[0].charAt(0).toUpperCase() + nm.split(' ')[0].slice(1), email, password: '', goal: 2200, provider };
      setUsers((x) => [...x, u]);
    }
    setUser(u); setPhoto(avatar || null); setMeals([]); setWater(0); setActiveDays([]); setSeen([]); goalShown.current = false; setTab('Log'); setScreen('app');
  };
  const register = (d1, d2) => {
    const u = { name: (d1.name || 'Friend').trim().split(' ')[0], email: d1.email || 'you@example.com', password: d1.password || '', goal: d1.goal || 2200, profile: d2 };
    setUsers((x) => [...x, u]);
    setUser(u); setPhoto(null); setActiveDays([]); setSeen([]); setMeals([]); setWater(0); goalShown.current = false; setTab('Log'); setScreen('app');
  };

  // ----- logging -----
  const commit = (m, msg) => {
    const total = consumed + m.kcal;
    setMeals((x) => [...x, { id: Date.now() + Math.random(), ...m }]);
    const key = dayKey();
    const isNewDay = !activeDays.includes(key);
    const nextDays = isNewDay ? [...activeDays, key] : activeDays;
    if (isNewDay) setActiveDays(nextDays);
    const extra = isNewDay ? ` 🔥 ${calcStreak(nextDays)}-day streak!` : '';
    say(msg ? msg[0] : 'Action confirmed', (msg ? msg[1] : 'Update saved successfully.') + extra);
    if (!goalShown.current && total >= goal * 0.95 && total <= goal) {
      goalShown.current = true;
      setTimeout(() => setGoalHit(true), 500);
    }
  };
  const attempt = (m) => {
    if (consumed + m.kcal > goal) { setTimeout(() => setPending(m), 350); return; }
    commit(m);
  };
  const settle = (pick) => {
    const over = consumed + pending.kcal - goal;
    const msg = pick === 'borrow' ? ['Meal logged', `Tomorrow's target set to ${(goal - over).toLocaleString('en-US')} kcal.`]
      : pick === 'burn' ? ['Meal logged', 'Rest day burn credit of 250 kcal applied.'] : ['Meal logged', 'Surplus logged. Baseline resets tomorrow.'];
    commit(pending, msg);
    setPending(null);
  };
  const adjust = () => {
    const k = 0.75;
    const p = { ...pending, kcal: Math.round(pending.kcal * k), carbs: (pending.carbs || 0) * k, protein: (pending.protein || 0) * k, fats: (pending.fats || 0) * k, sub: '0.75 serving' };
    if (consumed + p.kcal <= goal) { setPending(null); commit(p, ['Portion adjusted', 'Logged at 75% to stay within your target.']); } else setPending(p);
  };

  if (!fontsLoaded) return null;

  let body;
  if (screen === 'welcome') body = <SplashScreen onStart={() => setScreen('signup1')} onLogin={() => setScreen('login')} />;
  else if (screen === 'login') body = <Login onLogin={login} onSocial={socialLogin} onSignUp={() => setScreen('signup1')} />;
  else if (screen === 'signup1') body = <SignUp1 draft={draft} onBack={() => setScreen('welcome')} onSignIn={() => setScreen('login')} onNext={(d) => { setDraft(d); setScreen('signup2'); }} />;
  else if (screen === 'signup2') body = <SignUp2 draft={draft.step2} onBack={() => setScreen('signup1')} onComplete={(d2) => register(draft, d2)} onSkip={() => register(draft, {})} />;
  else {
    const common = { tab, onTab: setTab };
    body = (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {tab === 'Log' && <Dashboard {...common} split={split} name={user.name} goal={goal} meals={meals} water={water}
          onAddWater={(ml) => { setWater((w) => w + ml); say('Action confirmed', 'Update saved successfully.'); }}
          onLogMeal={attempt} onQuickAdd={() => setQuick(true)} />}
        {tab === 'Recipes' && <Recipes {...common} remaining={Math.max(0, goal - consumed)} proteinLeft={proteinLeft} onAddRecipe={attempt} />}
        {tab === 'Analytics' && <Analytics {...common} split={split} meals={meals} goal={goal} water={water} weight={+user.profile?.weight || null} targetWeight={+user.profile?.target || null} />}
        {tab === 'Profile' && <Profile {...common} user={user} goal={goal} photo={photo} onPick={pickPhoto} onRemovePhoto={() => setPhoto(null)} onSignOut={() => setScreen('login')}
          onPreviewOverdraft={() => setPending({ meal: 'Snack', name: 'Late Night Ramen Bowl', kcal: Math.max(goal - consumed, 0) + 180, carbs: 72, protein: 24, fats: 22, sub: 'Tonkotsu Broth • 1 serving (480g)' })}
          onPreviewGoal={() => { setGoalDemo(true); setGoalHit(true); }} />}
        <QuickAdd visible={quick} consumed={consumed} goal={goal} onClose={() => setQuick(false)} onAdd={(m) => { setQuick(false); attempt(m); }} />
        <Overdraft visible={!!pending} pending={pending} consumed={consumed} goal={goal} onConfirm={settle} onAdjust={adjust} onCancel={() => setPending(null)} />
        <GoalHit visible={goalHit} consumed={goalDemo ? Math.round(goal * 0.98) : consumed} goal={goal}
          streak={goalDemo ? Math.max(streak, 1) : streak} activeDays={goalDemo ? [...activeDays, dayKey()] : activeDays}
          onDone={() => { setGoalHit(false); setGoalDemo(false); say('Check-in saved', 'Nice work hitting your goal today.'); }}
          onReview={() => { setGoalHit(false); setGoalDemo(false); setTab('Log'); }} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <HeaderCtx.Provider value={headerCtx}>{body}</HeaderCtx.Provider>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </SafeAreaProvider>
  );
}