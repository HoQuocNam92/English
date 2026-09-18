import * as XLSX from 'xlsx';

export interface QuestionOptionItem {
  key: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface ParsedQuestionItem {
  type: 'single_choice' | 'multiple_choice';
  prompt: string;
  context?: string;
  domainId?: string;
  domainCode?: string;
  domainName?: string;
  levelId?: string;
  levelCode?: string;
  levelName?: string;
  explanation?: string;
  points: number;
  status: 'published' | 'draft';
  options: QuestionOptionItem[];
}

export interface ParsedQuestionRow {
  rowNumber: number;
  isValid: boolean;
  errorMessage?: string;
  question?: ParsedQuestionItem;
  raw: Record<string, any>;
}

export interface ExcelParseResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  rows: ParsedQuestionRow[];
}

/**
 * Tạo và tải xuống file Excel mẫu chuẩn (.xlsx) để import câu hỏi.
 */
export function downloadQuestionExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Mẫu nhập câu hỏi
  const headers = [
    'Loại câu hỏi (*)',
    'Nội dung câu hỏi (*)',
    'Đoạn văn ngữ cảnh',
    'Chuyên ngành (*)',
    'Cấp độ (*)',
    'Đáp án A (*)',
    'Đáp án B (*)',
    'Đáp án C',
    'Đáp án D',
    'Đáp án đúng (*)',
    'Giải thích chi tiết',
    'Điểm',
  ];

  const exampleRows = [
    [
      'single_choice',
      'What does IAM stand for in cloud computing and AWS?',
      'AWS Identity and Access Management provides fine-grained access control.',
      'CLOUD',
      'beginner',
      'Identity and Access Management',
      'Internet Access Module',
      'Integrated Application Manager',
      'Internal Authentication Method',
      'A',
      'IAM là viết tắt của Identity and Access Management trong điện toán đám mây.',
      1,
    ],
    [
      'multiple_choice',
      'Which of the following services provide relational database capabilities in AWS?',
      '',
      'CLOUD',
      'intermediate',
      'Amazon RDS',
      'Amazon Aurora',
      'Amazon DynamoDB',
      'Amazon S3',
      'A,B',
      'RDS và Aurora là các dịch vụ cơ sở dữ liệu quan hệ (RDBMS). DynamoDB là NoSQL, S3 là Object storage.',
      1,
    ],
    [
      'single_choice',
      'Trong mô hình MVC (Model-View-Controller), thành phần nào chịu trách nhiệm tương tác trực tiếp với Database?',
      '',
      'SOFTWARE_ENG',
      'beginner',
      'Model',
      'View',
      'Controller',
      'Router',
      'A',
      'Model đại diện cho cấu trúc dữ liệu và xử lý logic truy vấn / cập nhật database.',
      1,
    ],
  ];

  const dataSheet = [headers, ...exampleRows];
  const wsData = XLSX.utils.aoa_to_sheet(dataSheet);

  // Set column widths
  wsData['!cols'] = [
    { wch: 18 }, // Loại câu hỏi
    { wch: 50 }, // Nội dung câu hỏi
    { wch: 35 }, // Đoạn văn ngữ cảnh
    { wch: 18 }, // Chuyên ngành
    { wch: 16 }, // Cấp độ
    { wch: 30 }, // Đáp án A
    { wch: 30 }, // Đáp án B
    { wch: 30 }, // Đáp án C
    { wch: 30 }, // Đáp án D
    { wch: 15 }, // Đáp án đúng
    { wch: 45 }, // Giải thích
    { wch: 10 }, // Điểm
  ];

  XLSX.utils.book_append_sheet(wb, wsData, 'Danh sách câu hỏi');

  // ── Sheet 2: Hướng dẫn nhập liệu
  const guideSheet = [
    ['HƯỚNG DẪN ĐIỀN FILE EXCEL NHẬP CÂU HỎI TRẮC NGHIỆM TECHENGLISH PRO'],
    [''],
    ['1. Cột có dấu (*) là bắt buộc.'],
    ['2. Loại câu hỏi: nhập "single_choice" (1 đáp án) hoặc "multiple_choice" (nhiều đáp án).'],
    ['3. Chuyên ngành / Lĩnh vực: Có thể nhập mã code hoặc tên đầy đủ:'],
    ['   - CLOUD: Cloud Computing'],
    ['   - CYBERSEC: Cybersecurity'],
    ['   - NETWORKING: Networking'],
    ['   - DATA_ENG: Data Engineering'],
    ['   - DATA_SCI: Data Science'],
    ['   - SOFTWARE_ENG: Software Engineering'],
    ['   - DEVOPS: DevOps'],
    ['4. Cấp độ: Có thể nhập mã code hoặc tên:'],
    ['   - beginner: Mới bắt đầu (Beginner)'],
    ['   - intermediate: Trung cấp (Intermediate)'],
    ['   - advanced: Nâng cao (Advanced)'],
    ['5. Đáp án: Bắt buộc có ít nhất 2 đáp án A và B.'],
    ['6. Đáp án đúng: Điền chữ cái tương ứng:'],
    ['   - Câu 1 đáp án: điền A hoặc B hoặc C hoặc D'],
    ['   - Câu nhiều đáp án: điền các chữ cái cách nhau bằng dấu phẩy (Ví dụ: A,B hoặc A,C,D)'],
    ['7. Điểm: Số điểm nhận được khi trả lời đúng (mặc định 1).'],
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet(guideSheet);
  wsGuide['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Hướng dẫn');

  // Trigger download
  XLSX.writeFile(wb, 'Mau_Import_Cau_Hoi_TechEnglish.xlsx');
}

/**
 * Phân tích và kiểm tra tính hợp lệ của file Excel câu hỏi tải lên.
 */
export async function parseQuestionsFromExcel(
  file: File,
  availableDomains: Array<{ id: string; code?: string; name?: string }>,
  availableLevels: Array<{ id: string; code?: string; name?: string }>
): Promise<ExcelParseResult> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('File Excel không có sheet nào');
  }

  const ws = wb.Sheets[firstSheetName];
  const rawData = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

  if (rawData.length <= 1) {
    return { totalRows: 0, validCount: 0, invalidCount: 0, rows: [] };
  }

  // Create lookup maps
  const domainLookup = new Map<string, { id: string; code: string; name: string }>();
  for (const d of availableDomains) {
    const code = (d.code || '').toLowerCase().trim();
    const name = (d.name || '').toLowerCase().trim();
    const entry = { id: d.id, code: d.code || '', name: d.name || '' };
    if (code) domainLookup.set(code, entry);
    if (name) domainLookup.set(name, entry);
  }

  const levelLookup = new Map<string, { id: string; code: string; name: string }>();
  for (const l of availableLevels) {
    const code = (l.code || '').toLowerCase().trim();
    const name = (l.name || '').toLowerCase().trim();
    const entry = { id: l.id, code: l.code || '', name: l.name || '' };
    if (code) levelLookup.set(code, entry);
    if (name) levelLookup.set(name, entry);
  }

  const rows: ParsedQuestionRow[] = [];

  // Data rows start at index 1 (after header)
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || !row.length || row.every((c: any) => c === undefined || c === null || String(c).trim() === '')) {
      continue; // Skip empty row
    }

    const rowNumber = i + 1;
    const typeRaw = String(row[0] || '').trim().toLowerCase();
    const prompt = String(row[1] || '').trim();
    const context = row[2] ? String(row[2]).trim() : undefined;
    const domainRaw = String(row[3] || '').trim().toLowerCase();
    const levelRaw = String(row[4] || '').trim().toLowerCase();
    const optA = row[5] !== undefined ? String(row[5]).trim() : '';
    const optB = row[6] !== undefined ? String(row[6]).trim() : '';
    const optC = row[7] !== undefined ? String(row[7]).trim() : '';
    const optD = row[8] !== undefined ? String(row[8]).trim() : '';
    const correctRaw = String(row[9] || '').trim().toUpperCase();
    const explanation = row[10] ? String(row[10]).trim() : '';
    const pointsNum = Number(row[11]) || 1;

    const rawObj = {
      type: row[0],
      prompt,
      context,
      domain: row[3],
      level: row[4],
      optA, optB, optC, optD,
      correct: correctRaw,
      explanation,
      points: pointsNum,
    };

    // Validation checks
    const errors: string[] = [];

    // 1. Question prompt
    if (!prompt) {
      errors.push('Nội dung câu hỏi không được để trống');
    } else if (prompt.length < 10) {
      errors.push('Nội dung câu hỏi quá ngắn (tối thiểu 10 ký tự)');
    }

    // 2. Question type
    let type: 'single_choice' | 'multiple_choice' = 'single_choice';
    if (typeRaw.includes('multi') || typeRaw.includes('nhiều')) {
      type = 'multiple_choice';
    } else if (typeRaw.includes('single') || typeRaw.includes('một') || typeRaw.includes('1') || !typeRaw) {
      type = 'single_choice';
    } else {
      errors.push(`Loại câu hỏi "${row[0]}" không hợp lệ (hỗ trợ: single_choice, multiple_choice)`);
    }

    // 3. Domain
    const domainMatch = domainLookup.get(domainRaw) || (availableDomains.length > 0 ? { id: availableDomains[0].id, code: availableDomains[0].code || 'CLOUD', name: availableDomains[0].name || 'IT' } : undefined);
    if (!domainRaw && !domainMatch) {
      errors.push('Chuyên ngành / Lĩnh vực không được để trống');
    }

    // 4. Level
    const levelMatch = levelLookup.get(levelRaw) || (availableLevels.length > 0 ? { id: availableLevels[0].id, code: availableLevels[0].code || 'beginner', name: availableLevels[0].name || 'Beginner' } : undefined);
    if (!levelRaw && !levelMatch) {
      errors.push('Cấp độ không được để trống');
    }

    // 5. Options
    if (!optA || !optB) {
      errors.push('Bắt buộc phải có ít nhất Đáp án A và Đáp án B');
    }

    const correctLetters = correctRaw
      .split(/[,;\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (correctLetters.length === 0) {
      errors.push('Chưa chọn đáp án đúng (ví dụ: A hoặc A,B)');
    }

    if (type === 'single_choice' && correctLetters.length > 1) {
      errors.push('Câu hỏi chọn một đáp án nhưng có nhiều hơn 1 đáp án đúng');
    }

    const options: QuestionOptionItem[] = [];
    if (optA) options.push({ key: 'A', text: optA, isCorrect: correctLetters.includes('A') });
    if (optB) options.push({ key: 'B', text: optB, isCorrect: correctLetters.includes('B') });
    if (optC) options.push({ key: 'C', text: optC, isCorrect: correctLetters.includes('C') });
    if (optD) options.push({ key: 'D', text: optD, isCorrect: correctLetters.includes('D') });

    const correctCount = options.filter((o) => o.isCorrect).length;
    if (options.length >= 2 && correctCount === 0) {
      errors.push(`Đáp án đúng "${correctRaw}" không khớp với các đáp án có sẵn (A, B${optC ? ', C' : ''}${optD ? ', D' : ''})`);
    }

    const isValid = errors.length === 0;

    let question: ParsedQuestionItem | undefined;
    if (isValid && domainMatch && levelMatch) {
      question = {
        type,
        prompt,
        context,
        domainId: domainMatch.id,
        domainCode: domainMatch.code,
        domainName: domainMatch.name,
        levelId: levelMatch.id,
        levelCode: levelMatch.code,
        levelName: levelMatch.name,
        explanation,
        points: pointsNum,
        status: 'published',
        options,
      };
    }

    rows.push({
      rowNumber,
      isValid,
      errorMessage: errors.join('; '),
      question,
      raw: rawObj,
    });
  }

  const validCount = rows.filter((r) => r.isValid).length;
  return {
    totalRows: rows.length,
    validCount,
    invalidCount: rows.length - validCount,
    rows,
  };
}
