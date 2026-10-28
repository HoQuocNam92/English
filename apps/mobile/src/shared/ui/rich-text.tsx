import React, { type ReactNode } from 'react';
import { Linking, Text, type TextStyle } from 'react-native';
import { interFontStyle } from './font-styles';
import { isRichText, parseRichText, type RichTextNode } from '../../../../../packages/shared-kernel/src/rich-text';
export { richTextToPlainText } from '../../../../../packages/shared-kernel/src/rich-text';

export function renderRichTextChildren(value: ReactNode): ReactNode {
  if (Array.isArray(value)) return value.map((child, index) => <React.Fragment key={index}>{renderRichTextChildren(child)}</React.Fragment>);
  if (typeof value !== 'string' || !isRichText(value)) return value;
  const render = (nodes: RichTextNode[], ordered = false): ReactNode => nodes.map((node, index) => {
    if (typeof node === 'string') return node;
    const styles: Record<string, TextStyle> = { strong: { fontWeight: '700' }, em: { fontStyle: 'italic' }, u: { textDecorationLine: 'underline' }, s: { textDecorationLine: 'line-through' }, h2: { fontSize: 21, fontWeight: '700' }, h3: { fontSize: 18, fontWeight: '700' }, blockquote: { fontStyle: 'italic', color: '#64748b' }, code: { fontFamily: 'monospace' }, pre: { fontFamily: 'monospace' }, a: { color: '#1d4ed8', textDecorationLine: 'underline' } };
    if (node.tag === 'br') return '\n';
    const textStyle = styles[node.tag];
    if (textStyle?.fontWeight) Object.assign(textStyle, interFontStyle(textStyle.fontWeight));
    const block = ['p', 'h2', 'h3', 'li', 'blockquote', 'pre'].includes(node.tag);
    const itemNumber = nodes.slice(0, index + 1).filter(item => typeof item !== 'string' && item.tag === 'li').length;
    return <Text key={index} style={styles[node.tag]} accessibilityRole={node.href ? 'link' : undefined} onPress={node.href ? () => { void Linking.openURL(node.href!).catch(() => {}); } : undefined}>{node.tag === 'li' ? ordered ? `${itemNumber}. ` : '• ' : ''}{render(node.children, node.tag === 'ol')}{block ? '\n' : ''}</Text>;
  });
  return render(parseRichText(value));
}
