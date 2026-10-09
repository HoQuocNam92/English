const fs = require('fs');
const path = require('path');

const mappings = [
  // 17 existing
  ['admin_dashboard/code.html', 'apps/web/app/(admin)/admin/dashboard/page.tsx', 'AdminDashboardPage', 'Dashboard & Thống kê'],
  ['lesson_management/code.html', 'apps/web/app/(admin)/admin/lessons/page.tsx', 'AdminLessonsPage', 'Quản lý Bài học'],
  ['lesson_editor/code.html', 'apps/web/app/(admin)/admin/lessons/editor/page.tsx', 'AdminLessonEditorPage', 'Chỉnh sửa Bài học'],
  ['question_bank/code.html', 'apps/web/app/(admin)/admin/questions/page.tsx', 'AdminQuestionsPage', 'Ngân hàng Câu hỏi'],
  ['question_editor/code.html', 'apps/web/app/(admin)/admin/questions/editor/page.tsx', 'AdminQuestionEditorPage', 'Soạn thảo Câu hỏi'],
  ['test_management/code.html', 'apps/web/app/(admin)/admin/tests/page.tsx', 'AdminTestsPage', 'Quản lý Đề thi'],
  ['test_builder_step_1/code.html', 'apps/web/app/(admin)/admin/tests/builder/page.tsx', 'AdminTestBuilderPage', 'Tạo Đề thi'],
  ['test_results_management/code.html', 'apps/web/app/(admin)/admin/test-results/page.tsx', 'AdminTestResultsPage', 'Kết quả Thi'],
  ['user_management/code.html', 'apps/web/app/(admin)/admin/users/page.tsx', 'AdminUsersPage', 'Quản lý Người dùng'],
  ['certification_content_management/code.html', 'apps/web/app/(admin)/admin/certifications/page.tsx', 'AdminCertificationsPage', 'Quản lý Chứng chỉ'],
  ['certification_content_detail/code.html', 'apps/web/app/(admin)/admin/certifications/[id]/page.tsx', 'AdminCertificationDetailPage', 'Chi tiết Chứng chỉ'],
  ['learning_content_list/code.html', 'apps/web/app/(admin)/admin/learning-content/page.tsx', 'AdminLearningContentPage', 'Nội dung Học tập'],
  ['reports_dashboard/code.html', 'apps/web/app/(admin)/admin/reports/page.tsx', 'AdminReportsPage', 'Báo cáo & Thống kê'],
  ['report_detail/code.html', 'apps/web/app/(admin)/admin/reports/[id]/page.tsx', 'AdminReportDetailPage', 'Chi tiết Báo cáo'],
  ['student_profile_list/code.html', 'apps/web/app/(admin)/admin/students/page.tsx', 'AdminStudentsPage', 'Hồ sơ Học viên'],
  ['student_profile_detail/code.html', 'apps/web/app/(admin)/admin/students/[id]/page.tsx', 'AdminStudentDetailPage', 'Chi tiết Học viên'],
  ['student_progress_dashboard/code.html', 'apps/web/app/(admin)/admin/progress/page.tsx', 'AdminProgressPage', 'Tiến độ Học tập'],
  ['student_group_management/code.html', 'apps/web/app/(admin)/admin/student-groups/page.tsx', 'AdminStudentGroupsPage', 'Quản lý Nhóm'],

  // 12 new
  ['learning_session_analytics/code.html', 'apps/web/app/(admin)/admin/analytics/sessions/page.tsx', 'AdminAnalyticsSessionsPage', 'Phân tích Phiên học'],
  ['skill_gap_analysis/code.html', 'apps/web/app/(admin)/admin/analytics/skill-gap/page.tsx', 'AdminAnalyticsSkillGapPage', 'Phân tích Lỗ hổng Kỹ năng'],
  ['exam_readiness_score/code.html', 'apps/web/app/(admin)/admin/analytics/exam-readiness/page.tsx', 'AdminAnalyticsExamReadinessPage', 'Độ sẵn sàng Thi'],
  ['learning_path_generator/code.html', 'apps/web/app/(admin)/admin/learning-paths/page.tsx', 'AdminLearningPathsPage', 'Lộ trình Học tập'],
  ['community_discussion/code.html', 'apps/web/app/(admin)/admin/community/page.tsx', 'AdminCommunityPage', 'Thảo luận Cộng đồng'],
  ['technical_dictionary/code.html', 'apps/web/app/(admin)/admin/dictionary/page.tsx', 'AdminDictionaryPage', 'Từ điển Chuyên ngành'],
  ['technical_reading_lab/code.html', 'apps/web/app/(admin)/admin/reading-lab/page.tsx', 'AdminReadingLabPage', 'Phòng đọc Kỹ thuật'],

  ['career_preparation_center/code.html', 'apps/web/app/(admin)/admin/career-center/page.tsx', 'AdminCareerCenterPage', 'Trung tâm Hướng nghiệp'],
  ['learning_calendar/code.html', 'apps/web/app/(admin)/admin/calendar/page.tsx', 'AdminCalendarPage', 'Lịch Học tập']
];

function processHtmlToJsx(html) {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  let content = mainMatch ? mainMatch[1] : html;
  
  content = content.replace(/class=/g, 'className=');
  content = content.replace(/for=/g, 'htmlFor=');
  
  content = content.replace(/<img([^>]*)>/g, (m, g1) => {
    if (g1.trim().endsWith('/')) return m;
    return `<img${g1} />`;
  });
  content = content.replace(/<input([^>]*)>/g, (m, g1) => {
    if (g1.trim().endsWith('/')) return m;
    return `<input${g1} />`;
  });
  content = content.replace(/<hr([^>]*)>/g, (m, g1) => {
    if (g1.trim().endsWith('/')) return m;
    return `<hr${g1} />`;
  });
  content = content.replace(/<br([^>]*)>/g, (m, g1) => {
    if (g1.trim().endsWith('/')) return m;
    return `<br${g1} />`;
  });

  content = content.replace(/<!--[\s\S]*?-->/g, '');
  content = content.replace(/style="[^"]*"/g, '');
  content = content.replace(/style='[^']*'/g, '');
  
  return `<div className="space-y-6">\n${content}\n</div>`;
}

for (const [sourcePath, targetPath, componentName, pageTitle] of mappings) {
  const fullSourcePath = path.join('d:/workspaces/Projects/English/design-reference/stitch_techenglish_pro', sourcePath);
  const fullTargetPath = path.join('d:/workspaces/Projects/English', targetPath);
  
  const dir = path.dirname(fullTargetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let html = '';
  try {
    if (fs.existsSync(fullSourcePath)) {
      html = fs.readFileSync(fullSourcePath, 'utf8');
    } else {
      console.log('Source not found: ' + fullSourcePath);
      html = '<div className="p-6">Content from ' + sourcePath + ' not found.</div>';
    }
  } catch (e) {
    console.error('Error reading ' + fullSourcePath + ':', e);
  }

  const jsxContent = processHtmlToJsx(html);

  const fileContent = [
    "'use client';",
    "",
    "import * as React from 'react';",
    "import { PageHeader } from '@/shared/ui';",
    "import { apiClient } from '@/shared/api/api-client';",
    "",
    "export default function " + componentName + "() {",
    "  return (",
    '    <div className="p-6">',
    '      <PageHeader title="' + pageTitle + '" description="Giao diện cập nhật từ design" />',
    '      <div className="mt-6">',
    "        " + jsxContent,
    "      </div>",
    "    </div>",
    "  );",
    "}"
  ].join('\\n');

  fs.writeFileSync(fullTargetPath, fileContent.replace(/\\n/g, '\n'));
  console.log('Generated: ' + targetPath);
}
