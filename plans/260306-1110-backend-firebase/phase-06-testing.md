# Phase 06: Testing & Production Deploy

Status: ⬜ Pending
Độ khó: ⭐⭐⭐ Medium (3/5)
Dependencies: Phase 05
Sessions ước tính: 2

## Objective
Full testing của toàn bộ hệ thống, fix bugs, và deploy lần đầu lên production (Vercel).

## Implementation Steps

### Testing
1. [ ] **End-to-End Flow Test** — Đăng ký → Tạo bộ đề → Thêm câu hỏi → Thi thử → Xem kết quả
2. [ ] **Multi-user Isolation Test** — 2 accounts, verify data không "lẫn" nhau
3. [ ] **Edge Case Testing**
   - Mạng chập chờn (slow 3G)
   - Submit bài thi khi token hết hạn
   - Tạo câu hỏi với nội dung rất dài (gần 1MB)
   - Concurrent writes (2 tabs cùng lúc)
4. [ ] **Security Audit**
   - Thử truy cập data user khác trực tiếp (phải bị chặn)
   - Thử gọi API không có token (phải 401)
   - Kiểm tra Security Rules với Firebase Emulator
5. [ ] **Performance Testing**
   - Load 200 questions: phải < 3s
   - Submit exam: phải < 2s
   - List subjects: phải < 1s

### Deploy
6. [ ] **Vercel Production Deploy**
   - Set environment variables trên Vercel Dashboard
   - Deploy từ main branch
   - Verify API routes hoạt động trên production URL
7. [ ] **Firebase Production Config**
   - Switch từ Emulator → Production Firestore
   - Enable App Check (optional — chống abuse)
   - Set up Firestore backup schedule
8. [ ] **Monitoring & Logging**
   - Vercel Analytics (built-in)
   - Firebase Console monitoring
   - Error tracking (Sentry hoặc Vercel Error Monitoring)

## Test Criteria
- [ ] Full E2E flow pass trên cả desktop và mobile
- [ ] 2 user accounts hoàn toàn cách ly dữ liệu
- [ ] Unauthorized requests trả về 401
- [ ] Production deploy thành công, URL accessible
- [ ] API response times đạt target

---
🎉 **HOÀN THÀNH!** App đã sẵn sàng cho multi-user.
