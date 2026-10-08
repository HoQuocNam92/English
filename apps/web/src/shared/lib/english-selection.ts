const VIETNAMESE_MARKS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

export function isEnglishSelection(text: string): boolean {
  const normalized = text.normalize('NFC').trim();
  return /[a-z]{2,}/i.test(normalized) && !VIETNAMESE_MARKS.test(normalized) && new TextEncoder().encode(normalized).length <= 500;
}
