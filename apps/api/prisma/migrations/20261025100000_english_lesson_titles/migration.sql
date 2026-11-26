-- Correct seeded lesson names at the source without changing lesson IDs or progress.
-- Only replace original seeded titles; preserve names edited by administrators.
UPDATE lessons AS lesson
SET title = names.english_title
FROM (VALUES
  ('aws-clf-c02-knowledge-1-1', 'Lợi ích của điện toán đám mây', 'Benefits of Cloud Computing'),
  ('aws-clf-c02-knowledge-1-2', 'Nguyên tắc thiết kế trên AWS', 'AWS Design Principles'),
  ('aws-clf-c02-knowledge-1-3', 'Chiến lược di chuyển lên đám mây', 'Cloud Migration Strategies'),
  ('aws-clf-c02-knowledge-1-4', 'Kinh tế đám mây và TCO', 'Cloud Economics and Total Cost of Ownership'),
  ('aws-clf-c02-knowledge-2-1', 'Mô hình trách nhiệm chia sẻ', 'The Shared Responsibility Model'),
  ('aws-clf-c02-knowledge-2-2', 'Quản trị, nhật ký và tuân thủ', 'Governance, Logging, and Compliance'),
  ('aws-clf-c02-knowledge-2-3', 'IAM và quyền truy cập', 'IAM and Access Management'),
  ('aws-clf-c02-knowledge-2-4', 'Dịch vụ bảo vệ và phát hiện rủi ro', 'Security and Threat Detection Services'),
  ('aws-clf-c02-knowledge-3-1', 'Triển khai và vận hành trên cloud', 'Cloud Deployment and Operations'),
  ('aws-clf-c02-knowledge-3-2', 'Region, Availability Zone và edge', 'Regions, Availability Zones, and Edge Locations'),
  ('aws-clf-c02-knowledge-3-3', 'Lựa chọn dịch vụ compute', 'Choosing Compute Services'),
  ('aws-clf-c02-knowledge-3-4', 'Cơ sở dữ liệu trên AWS', 'Databases on AWS'),
  ('aws-clf-c02-knowledge-3-5', 'VPC và kết nối mạng', 'VPCs and Network Connectivity'),
  ('aws-clf-c02-knowledge-3-6', 'Object, block và file storage', 'Object, Block, and File Storage'),
  ('aws-clf-c02-knowledge-3-7', 'AI, machine learning và analytics', 'AI, Machine Learning, and Analytics'),
  ('aws-clf-c02-knowledge-3-8', 'Tích hợp ứng dụng và các dịch vụ khác', 'Application Integration and Other Services'),
  ('aws-clf-c02-knowledge-4-1', 'Mô hình giá và lựa chọn mua', 'Pricing Models and Purchasing Options'),
  ('aws-clf-c02-knowledge-4-2', 'Ước tính, theo dõi và quản lý chi phí', 'Cost Estimation, Monitoring, and Management'),
  ('aws-clf-c02-knowledge-4-3', 'Hỗ trợ và tài nguyên học tập', 'Support and Learning Resources'),
  ('it-terminology-foundations', 'Thuật ngữ IT nền tảng', 'IT Terminology Foundations'),
  ('reading-cloud-architecture-document', 'Đọc hiểu tài liệu kiến trúc Cloud', 'Reading Cloud Architecture Documents'),
  ('reading-rest-api-documentation', 'Đọc tài liệu REST API', 'Reading REST API Documentation'),
  ('system-design-scalable-service', 'System Design: Dịch vụ có khả năng mở rộng', 'System Design: Building a Scalable Service'),
  ('ba-payment-requirement-case-study', 'Tình huống BA: Làm rõ yêu cầu thanh toán', 'BA Case Study: Clarifying Payment Requirements'),
  ('aws-saa-high-availability-review', 'Ôn tập AWS SAA: High Availability', 'AWS SAA Review: High Availability')
) AS names(slug, original_title, english_title)
WHERE lesson.slug = names.slug AND lesson.title = names.original_title;

-- Original coverage lessons use an English domain name and a Vietnamese suffix.
UPDATE lessons AS lesson
SET title = replace(lesson.title, 'Thuật ngữ và tình huống ' || names.original_level, 'Terminology and Scenarios (' || names.english_level || ')')
FROM (VALUES ('Sơ cấp', 'Beginner'), ('Trung cấp', 'Intermediate'), ('Nâng cao', 'Advanced'), ('Chuyên nghiệp', 'Professional')) AS names(original_level, english_level)
WHERE lesson.slug LIKE 'coverage-20261009-%'
  AND right(lesson.title, length(': Thuật ngữ và tình huống ' || names.original_level)) = ': Thuật ngữ và tình huống ' || names.original_level;
