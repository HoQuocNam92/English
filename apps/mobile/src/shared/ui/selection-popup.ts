export type SelectionRect = { x: number; y: number; width: number; height: number };

export function selectionPopupPosition(rect: SelectionRect, viewport: { width: number; height: number }, insets: { top: number; bottom: number }) {
  const width = Math.min(100, Math.max(0, viewport.width - 24));
  const height = 44;
  const minimum = insets.top + 8;
  const maximum = Math.max(minimum, viewport.height - insets.bottom - height - 8);
  const below = rect.y + rect.height + 8;
  return {
    left: Math.max(12, Math.min(rect.x + rect.width / 2 - width / 2, viewport.width - width - 12)),
    top: Math.max(minimum, Math.min(below <= maximum ? below : rect.y - height - 8, maximum)),
    width, height,
  };
}
