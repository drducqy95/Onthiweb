# Phase 01: Firebase Setup & Vercel Config

Status: ⬜ Pending
Độ khó: ⭐⭐ Easy (2/5)
Dependencies: Không
Sessions ước tính: 1

## Objective
Thiết lập môi trường Firebase, cấu hình Vercel, và tạo foundation code cho toàn bộ backend.

## Requirements

### Functional
- [ ] Firebase project được tạo và cấu hình
- [ ] Firestore database khởi tạo với Security Rules
- [ ] Firebase Admin SDK hoạt động trong Vercel Functions
- [ ] Vercel project liên kết với repo

### Non-Functional
- [ ] Environment variables bảo mật (không leak credentials)
- [ ] Firebase Admin singleton pattern (tránh re-init)

## Implementation Steps

1. [ ] **Tạo Firebase Project** trên console.firebase.google.com
   - Enable Firestore (Production mode)
   - Enable Authentication (Email/Password + Google)
   - Enable Storage

2. [ ] **Tạo Service Account Key**
   - Project Settings → Service Accounts → Generate New Private Key
   - Lưu `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

3. [ ] **Cài đặt dependencies**
   ```bash
   npm install firebase firebase-admin @vercel/node
   ```

4. [ ] **Tạo file `api/lib/firebase-admin.ts`** — Admin SDK singleton
   - Sử dụng env vars từ Vercel
   - Export `adminDb`, `adminAuth`

5. [ ] **Tạo file `api/lib/auth-middleware.ts`** — Token verification
   - Verify Firebase ID Token từ `Authorization: Bearer <token>` header
   - Return `userId` hoặc throw `UNAUTHORIZED`

6. [ ] **Deploy Security Rules** lên Firestore
   - Deploy rules từ `firestore.rules` file
   - Verify rules hoạt động đúng

## Files to Create
- `api/lib/firebase-admin.ts` — Admin SDK init
- `api/lib/auth-middleware.ts` — Auth helper
- `src/lib/firebase-client.ts` — Client SDK init
- `firestore.rules` — Security Rules
- `.env.local` — Environment variables (gitignored)
- `vercel.json` — Vercel config (nếu cần)

## Test Criteria
- [ ] `firebase-admin` khởi tạo thành công (không lỗi credentials)
- [ ] Auth middleware verify token đúng (test với mock token)
- [ ] Firestore read/write từ Admin SDK hoạt động
- [ ] Security Rules chặn truy cập không hợp lệ

---
Next Phase: [phase-02-auth.md](./phase-02-auth.md)
