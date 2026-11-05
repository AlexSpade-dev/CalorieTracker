import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View, ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '../theme/theme';
import { AppText } from './AppText';

export function PrimaryButton({ title, onPress, style }: {
  title: string; onPress?: () => void; style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress?.(); }}
      style={({ pressed }) => [{
        height: 52, borderRadius: RADIUS.pill, alignItems: 'center', justifyContent: 'center',
        backgroundColor: pressed ? COLORS.secondary : COLORS.primaryStrong,
        shadowColor: COLORS.primaryStrong, shadowOpacity: 0.35, shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 }, elevation: 6,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      }, style]}
    >
      <AppText weight="bold" style={{ color: COLORS.white, fontSize: 15 }}>{title}</AppText>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{
      borderRadius: RADIUS.card, borderWidth: 1, borderColor: COLORS.border,
      backgroundColor: COLORS.surface2, overflow: 'hidden', marginBottom: 14,
    }, style]}>
      <LinearGradient
        colors={['rgba(121,209,255,0.08)', 'rgba(26,28,62,0)']}
        style={{ padding: 20 }}
      >
        {children}
      </LinearGradient>
    </View>
  );
}