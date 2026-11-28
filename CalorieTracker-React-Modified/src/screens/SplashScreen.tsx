import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { AppText } from '../components/AppText';
import { COLORS } from '../theme/theme';

const STATUSES = [
  'Synchronizing biological telemetry...',
  'Calibrating thermodynamic expenditure...',
  'Locking oceanic macro vectors...',
  'Precision model calibrated.',
];
const LOAD_MS = 2500;

function useLoop(duration: number, reverse = false) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(
      Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })
    );
    a.start();
    return () => a.stop();
  }, []);
  return v.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'],
  });
}

function Glow({ id, size, color, opacity, style }: {
  id: string; size: number; color: string; opacity: number; style?: any;
}) {
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

export default function SplashScreen({ onStart, onLogin }: {
  onStart: () => void; onLogin: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [pct, setPct] = useState(0);
  const ready = pct >= 100;

  const spinSlow = useLoop(14000);
  const spinRev = useLoop(22000, true);
  const spinSync = useLoop(1000);

  const pulse = useRef(new Animated.Value(0)).current;
  const ping = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const p = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ]));
    const q = Animated.loop(Animated.sequence([
      Animated.timing(ping, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(ping, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]));
    p.start(); q.start();
    return () => { p.stop(); q.stop(); };
  }, []);

  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => {
      const next = Math.min(100, Math.round(((Date.now() - start) / LOAD_MS) * 100));
      setPct(next);
      if (next >= 100) clearInterval(t);
    }, 40);
    return () => clearInterval(t);
  }, []);

  const statusIdx = ready ? 3 : Math.min(2, Math.floor(pct / 34));
  const haloStyle: ViewStyle & any = {
    top: '25%', left: '50%', marginLeft: -170, marginTop: -170,
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
  };

  return (
    <View style={s.outer}>
      <View style={s.frame}>
        {/* Background glows */}
        <Glow id="haloA" size={340} color={COLORS.secondaryContainer} opacity={0.5} style={haloStyle} />
        <Glow id="haloB" size={220} color={COLORS.primary} opacity={0.3}
          style={{ top: '33%', left: '50%', marginLeft: -110, marginTop: -110 }} />
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(8,10,44,0.4)', 'rgba(22,24,58,0.2)', COLORS.surfaceLowest]}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={[s.header, { paddingTop: insets.top + 24 }]}>
          <View style={s.row}>
            <View style={s.dotWrap}>
              <Animated.View style={[s.dotPing, {
                opacity: ping.interpolate({ inputRange: [0, 1], outputRange: [0.75, 0] }),
                transform: [{ scale: ping.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) }],
              }]} />
              <View style={s.dot} />
            </View>
            <AppText weight="semibold" style={s.sysOnline}>SYSTEM ONLINE</AppText>
          </View>
          <View style={s.pill}>
            <MaterialIcons name="lock" size={14} color={COLORS.primary} />
            <AppText weight="semibold" style={s.pillText}>Core Encrypted</AppText>
          </View>
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.emblem}>
            <Animated.View style={[s.orbit, { transform: [{ rotate: spinSlow }] }]}>
              <View style={s.orbitDot} />
            </Animated.View>
            <Animated.View style={[s.orbitDashed, { transform: [{ rotate: spinRev }] }]} />
            <View style={s.innerDisc} />
            <View style={s.core}>
              <Svg width={56} height={40} viewBox="0 0 70 40" fill="none">
                <Path
                  d="M 0 20 L 18 20 L 26 6 L 35 34 L 44 14 L 52 24 L 58 20 L 70 20"
                  stroke={COLORS.primary} strokeWidth={2.75}
                  strokeLinecap="round" strokeLinejoin="round"
                />
                <Circle cx={35} cy={34} r={2.5} fill={COLORS.primary} />
              </Svg>
              <AppText weight="semibold" style={s.bio}>BIO-METRIC</AppText>
            </View>
          </View>

          <View style={s.titleRow}>
            <AppText weight="extrabold" style={s.title}>CalorieTracker</AppText>
            <AppText weight="bold" style={[s.title, s.plus]}>+</AppText>
          </View>
          <AppText style={s.subtitle}>
            Master your nutrition with scientific clarity & metabolic telemetry.
          </AppText>

          {/* Loading card */}
          <View style={s.loadCard}>
            <View style={s.loadTop}>
              <View style={[s.row, { flex: 1 }]}>
                {ready ? (
                  <MaterialIcons name="check-circle" size={16} color={COLORS.primary} />
                ) : (
                  <Animated.View style={{ transform: [{ rotate: spinSync }] }}>
                    <MaterialIcons name="sync" size={16} color={COLORS.primary} />
                  </Animated.View>
                )}
                <AppText weight="semibold" style={s.loadText} numberOfLines={1}>
                  {STATUSES[statusIdx]}
                </AppText>
              </View>
              <AppText weight="semibold" style={s.loadText}>{pct}%</AppText>
            </View>
            <View style={s.track}>
              <LinearGradient
                colors={[COLORS.secondaryContainer, COLORS.primaryContainer, COLORS.primary]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.fill, { width: `${pct}%` }]}
              />
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={[s.footer, { paddingBottom: insets.bottom + 24 }]}>
          <Pressable
            disabled={!ready}
            onPress={onStart}
            style={({ pressed }) => [
              s.cta,
              { opacity: ready ? 1 : 0.5, backgroundColor: pressed ? COLORS.primary : COLORS.primaryContainer,
                transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <AppText weight="semibold" style={s.ctaText}>Get Started</AppText>
            <MaterialIcons name="arrow-forward" size={20} color={COLORS.onPrimaryContainer} />
          </Pressable>
          <View style={[s.row, { justifyContent: 'center', marginTop: 12 }]}>
            <AppText style={s.haveAcc}>Have an Account?</AppText>
            <Pressable disabled={!ready} onPress={onLogin} style={{ opacity: ready ? 1 : 0.5 }}>
              <AppText weight="semibold" style={s.login}>Log In</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  outer: { flex: 1, backgroundColor: COLORS.surfaceLowest },
  frame: { flex: 1, width: '100%', maxWidth: 420, alignSelf: 'center',
    backgroundColor: COLORS.surfaceLowest, overflow: 'hidden', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center' },
  header: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dotWrap: { width: 8, height: 8, marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  dotPing: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  sysOnline: { color: COLORS.secondary, fontSize: 11, letterSpacing: 1.1 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 9999, backgroundColor: 'rgba(26,28,62,0.6)', borderWidth: 1, borderColor: 'rgba(62,72,79,0.3)' },
  pillText: { color: COLORS.onSurfaceVariant, fontSize: 11 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  emblem: { width: 176, height: 176, marginBottom: 24, alignItems: 'center', justifyContent: 'center' },
  orbit: { position: 'absolute', width: 176, height: 176, borderRadius: 88, borderWidth: 1,
    borderColor: 'rgba(1,94,124,0.4)', alignItems: 'center' },
  orbitDot: { position: 'absolute', top: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  orbitDashed: { position: 'absolute', width: 152, height: 152, borderRadius: 76, borderWidth: 1,
    borderStyle: 'dashed', borderColor: 'rgba(62,72,79,0.4)' },
  innerDisc: { position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(22,24,58,0.7)', borderWidth: 1, borderColor: 'rgba(121,209,255,0.2)',
    shadowColor: COLORS.primary, shadowOpacity: 0.15, shadowRadius: 30, shadowOffset: { width: 0, height: 0 } },
  core: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1, borderColor: 'rgba(121,209,255,0.3)', alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primaryContainer, shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 4 } },
  bio: { color: COLORS.primaryFixedDim, fontSize: 9, letterSpacing: 1.8, marginTop: 4, opacity: 0.85 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 36, lineHeight: 40, letterSpacing: -0.7, color: COLORS.text },
  plus: { color: COLORS.primary, marginLeft: 2,
    textShadowColor: 'rgba(121,209,255,0.7)', textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 } },
  subtitle: { marginTop: 8, maxWidth: 280, textAlign: 'center', fontSize: 14, lineHeight: 23,
    color: COLORS.onSurfaceVariant },
  loadCard: { marginTop: 32, width: '100%', maxWidth: 300, padding: 12, borderRadius: 12,
    backgroundColor: 'rgba(22,24,58,0.9)', borderWidth: 1, borderColor: 'rgba(62,72,79,0.3)' },
  loadTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  loadText: { color: COLORS.primary, fontSize: 11, marginLeft: 8, flexShrink: 1 },
  track: { height: 6, borderRadius: 9999, backgroundColor: COLORS.surfaceLowest, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 9999 },
  footer: { paddingHorizontal: 16 },
  cta: { height: 48, borderRadius: 9999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, shadowColor: COLORS.primaryContainer, shadowOpacity: 0.35, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  ctaText: { color: COLORS.onPrimaryContainer, fontSize: 18, letterSpacing: 0.4 },
  haveAcc: { color: COLORS.onSurfaceVariant, fontSize: 14 },
  login: { color: COLORS.primary, fontSize: 18, marginLeft: 4, textDecorationLine: 'underline' },
});