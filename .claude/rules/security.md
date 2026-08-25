---
description: Security baseline
---
# Security Rules
- Password chỉ lưu hash mạnh; không tự mã hóa reversible.
- Access/refresh token phải có expiry; refresh token cần chiến lược revoke/rotate phù hợp stack.
- OTP/reset token có TTL và one-time use.
- Không tin role từ client payload.
- Validate MIME/size nếu upload file.
- Rate limit login, reset password và endpoint nhạy cảm.
- CORS chỉ mở origin cần thiết.
- Secret chỉ qua environment/secret manager.
