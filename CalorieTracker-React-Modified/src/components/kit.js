import { MaterialIcons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, LinearGradient as SG, Stop } from 'react-native-svg';
import { COLORS as C } from '../theme/theme';
import { AppText } from './AppText';

// Material Symbols names that do not exist in MaterialIcons get a close substitute
const ALIAS = { vital_signs: 'monitor_heart', sprint: 'directions_run', shield_with_heart: 'health_and_safety', calendar_clock: 'event', barcode_scanner: 'qr_code_scanner', monitoring: 'show_chart' };
export const Icon = ({ n, s = 20, c = C.primary, style }) => (
  <MaterialIcons name={(ALIAS[n] || n).replace(/_/g, '-')} size={s} color={c} style={style} />
);

// text shorthand: w = regular|semibold|bold|extrabold
export const T = ({ w = 'regular', s = 14, c = C.text, style, ...p }) => (
  <AppText weight={w} style={[{ fontSize: s, color: c }, style]} {...p} />
);

export const Row = ({ style, children, ...p }) => <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]} {...p}>{children}</View>;

// soft radial glow (replaces CSS blur)
export function Glow({ size, color = C.primary, opacity = 0.2, style }) {
  const id = 'g' + Math.abs(Math.round(size * 7 + opacity * 100)) + color.replace('#', '');
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

// full-screen deep-ocean background used by auth screens
export const Backdrop = ({ children, style }) => (
  <View style={[{ flex: 1, backgroundColor: C.surfaceLowest }, style]}>
    <Glow size={420} color={C.secondaryContainer} opacity={0.35} style={{ top: -120, alignSelf: 'center' }} />
    <Glow size={260} color={C.primary} opacity={0.14} style={{ top: -10, alignSelf: 'center' }} />
    {children}
  </View>
);

export const Card = ({ children, style }) => (
  <View style={[{ borderRadius: 24, borderWidth: 1, borderColor: 'rgba(62,72,79,0.45)', backgroundColor: C.surface, overflow: 'hidden' }, style]}>{children}</View>
);

export const Pill = ({ children, style, tone = 'primary' }) => (
  <View style={[{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 1,
    borderColor: tone === 'primary' ? 'rgba(121,209,255,0.35)' : 'rgba(62,72,79,0.5)',
    backgroundColor: tone === 'primary' ? 'rgba(121,209,255,0.08)' : 'rgba(26,28,62,0.7)' }, style]}>{children}</View>
);

export const Bar = ({ pct, h = 6, color = C.primaryContainer, track = C.surfaceLowest, style }) => (
  <View style={[{ height: h, borderRadius: h / 2, backgroundColor: track, overflow: 'hidden' }, style]}>
    <View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: h, borderRadius: h / 2, backgroundColor: color }} />
  </View>
);

export function CTA({ title, icon = 'arrow_forward', onPress, style, disabled, tone = 'primary' }) {
  return (
    <Pressable disabled={disabled} onPress={onPress}
      style={({ pressed }) => [{
        height: 48, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
        backgroundColor: tone === 'primary' ? C.primaryContainer : 'rgba(26,28,62,0.9)',
        borderWidth: tone === 'primary' ? 0 : 1, borderColor: 'rgba(62,72,79,0.6)',
        opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
        shadowColor: C.primaryContainer, shadowOpacity: tone === 'primary' ? 0.5 : 0, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: tone === 'primary' ? 8 : 0,
      }, style]}>
      <T w="semibold" s={16} numberOfLines={1} c={tone === 'primary' ? C.onPrimaryContainer : C.text} style={{ letterSpacing: 0.3, flexShrink: 1 }}>{title}</T>
      {icon ? <Icon n={icon} s={19} c={tone === 'primary' ? C.onPrimaryContainer : C.text} style={{ marginLeft: 8 }} /> : null}
    </Pressable>
  );
}

// Modal wrapper. mode="sheet" = bottom sheet, mode="center" = centered dialog
export function Sheet({ visible, onClose, children, mode = 'sheet', style, handle = true }) {
  const insets = useSafeAreaInsets();
  const center = mode === 'center';
  return (
    <Modal visible={visible} transparent animationType={center ? 'fade' : 'slide'} statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(4,5,22,0.78)', justifyContent: center ? 'center' : 'flex-end', padding: center ? 20 : 0 }}>
        <Pressable onPress={() => {}} style={[center
          ? { borderRadius: 24, backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(62,72,79,0.5)', padding: 20 }
          : { borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: C.surface, borderTopWidth: 1, borderColor: 'rgba(62,72,79,0.5)', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 + insets.bottom },
          style]}>
          {!center && handle ? <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(136,146,154,0.45)', marginBottom: 14 }} /> : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const IconBox = ({ n, size = 40, s = 20, c = C.primary, bg = 'rgba(121,209,255,0.1)', r = 12, style }) => (
  <View style={[{ width: size, height: size, borderRadius: r, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }, style]}><Icon n={n} s={s} c={c} /></View>
);

// circular progress ring with centered content
export function Ring({ size = 168, stroke = 12, pct = 70, children, colors = [C.primary, C.primaryContainer], track = 'rgba(62,72,79,0.4)' }) {
  const r = (size - stroke) / 2; const circ = 2 * Math.PI * r; const p = Math.max(0, Math.min(100, pct));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs><SG id="ringg" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={colors[0]} /><Stop offset="1" stopColor={colors[1]} /></SG></Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="url(#ringg)" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${(circ * p) / 100} ${circ}`} />
      </Svg>
      {children}
    </View>
  );
}

export const Avatar = ({ size = 40, uri, onPress, badge }) => (
  <Pressable disabled={!onPress} onPress={onPress} style={{ width: size, height: size }}>
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: 'rgba(121,209,255,0.5)', overflow: 'hidden', backgroundColor: C.surfaceHigh, alignItems: 'center', justifyContent: 'center' }}>
      <Icon n="person" s={size * 0.55} c={C.secondary} />
      {uri ? <Image source={{ uri }} style={{ position: 'absolute', width: size, height: size }} /> : null}
    </View>
    {badge ? (
      <View style={{ position: 'absolute', right: -2, bottom: -2, width: size * 0.32, height: size * 0.32, borderRadius: size * 0.16, backgroundColor: C.primaryContainer, borderWidth: 2, borderColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon n="photo_camera" s={size * 0.17} c={C.onPrimaryContainer} />
      </View>
    ) : null}
  </Pressable>
);

// selectable card with a glow ring (solid fill, so no "box in a box" on Android)
export function Choice({ on, onPress, children, style, radius = 14 }) {
  return (
    <Pressable onPress={onPress} style={[{ marginBottom: 10 }, style]}>
      {on && <View pointerEvents="none" style={{ position: 'absolute', top: -6, left: -6, right: -6, bottom: -6, borderRadius: radius + 6, backgroundColor: 'rgba(121,209,255,0.07)' }} />}
      {on && <View pointerEvents="none" style={{ position: 'absolute', top: -3, left: -3, right: -3, bottom: -3, borderRadius: radius + 3, borderWidth: 3, borderColor: 'rgba(121,209,255,0.22)' }} />}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: radius, borderWidth: on ? 1.5 : 1, borderColor: on ? C.primary : 'rgba(62,72,79,0.55)', backgroundColor: on ? '#123a56' : C.surface, shadowColor: C.primary, shadowOpacity: on ? 0.7 : 0, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }}>
        {children}
      </View>
    </Pressable>
  );
}

// shared header data (streak + notifications) provided by App.js
export const HeaderCtx = React.createContext({ streak: 0, notifs: [], unread: 0, onOpenNotifs: () => {} });

// app header used by Log / Analytics / Recipes
export function AppHeader({ recipes }) {
  const { streak, notifs, unread, onOpenNotifs } = useContext(HeaderCtx);
  const [open, setOpen] = useState(false);
  const show = () => { setOpen(true); onOpenNotifs && onOpenNotifs(); };
  return (
    <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: 'rgba(62,72,79,0.35)', backgroundColor: C.bg }}>
      <View>
        <T w="bold" s={20} c={C.primary} style={{ letterSpacing: -0.4 }}>CalorieTracker+</T>
        {!recipes && <Row><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary, marginRight: 5 }} /><T w="semibold" s={10} c={C.primary}>Sync Active</T></Row>}
      </View>
      <Row>
        {!recipes && (
          <Pill style={{ marginRight: 12, backgroundColor: streak ? 'rgba(1,94,124,0.45)' : 'rgba(26,28,62,0.7)', borderColor: streak ? 'rgba(121,209,255,0.3)' : 'rgba(62,72,79,0.5)' }}>
            <T w="bold" s={12} c={streak ? C.primary : C.outline}>🔥 {streak} {streak === 1 ? 'Day' : 'Days'}</T>
          </Pill>
        )}
        <Pressable onPress={show} hitSlop={10} accessibilityLabel="Notifications">
          <Icon n="notifications" s={24} c={C.text} />
          {unread > 0 && <View style={{ position: 'absolute', top: -2, right: -2, minWidth: 14, height: 14, borderRadius: 7, paddingHorizontal: 3, backgroundColor: C.error, alignItems: 'center', justifyContent: 'center' }}><T w="bold" s={9} c="#690005">{unread}</T></View>}
        </Pressable>
      </Row>

      <Sheet visible={open} onClose={() => setOpen(false)}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <T w="bold" s={20}>Notifications</T>
          <Pressable onPress={() => setOpen(false)} hitSlop={10}><Icon n="close" s={20} c={C.outline} /></Pressable>
        </Row>
        {notifs.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}><Icon n="notifications_none" s={34} c={C.outline} /><T s={13} c={C.onSurfaceVariant} style={{ marginTop: 8 }}>You're all caught up.</T></View>
        ) : notifs.map((n) => (
          <Row key={n.id} style={{ alignItems: 'flex-start', padding: 12, borderRadius: 14, backgroundColor: C.bg, borderWidth: 1, borderColor: 'rgba(62,72,79,0.45)', marginBottom: 8 }}>
            <IconBox n={n.icon} size={34} s={18} r={17} c={n.tone === 'warn' ? C.error : C.primary} bg={n.tone === 'warn' ? 'rgba(255,180,171,0.12)' : 'rgba(121,209,255,0.1)'} />
            <View style={{ flex: 1, marginLeft: 10 }}><T w="bold" s={13}>{n.title}</T><T s={11} c={C.onSurfaceVariant} style={{ marginTop: 2, lineHeight: 16 }}>{n.body}</T></View>
          </Row>
        ))}
      </Sheet>
    </Row>
  );
}

const TABS = [['Log', 'monitoring'], ['Recipes', 'menu_book'], ['Analytics', 'analytics'], ['Profile', 'person']];
export function BottomNav({ active, onChange }) {
  const insets = useSafeAreaInsets();
  return (
    <Row style={{ justifyContent: 'space-around', paddingTop: 10, paddingBottom: 8 + insets.bottom, backgroundColor: C.bg, borderTopWidth: 1, borderColor: 'rgba(62,72,79,0.4)' }}>
      {TABS.map(([name, icon]) => {
        const on = name === active;
        return (
          <Pressable key={name} onPress={() => onChange && onChange(name)} style={{ alignItems: 'center', minWidth: 64 }}>
            <Icon n={icon} s={24} c={on ? C.primary : 'rgba(136,146,154,0.9)'} />
            <T w="semibold" s={11} c={on ? C.primary : 'rgba(136,146,154,0.9)'} style={{ marginTop: 2 }}>{name}</T>
            <View style={{ width: 4, height: 4, borderRadius: 2, marginTop: 3, backgroundColor: on ? C.primary : 'transparent' }} />
          </Pressable>
        );
      })}
    </Row>
  );
}

export const Scroll = ({ children, style, contentStyle }) => (
  <ScrollView style={[{ flex: 1 }, style]} contentContainerStyle={[{ padding: 16, paddingBottom: 28 }, contentStyle]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</ScrollView>
);

export { C };
