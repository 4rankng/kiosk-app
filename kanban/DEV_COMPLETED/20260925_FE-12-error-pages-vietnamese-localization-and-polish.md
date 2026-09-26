---
id: FE-12
title: "Error pages UI/UX polish: Vietnamese localization and Fresh Market styling for 401, 403, 404, 500, 503"
severity: low
area: frontend
labels: [ui-ux, errors, i18n]
effort: XS
status: dev_completed
column: DEV_COMPLETED
opened: 2026-09-25
started: 2026-09-25
completed: 2026-09-25
---

# FE-12 — Error pages UI/UX polish: Vietnamese localization and Fresh Market styling for 401, 403, 404, 500, 503

**Severity:** low · **Area:** frontend · **Effort:** XS · **Labels:** ui-ux, errors, i18n

**Trạng thái:** HOÀN THÀNH DEV

## Verification Notes
- Localized all error pages (`not-found-error.tsx`, `forbidden.tsx`, `unauthorized-error.tsx`, `general-error.tsx`) to natural, polite Vietnamese.
- Styled error views with Fresh Market warm background, branded typography, icons (Home, ArrowLeft, ShieldAlert, LogIn, RefreshCw), and standard action buttons (`h-9`).
- Verified via clean production build `tsc -b && vite build`.
- Visually verified via Playwright screenshots (`screenshots/11_error_404_verified.png`, `screenshots/12_error_403_verified.png`).

## Problem

All error state pages (`not-found-error.tsx`, `unauthorized-error.tsx`, `forbidden.tsx`, `general-error.tsx`, `maintenance-error.tsx`) render raw English text ("Oops! Page Not Found!", "Access Forbidden", "Go Back", "Back to Home"). This breaks the Vietnamese-first design contract.

## Evidence

- `frontend/src/features/errors/not-found-error.tsx:11-20`: "Oops! Page Not Found!", "Go Back", "Back to Home".
- `frontend/src/features/errors/forbidden.tsx`, `unauthorized-error.tsx`, `general-error.tsx`, `maintenance-error.tsx`.
- Captured screenshot `screenshots/11_error_404.png`.

## Impact

When a user encounters a wrong link, network glitch, or expired session, they are presented with unexpected English text.

## Suggested fix

1. Localize all error pages into clear, polite Vietnamese:
   - 404: "Không tìm thấy trang" · "Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển."
   - 403: "Không có quyền truy cập" · "Bạn không có quyền xem trang này. Vui lòng liên hệ quản trị viên."
   - 401: "Chưa đăng nhập" · "Phiên đăng nhập đã hết hạn hoặc bạn chưa được cấp quyền."
   - 500: "Đã xảy ra lỗi hệ thống" · "Hệ thống đang gặp sự cố tạm thời. Vui lòng thử lại sau giây lát."
   - 503: "Hệ thống đang bảo trì" · "Chúng tôi đang nâng cấp dịch vụ. Vui lòng quay lại sau ít phút."
2. Standardize action buttons: "Quay lại" and "Về trang chủ".
3. Add Fresh Market soft styling and iconography.
4. Verify with screenshot.
