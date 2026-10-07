export function validateLearningTargets(vocabulary: string, exams: string, minutes: string): string | null {
  const fields = [
    { value: vocabulary, name: 'Số từ vựng mỗi ngày', min: 1, max: 200 },
    { value: exams, name: 'Số bài Quiz mỗi tuần', min: 1, max: 50 },
    { value: minutes, name: 'Số phút học mỗi ngày', min: 5, max: 1440 },
  ];
  for (const field of fields) {
    if (!/^\d+$/.test(field.value) || Number(field.value) < field.min || Number(field.value) > field.max) {
      return `${field.name} phải là số nguyên từ ${field.min} đến ${field.max}.`;
    }
  }
  return null;
}
