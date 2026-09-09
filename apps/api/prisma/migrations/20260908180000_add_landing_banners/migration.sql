CREATE TABLE "landing_banners" (
  "id" UUID NOT NULL,
  "placement" VARCHAR(30) NOT NULL DEFAULT 'hero',
  "eyebrow" VARCHAR(100),
  "title" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "image_url" VARCHAR(1000),
  "cta_label" VARCHAR(80),
  "cta_url" VARCHAR(1000),
  "accent_color" VARCHAR(20) NOT NULL DEFAULT '#4F46E5',
  "background_color" VARCHAR(20) NOT NULL DEFAULT '#EEF2FF',
  "bullet_points" JSONB NOT NULL DEFAULT '[]',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "starts_at" TIMESTAMPTZ(6),
  "ends_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "landing_banners_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "landing_banners_placement_is_active_sort_order_idx" ON "landing_banners"("placement", "is_active", "sort_order");

INSERT INTO "landing_banners" ("id", "placement", "eyebrow", "title", "description", "cta_label", "cta_url", "accent_color", "background_color", "bullet_points", "sort_order") VALUES
('8bd7f66b-4438-4a62-9880-bb1a06ea5301', 'hero', 'TECHENGLISH PRO', 'Luyện tiếng Anh IT không giới hạn', 'Học đúng ngữ cảnh công việc dành cho Developer, Engineer và người chuẩn bị chứng chỉ công nghệ.', 'Bắt đầu học miễn phí', '/register', '#4338CA', '#EEF2FF', '["Bài đọc và từ vựng chuyên ngành", "AI sửa câu, giải thích và tạo quiz", "Theo dõi tiến độ từ dữ liệu học thật"]', 1),
('8bd7f66b-4438-4a62-9880-bb1a06ea5302', 'hero', 'AI ENGLISH COACH', 'Luyện phỏng vấn và giao tiếp công nghệ', 'Thực hành hội thoại IT, nhận phản hồi ngữ pháp và ôn lại lỗi bằng quiz cá nhân hóa.', 'Thử AI English Coach', '/register', '#6D28D9', '#F5F3FF', '["Hội thoại theo vai trò IT", "Giải thích bằng tiếng Việt", "Lưu từ vựng và ghi chú"]', 2),
('8bd7f66b-4438-4a62-9880-bb1a06ea5311', 'free_feature', 'BÀI ĐỌC', 'Đọc hiểu tài liệu IT', 'Luyện đọc API documentation, cloud và software engineering theo trình độ.', 'Xem bài đọc', '/register', '#2563EB', '#EFF6FF', '[]', 1),
('8bd7f66b-4438-4a62-9880-bb1a06ea5312', 'free_feature', 'AI COACH', 'Hỏi đáp và sửa câu', 'Hỏi kiến thức tiếng Anh, sửa lỗi và nhận giải thích rõ ràng bằng tiếng Việt.', 'Thử ngay', '/register', '#7C3AED', '#F5F3FF', '[]', 2),
('8bd7f66b-4438-4a62-9880-bb1a06ea5313', 'free_feature', 'TỪ VỰNG', 'Từ vựng IT theo cụm', 'Học phiên âm, collocation, ví dụ chuyên ngành và lưu ghi chú cá nhân.', 'Học từ vựng', '/register', '#059669', '#ECFDF5', '[]', 3);
