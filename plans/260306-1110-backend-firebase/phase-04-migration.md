# Phase 04: Data Migration (Dexie → Firestore)

Status: ⬜ Pending
Độ khó: ⭐⭐⭐ Medium (3/5)
Dependencies: Phase 03
Sessions ước tính: 2

## Objective
Xây dựng công cụ migration để chuyển dữ liệu từ Dexie (IndexedDB) offline lên Firestore khi user đăng nhập lần đầu.

---

## Session 4A: Migration Service + API

### 4.1 MigrationService — Export Dexie
- [ ] Tạo `src/services/MigrationService.ts`
- [ ] Đọc tất cả Dexie tables:
  - `subjects` → array
  - `questions` → array
  - `examConfigs` → array
  - `examResults` → array
  - `propertyOptions` → array
  - `userProfile` → object
  - `reminders` → array
- [ ] Return structured JSON object
- [ ] Log thống kê: N subjects, N questions, N images

### 4.2 ID Mapping Layer
- [ ] Dexie dùng auto-increment `number` IDs
- [ ] Firestore dùng `string` document IDs
- [ ] Tạo mapping: `Map<number, string>` (oldId → newFirestoreId)
- [ ] Remap tất cả references:
  - `question.subjectId` → new subject ID
  - `subject.parentId` → new parent subject ID
  - `examResult.questionIds[]` → new question IDs
  - `examResult.userAnswers` keys → new question IDs
  - `examConfig.subjects[].subjectId` → new subject IDs

### 4.3 API upload — Subjects
- [ ] Tạo `api/migration/upload.ts`
- [ ] Endpoint nhận `{ subjects: [...] }`
- [ ] Batch write vào `users/{uid}/subjects`
- [ ] Return ID mapping `{ [oldId]: newFirestoreId }`

### 4.4 API upload — Questions
- [ ] Nhận `{ questions: [...], subjectIdMap: {...} }`
- [ ] Remap `subjectId` dùng map
- [ ] Batch write (chunk 500 per batch)
- [ ] Return question ID mapping

### 4.5 API upload — ExamConfigs + ExamResults
- [ ] Nhận `{ examConfigs, examResults, idMaps }`
- [ ] Remap `subjectId`, `questionIds`, `userAnswers` keys
- [ ] Batch write

### 4.6 API upload — PropertyOptions + UserProfile
- [ ] Simple batch write (không cần remap)
- [ ] PropertyOptions → `users/{uid}/propertyOptions`
- [ ] UserProfile → merge vào `users/{uid}` document

---

## Session 4B: Image Migration + UI + Fallback

### 4.7 Image Migration
- [ ] Tạo `src/services/ImageMigrationService.ts`
- [ ] Scan tất cả questions cho Base64 images:
  - `question.image` (câu hỏi)
  - `question.explanationImage` (giải thích)
  - `question.optionImages[]` (đáp án)
- [ ] Upload từng image → Firebase Storage (`users/{uid}/images/{questionId}/{field}`)
- [ ] Lấy download URL → update question document
- [ ] Progress tracking: `uploadedImages / totalImages`
- [ ] ⚠️ Skip nếu image đã là URL (không phải Base64)

### 4.8 MigrationScreen UI
- [ ] Tạo `src/screens/MigrationScreen.tsx`
- [ ] Hiển thị thống kê dữ liệu local:
  - `📦 X bộ đề | 📝 Y câu hỏi | 🖼️ Z hình ảnh`
- [ ] Nút **"Đồng bộ lên Cloud"**
- [ ] Progress bar multi-step:
  1. ⬜ Subjects (N)
  2. ⬜ Questions (N)
  3. ⬜ Images (N)
  4. ⬜ Exam Configs (N)
  5. ⬜ Exam Results (N)
- [ ] Error list nếu có vấn đề
- [ ] Conflict resolution: nếu cloud đã có data → dialog "Merge hoặc Overwrite?"

### 4.9 Fallback & Retry
- [ ] Nếu migration fail giữa chừng:
  - Log điểm fail (step + item)
  - Cho phép "Tiếp tục từ điểm dừng"
  - ⚠️ KHÔNG xóa Dexie data cho đến khi verify thành công
- [ ] Retry button nếu network error
- [ ] Cleanup partial data nếu user chọn "Hủy và thử lại"

### 4.10 Post-migration verification
- [ ] So sánh count: Dexie subjects vs Firestore subjects
- [ ] So sánh count: Dexie questions vs Firestore questions
- [ ] Spot-check random 5 questions: content match
- [ ] Mark `users/{uid}.migrationStatus = "completed"`
- [ ] Toast: "✅ Đồng bộ thành công! X bộ đề, Y câu hỏi"

### 4.11 Thêm migration route
- [ ] Sửa `src/main.tsx` — thêm route `/migration`
- [ ] Hiện nút "Đồng bộ dữ liệu" trong HomeScreen nếu:
  - User có data local trong Dexie
  - `migrationStatus != "completed"`

---

## Files to Create/Modify
| File | Action | Purpose |
|------|--------|---------|
| `src/services/MigrationService.ts` | NEW | Dexie export + ID mapping |
| `src/services/ImageMigrationService.ts` | NEW | Base64 → Storage upload |
| `api/migration/upload.ts` | NEW | Bulk write API |
| `src/screens/MigrationScreen.tsx` | NEW | Migration UI |
| `src/main.tsx` | MODIFY | Add migration route |

---
Next Phase: [phase-05-integration.md](./phase-05-integration.md)
