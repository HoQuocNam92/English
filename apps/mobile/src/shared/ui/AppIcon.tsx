import React from 'react';
import { MaterialIcons as NativeMaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';
import type { ViewStyle, StyleProp } from 'react-native';
import nodes from './icon-nodes.json';

// Generated from the web's Lucide mapping by scripts/sync-mobile-icons.cjs.
const shapes = { circle: Circle, ellipse: Ellipse, line: Line, path: Path, polygon: Polygon, polyline: Polyline, rect: Rect };
type Node = [keyof typeof shapes, Record<string, string>];
const icons = nodes as unknown as Record<string, Node[]>;
export const hasAppIcon = (name: string) => Boolean(icons[name.replaceAll('_', '-')]);
function Icon({ name, size = 24, color = '#000', style, ...props }: Omit<React.ComponentProps<typeof NativeMaterialIcons>, 'name'> & { name: string }) {
  const geometry = icons[name.replaceAll('_', '-')];
  if (!geometry) return <NativeMaterialIcons {...props} name={name as keyof typeof NativeMaterialIcons.glyphMap} size={size} color={color} style={style} />;
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style as StyleProp<ViewStyle>} accessibilityLabel={props.accessibilityLabel} accessible={props.accessible} testID={props.testID} onPress={props.onPress}>
    {geometry.map(([tag, attributes]) => { const Shape = shapes[tag]; const { key, ...values } = attributes; return <Shape key={key} {...values} />; })}
  </Svg>;
}
export const MaterialIcons = Object.assign(Icon, { glyphMap: NativeMaterialIcons.glyphMap as Record<string, number> });
