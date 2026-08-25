---
description: React Native mobile rules
paths:
  - "apps/mobile/**"
---
# React Native Rules

- Không dùng WebView để giả giao diện Stitch.
- Screen là presentation.
- API call qua adapter/repository, không rải fetch/axios trong screen.
- Navigation không chứa business logic.
- Storage/token qua abstraction.
- Feature folder theo Clean Architecture khi feature đủ lớn.
- Bám Stitch mobile.
- Kiểm tra keyboard/safe-area/scroll/loading/error/empty.
- Không hard-code device dimensions.
