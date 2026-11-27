import { Text, TextProps } from 'react-native';
import { COLORS, FONTS } from '../theme/theme';

type Weight = 'regular' | 'semibold' | 'bold' | 'extrabold';

export function AppText({
  weight = 'regular',
  style,
  ...props
}: TextProps & { weight?: Weight }) {
  return (
    <Text
      {...props}
      style={[
        { fontFamily: FONTS[weight], color: COLORS.text, fontVariant: ['tabular-nums'] },
        style,
      ]}
    />
  );
}