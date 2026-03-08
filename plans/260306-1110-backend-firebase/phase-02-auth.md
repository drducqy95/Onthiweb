# Phase 02: Auth System (Login / Register / Protect)

Status: ⬜ Pending
Độ khó: ⭐⭐⭐ Medium (3/5)
Dependencies: Phase 01
Sessions ước tính: 2

## Objective
Xây dựng hệ thống đăng nhập/đăng ký với Firebase Auth, tạo user document tự động, và bảo vệ routes.

## Implementation Steps

1. [ ] **Tạo `AuthContext`** — React Context quản lý trạng thái auth
   - `onAuthStateChanged` listener
   - Expose `user`, `loading`, `signIn`, `signUp`, `signOut`, `getIdToken`

2. [ ] **Tạo `LoginScreen.tsx`** — Giao diện đăng nhập
   - Form Email/Password
   - Nút "Đăng nhập bằng Google" (Google OAuth)
   - Link chuyển sang RegisterScreen
   - Error handling (sai mật khẩu, email không tồn tại)

3. [ ] **Tạo `RegisterScreen.tsx`** — Giao diện đăng ký
   - Form: Email, Password, Confirm Password, Họ tên
   - Validation: email format, password ≥ 6 chars, match confirm
   - Auto-login sau khi đăng ký thành công

4. [ ] **API: `api/auth/init-user.ts`** — Khởi tạo user document
   - POST sau khi đăng ký thành công
   - Tạo `users/{uid}` document với profile + default settings
   - Seed default `propertyOptions` subcollection

5. [ ] **Tạo `ProtectedRoute` component** — Bảo vệ routes cần auth
   - Redirect đến `/login` nếu chưa đăng nhập
   - Show loading spinner khi checking auth state

6. [ ] **Tạo `ForgotPasswordScreen.tsx`** — Quên mật khẩu
   - `sendPasswordResetEmail` từ Firebase Auth

7. [ ] **Tích hợp auth vào `MainLayout`**
   - Hiển thị avatar + tên user ở sidebar
   - Nút Sign Out

8. [ ] **Tạo `api/lib/api-client.ts`** — HTTP client wrapper
   - Auto-attach `Authorization: Bearer <token>` vào mọi request
   - Base URL configuration
   - Error interceptor

## Files to Create/Modify
- `src/contexts/AuthContext.tsx` — [NEW] Auth state management
- `src/screens/LoginScreen.tsx` — [NEW] Login UI
- `src/screens/RegisterScreen.tsx` — [NEW] Register UI
- `src/screens/ForgotPasswordScreen.tsx` — [NEW] Reset password
- `src/components/ProtectedRoute.tsx` — [NEW] Route guard
- `src/lib/api-client.ts` — [NEW] HTTP client with auth
- `api/auth/init-user.ts` — [NEW] User initialization API
- `src/main.tsx` — [MODIFY] Wrap with AuthProvider, add auth routes
- `src/components/MainLayout.tsx` — [MODIFY] Show user info

## Test Criteria
- [ ] Đăng ký tài khoản mới → auto tạo user document trong Firestore
- [ ] Đăng nhập Email/Password thành công
- [ ] Đăng nhập Google OAuth thành công
- [ ] Routes được bảo vệ (redirect về /login khi chưa đăng nhập)
- [ ] Sign Out xóa session, redirect về /login
- [ ] Quên mật khẩu gửi email thành công

---
Next Phase: [phase-03-backend.md](./phase-03-backend.md)
