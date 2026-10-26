-- Clarify the legacy seeded copy without overwriting a description edited by staff.
UPDATE "certificates"
SET "description" = 'Lộ trình ôn AWS Cloud dành cho người mới bắt đầu, gồm các khái niệm cơ bản, dịch vụ AWS, bảo mật, chi phí và thuật ngữ thường gặp.'
WHERE "code" = 'AWS-CLF-C02'
  AND "description" = 'Chứng chỉ nền tảng xác nhận hiểu biết tổng quan về AWS Cloud, dịch vụ, bảo mật, chi phí và thuật ngữ cloud.';
