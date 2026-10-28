// SDK 57's react-native-svg types use legacy React component declarations
// that are incompatible with React 19's JSX checks.
declare module 'react-native-svg' {
  import type { ComponentType } from 'react';

  const Svg: ComponentType<any>;
  export const Circle: ComponentType<any>;
  export const Ellipse: ComponentType<any>;
  export const Line: ComponentType<any>;
  export const Polygon: ComponentType<any>;
  export const Polyline: ComponentType<any>;
  export const Rect: ComponentType<any>;
  export const Path: ComponentType<any>;
  export default Svg;
}
