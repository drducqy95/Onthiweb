# Phase 06: Testing & Production Deploy

Status: ⬜ Pending
Độ khó: ⭐⭐⭐ Medium (3/5)
Dependencies: Phase 05
Sessions ước tính: 2

## Objective
Full testing của toàn bộ hệ thống, fix bugs, và deploy lần đầu lên production (Vercel).

---

## Session 6A: Testing

### 6.1 End-to-End Flow Test
- [ ] Đăng ký tài khoản mới → verify Firestore user document
- [ ] Tạo bộ đề (subject) mới → verify hiển thị trong Question Bank
- [ ] Thêm câu hỏi (MULTIPLE_CHOICE) → verify flash card view
- [ ] Thêm câu hỏi (TRUE_FALSE_TABLE) → verify sub-questions
- [ ] Import câu hỏi từ DOCX → verify import count
- [ ] Ôn tập (Practice) → trả lời + kiểm tra kết quả
- [ ] Tạo đề thi (Exam) → làm bài → nộp bài → xem kết quả
- [ ] Xem lịch sử thi → click vào result → review chi tiết
- [ ] Thay đổi Settings → verify lưu + load lại

### 6.2 Multi-user Isolation Test
- [ ] Tạo Account A → thêm 3 bộ đề + 10 câu hỏi
- [ ] Tạo Account B → thêm 2 bộ đề + 5 câu hỏi
- [ ] Login Account A → verify chỉ thấy data của A
- [ ] Login Account B → verify chỉ thấy data của B
- [ ] ⚠️ Thử đổi URL thủ công xem có lấy được data bên kia không

### 6.3 Edge Case: Token Expiration
- [ ] Đăng nhập → đợi token expire (~1h) hoặc manually expire
- [ ] Thử submit bài thi → verify auto-refresh token hoặc graceful error
- [ ] Thử CRUD operation → verify không bị mất data
- [ ] Verify error toast + redirect login nếu refresh fail

### 6.4 Edge Case: Large Data
- [ ] Import 200+ câu hỏi cùng lúc → verify batch processing
- [ ] Load subject có 500 questions → verify performance < 3s
- [ ] Tạo câu hỏi với nội dung dài (gần 1MB) → verify save thành công
- [ ] Upload nhiều ảnh cùng lúc → verify Storage + URLs

### 6.5 Security Audit
- [ ] Gọi API user A bằng token user B → phải 401/403
- [ ] Gọi API không có token → phải 401
- [ ] Truy cập Firestore rule trực tiếp (Firebase Console) → verify rules block
- [ ] Kiểm tra: không có API key/secret nào bị expose trong client code
- [ ] Check CORS headers

### 6.6 Performance Check
- [ ] Load 200 questions: phải < 3s
- [ ] Submit exam (50 câu): phải < 2s
- [ ] List subjects (20 subjects): phải < 1s
- [ ] Page load (login → home): phải < 2s
- [ ] Migration 100 questions: phải < 30s

---

## Session 6B: Deploy

### 6.7 Set Vercel Environment Variables
- [ ] Truy cập Vercel Dashboard → Settings → Environment Variables
- [ ] Thêm:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY` (⚠️ paste nguyên dùng `\n` trong key)
- [ ] Verify variables cho cả Production + Preview environments

### 6.8 Deploy to Vercel
- [ ] Push code lên main branch
- [ ] Verify Vercel auto-deploy trigger
- [ ] Check build logs: không lỗi
- [ ] Verify API routes hoạt động: `curl https://[domain]/api/health`
- [ ] Verify frontend load thành công

### 6.9 Firebase Production Config
- [ ] Firebase Console → verify Firestore rules đã deploy
- [ ] Authentication → verify providers enabled (Email + Google)
- [ ] Storage → verify rules cho phép user upload
- [ ] Optional: Enable App Check (chống API abuse)
- [ ] Optional: Set up Firestore backup schedule (daily)

### 6.10 Monitoring Setup
- [ ] Vercel Analytics → verify enabled (built-in)
- [ ] Firebase Console → check Usage & Billing
- [ ] Optional: Sentry integration cho error tracking
- [ ] Optional: Set up alerts cho quota warnings

### 6.11 Final Smoke Test (Production)
- [ ] Full E2E trên production URL (desktop Chrome)
- [ ] Full E2E trên mobile browser (responsive)
- [ ] Test Google OAuth trên production domain
- [ ] Share URL cho anh test trên điện thoại
- [ ] ✅ **SHIP IT!** 🚀

---

## Test Criteria Summary
| Test | Target | Status |
|------|--------|--------|
| E2E flow | Full cycle pass | ⬜ |
| Multi-user isolation | 100% data separation | ⬜ |
| Unauthorized access | All blocked (401/403) | ⬜ |
| Load 200 questions | < 3s | ⬜ |
| Submit exam | < 2s | ⬜ |
| Production accessible | URL works | ⬜ |
| Mobile responsive | UI correct | ⬜ |

---
🎉 **HOÀN THÀNH!** App đã sẵn sàng cho multi-user production.
