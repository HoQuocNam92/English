import type { TextStyle } from 'react-native';

// Use static instances of the web's Inter so Android can select each weight.
export function interFontStyle(weight: TextStyle['fontWeight'] = '400', family?: string): TextStyle {
  if (family && family !== 'Inter') return {};
  const numeric = weight === 'bold' ? 700 : weight === 'normal' ? 400 : Number(weight);
  const resolved = Math.min(900, Math.max(400, Math.round(numeric / 100) * 100));
  return { fontFamily: `Inter-${resolved}`, fontWeight: 'normal' };
}
