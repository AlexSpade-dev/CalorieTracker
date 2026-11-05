import { PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, Avatar, BottomNav, C, Card, CTA, Icon, Row, Scroll, T } from './src/components/kit';
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

function Profile({ user, goal, photo, onPick, onRemovePhoto, tab, onTab, onSignOut }) {
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
  const [quick, setQuick] = useState(false);
  const [pending, setPending] = useState(null);
  const [goalHit, setGoalHit] = useState(false);
  const goalShown = useRef(false);
  const timer = useRef(null);

  const goal = user.goal || 2200;
  const consumed = meals.reduce((n, m) => n + m.kcal, 0);
  const proteinLeft = (goal * 0.3) / 4 - meals.reduce((n, m) => n + (m.protein || 0), 0);

  const say = (title, body) => {
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
    setMeals(u === DEMO ? DEMO_MEALS : []);
    setWater(u === DEMO ? 1800 : 0);
    goalShown.current = false;
    setTab('Log');
    setScreen('app');
    return true;
  };
  const register = (d1, d2) => {
    const u = { name: (d1.name || 'Friend').trim().split(' ')[0], email: d1.email || 'you@example.com', password: d1.password || '', goal: d1.goal || 2200, profile: d2 };
    setUsers((x) => [...x, u]);
    setUser(u); setPhoto(null); setMeals([]); setWater(0); goalShown.current = false; setTab('Log'); setScreen('app');
  };

  // ----- logging -----
  const commit = (m, msg) => {
    const total = consumed + m.kcal;
    setMeals((x) => [...x, { id: Date.now() + Math.random(), ...m }]);
    say(msg ? msg[0] : 'Action confirmed', msg ? msg[1] : 'Update saved successfully.');
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
  else if (screen === 'login') body = <Login onLogin={login} onSignUp={() => setScreen('signup1')} />;
  else if (screen === 'signup1') body = <SignUp1 draft={draft} onBack={() => setScreen('welcome')} onSignIn={() => setScreen('login')} onNext={(d) => { setDraft(d); setScreen('signup2'); }} />;
  else if (screen === 'signup2') body = <SignUp2 draft={draft.step2} onBack={() => setScreen('signup1')} onComplete={(d2) => register(draft, d2)} onSkip={() => register(draft, {})} />;
  else {
    const common = { tab, onTab: setTab };
    body = (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {tab === 'Log' && <Dashboard {...common} name={user.name} goal={goal} meals={meals} water={water}
          onAddWater={(ml) => { setWater((w) => w + ml); say('Action confirmed', 'Update saved successfully.'); }}
          onLogMeal={attempt} onQuickAdd={() => setQuick(true)} />}
        {tab === 'Recipes' && <Recipes {...common} remaining={Math.max(0, goal - consumed)} proteinLeft={proteinLeft} onAddRecipe={attempt} />}
        {tab === 'Analytics' && <Analytics {...common} meals={meals} goal={goal} water={water} weight={+user.profile?.weight || null} targetWeight={+user.profile?.target || null} />}
        {tab === 'Profile' && <Profile {...common} user={user} goal={goal} photo={photo} onPick={pickPhoto} onRemovePhoto={() => setPhoto(null)} onSignOut={() => setScreen('login')} />}
        <QuickAdd visible={quick} consumed={consumed} goal={goal} onClose={() => setQuick(false)} onAdd={(m) => { setQuick(false); attempt(m); }} />
        <Overdraft visible={!!pending} pending={pending} consumed={consumed} goal={goal} onConfirm={settle} onAdjust={adjust} onCancel={() => setPending(null)} />
        <GoalHit visible={goalHit} consumed={consumed} goal={goal} onDone={() => { setGoalHit(false); say('Check-in saved', 'Nice work hitting your goal today.'); }} onReview={() => { setGoalHit(false); setTab('Log'); }} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {body}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </SafeAreaProvider>
  );
}
