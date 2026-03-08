# Phase 01: Firebase Setup & Vercel Config

Status: ⬜ Pending
Độ khó: ⭐⭐ Easy (2/5)
Dependencies: Không
Sessions ước tính: 1

## Objective
Thiết lập môi trường Firebase, cấu hình Vercel, và tạo foundation code cho toàn bộ backend.

---

## Sub-tasks

### 1.1 Tạo Firebase Project
- [ ] Truy cập console.firebase.google.com → Create Project
- [ ] Enable **Cloud Firestore** (Production mode)
- [ ] Enable **Authentication** → Email/Password + Google provider
- [ ] Enable **Firebase Storage**
- [ ] Ghi chú Project ID: `_______________`

### 1.2 Tạo Service Account Key
- [ ] Project Settings → Service Accounts → Generate New Private Key
- [ ] Lưu các giá trị:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
- [ ] Tạo file `.env.local` (đã có trong .gitignore)

### 1.3 Cài đặt dependencies
```bash
npm install firebase firebase-admin @vercel/node
```
- [ ] Verify package.json cập nhật đúng

### 1.4 Firebase Admin SDK singleton
- [ ] Tạo `api/lib/firebase-admin.ts`
- [ ] Init admin app với env vars (cert)
- [ ] Export `adminDb` (Firestore instance)
- [ ] Export `adminAuth` (Auth instance)
- [ ] Singleton pattern (check `getApps().length`)

### 1.5 Auth middleware
- [ ] Tạo `api/lib/auth-middleware.ts`
- [ ] Parse `Authorization: Bearer <token>` header
- [ ] Verify token via `adminAuth.verifyIdToken(token)`
- [ ] Return `userId` on success
- [ ] Throw `401 UNAUTHORIZED` on failure

### 1.6 Firebase Client SDK
- [ ] Tạo `src/lib/firebase-client.ts`
- [ ] Init client-side Firebase app (`initializeApp(config)`)
- [ ] Export `auth` instance (`getAuth()`)
- [ ] Export `storage` instance (`getStorage()`)

### 1.7 Firestore Security Rules
- [ ] Tạo `firestore.rules`
- [ ] Rule: User chỉ đọc/ghi data của chính mình
  ```
  match /users/{userId}/{document=**} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  ```
- [ ] Deploy rules lên Firebase Console

### 1.8 Vercel config
- [ ] Tạo `vercel.json` (nếu cần rewrites cho API routes)
- [ ] Verify cấu trúc `api/` folder hoạt động với Vercel Functions

### 1.9 Smoke test
- [ ] Tạo `api/health.ts` — endpoint test
  - Verify admin SDK init thành công
  - Return `{ status: "ok", timestamp }`
- [ ] Test: `curl http://localhost:3000/api/health` → 200 OK
- [ ] Test: Auth middleware reject request không token → 401

---

## Files to Create
| File | Purpose |
|------|---------|
| `api/lib/firebase-admin.ts` | Admin SDK singleton |
| `api/lib/auth-middleware.ts` | Token verification |
| `src/lib/firebase-client.ts` | Client SDK init |
| `firestore.rules` | Security Rules |
| `.env.local` | Environment variables |
| `vercel.json` | Vercel config |
| `api/health.ts` | Smoke test endpoint |

---
Next Phase: [phase-02-auth.md](./phase-02-auth.md)
