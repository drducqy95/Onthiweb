# Phase 02: Auth System (Login / Register / Protect)

Status: ⬜ Pending
Độ khó: ⭐⭐⭐ Medium (3/5)
Dependencies: Phase 01
Sessions ước tính: 2

## Objective
Xây dựng hệ thống đăng nhập/đăng ký với Firebase Auth, tạo user document tự động, và bảo vệ routes.

---

## Session 2A: Auth Context + Login/Register UI

### 2.1 AuthContext
- [ ] Tạo `src/contexts/AuthContext.tsx`
- [ ] `onAuthStateChanged` listener → set `user` + `loading` state
- [ ] Expose functions:
  - `signInWithEmail(email, password)`
  - `signUpWithEmail(email, password)`
  - `signInWithGoogle()` (popup)
  - `signOut()`
  - `getIdToken()` → async return token string
- [ ] Handle errors: `auth/wrong-password`, `auth/user-not-found`, `auth/email-already-in-use`

### 2.2 LoginScreen
- [ ] Tạo `src/screens/LoginScreen.tsx`
- [ ] Form: Email input + Password input
- [ ] Nút "Đăng nhập" → `signInWithEmail()`
- [ ] Nút "Đăng nhập bằng Google" → `signInWithGoogle()`
- [ ] Link "Quên mật khẩu?" → navigate `/forgot-password`
- [ ] Link "Chưa có tài khoản? Đăng ký" → navigate `/register`
- [ ] Error toast khi đăng nhập thất bại
- [ ] Loading state trên nút khi đang xử lý

### 2.3 RegisterScreen
- [ ] Tạo `src/screens/RegisterScreen.tsx`
- [ ] Form: Họ tên + Email + Password + Confirm Password
- [ ] Validation:
  - Email format hợp lệ
  - Password ≥ 6 ký tự
  - Confirm Password match
  - Họ tên không trống
- [ ] Submit → `signUpWithEmail()` → call `POST /api/auth/init-user`
- [ ] Auto-login sau đăng ký thành công → redirect home
- [ ] Link "Đã có tài khoản? Đăng nhập" → navigate `/login`

### 2.4 ForgotPasswordScreen
- [ ] Tạo `src/screens/ForgotPasswordScreen.tsx`
- [ ] Form: Email input
- [ ] Submit → `sendPasswordResetEmail(auth, email)`
- [ ] Toast "Email đặt lại mật khẩu đã gửi!"
- [ ] Link "Quay lại đăng nhập" → navigate `/login`

### 2.5 ProtectedRoute component
- [ ] Tạo `src/components/ProtectedRoute.tsx`
- [ ] Nếu `loading` → show spinner/skeleton
- [ ] Nếu `!user` → redirect `/login`
- [ ] Nếu `user` → render children/outlet

---

## Session 2B: API + Integration

### 2.6 API init-user
- [ ] Tạo `api/auth/init-user.ts`
- [ ] POST request (authorized)
- [ ] Tạo `users/{uid}` document:
  ```json
  {
    "email": "...",
    "displayName": "...",
    "createdAt": timestamp,
    "settings": { ...default settings },
    "migrationStatus": "pending"
  }
  ```
- [ ] Seed `users/{uid}/propertyOptions` subcollection (15 defaults từ `AppDatabase.DEFAULT_PROPERTIES`)
- [ ] Idempotent: nếu user doc đã tồn tại → skip (cho Google re-login)

### 2.7 API client wrapper
- [ ] Tạo `src/lib/api-client.ts`
- [ ] `apiClient.get(path)`, `apiClient.post(path, body)`, `apiClient.put(...)`, `apiClient.delete(...)`
- [ ] Auto-attach `Authorization: Bearer <token>` header (lấy từ AuthContext `getIdToken()`)
- [ ] Base URL: development = `/api`, production = auto
- [ ] Error interceptor: `401` → redirect `/login` + clear auth state
- [ ] `403` → show "Không có quyền truy cập"

### 2.8 Tích hợp auth vào MainLayout
- [ ] Sửa `src/components/MainLayout.tsx`
- [ ] Sidebar hiển thị avatar + email/tên user
- [ ] Nút "Đăng xuất" → `signOut()` → redirect `/login`
- [ ] Nếu có avatar URL → hiển thị, nếu không → icon mặc định

### 2.9 Wrap app với AuthProvider
- [ ] Sửa `src/main.tsx`
- [ ] Wrap root với `<AuthProvider>`
- [ ] Thêm public routes: `/login`, `/register`, `/forgot-password`
- [ ] Wrap tất cả route hiện tại với `<ProtectedRoute>`
- [ ] Redirect mặc định: chưa login → `/login`

### 2.10 Test toàn bộ auth flow
- [ ] Đăng ký email mới → verify Firestore user doc + propertyOptions
- [ ] Đăng nhập Email/Password → redirect home
- [ ] Đăng nhập Google OAuth → redirect home + init-user
- [ ] Sign Out → redirect `/login`
- [ ] Protected route: truy cập `/` khi chưa login → redirect `/login`
- [ ] Forgot password → nhận email reset

---

## Files to Create/Modify
| File | Action | Purpose |
|------|--------|---------|
| `src/contexts/AuthContext.tsx` | NEW | Auth state management |
| `src/screens/LoginScreen.tsx` | NEW | Login UI |
| `src/screens/RegisterScreen.tsx` | NEW | Register UI |
| `src/screens/ForgotPasswordScreen.tsx` | NEW | Reset password |
| `src/components/ProtectedRoute.tsx` | NEW | Route guard |
| `src/lib/api-client.ts` | NEW | HTTP client with auth |
| `api/auth/init-user.ts` | NEW | User initialization API |
| `src/main.tsx` | MODIFY | Wrap AuthProvider, add routes |
| `src/components/MainLayout.tsx` | MODIFY | Show user info + logout |

---
Next Phase: [phase-03-backend.md](./phase-03-backend.md)
