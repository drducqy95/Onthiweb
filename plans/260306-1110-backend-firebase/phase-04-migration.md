# Phase 04: Data Migration (Dexie → Firestore)

Status: ⬜ Pending
Độ khó: ⭐⭐⭐ Medium (3/5)
Dependencies: Phase 03
Sessions ước tính: 2

## Objective
Xây dựng công cụ migration để chuyển dữ liệu từ Dexie (IndexedDB) offline lên Firestore khi user đăng nhập lần đầu.

## Implementation Steps

1. [ ] **Tạo `MigrationService.ts`** — Logic export Dexie → JSON
   - Đọc tất cả tables: subjects, questions, examResults, examConfigs, propertyOptions, userProfile
   - Map Dexie auto-increment IDs → Firestore document IDs
   - Xử lý foreign keys (subjectId references)

2. [ ] **Tạo `api/migration/upload.ts`** — API nhận data và write vào Firestore
   - Nhận JSON payload chứa tất cả collections
   - Validate structure
   - Batch write vào Firestore (respect 500 ops/batch limit)
   - Return progress + errors

3. [ ] **Tạo `MigrationScreen.tsx`** — UI cho user trigger migration
   - Hiển thị thống kê dữ liệu local (bao nhiêu subjects, questions...)
   - Nút "Đồng bộ lên Cloud"
   - Progress bar
   - Conflict resolution: nếu cloud đã có data → hỏi merge hoặc overwrite

4. [ ] **ID Mapping Layer** — Chuyển đổi Dexie IDs → Firestore IDs
   - Dexie dùng auto-increment number IDs
   - Firestore dùng string document IDs
   - Phải map tất cả references (question.subjectId, subject.parentId, examResult.questionIds)

5. [ ] **Image Migration** — Base64 → Firebase Storage
   - Questions có `image`, `explanationImage`, `optionImages` dưới dạng Base64
   - Upload lên Storage, lấy download URL
   - Update question documents với URLs mới

6. [ ] **Fallback Strategy**
   - Nếu migration fail giữa chừng → cleanup partial data
   - Cho phép retry
   - Giữ Dexie data không xóa cho đến khi migration hoàn tất

7. [ ] **Post-migration Cleanup**
   - Sau khi verify dữ liệu cloud đầy đủ
   - Chuyển app sang dùng API thay vì Dexie
   - Option: xóa Dexie data để giải phóng storage

## Files to Create/Modify
- `src/services/MigrationService.ts` — [NEW] Dexie export + ID mapping
- `api/migration/upload.ts` — [NEW] Bulk write API
- `src/screens/MigrationScreen.tsx` — [NEW] Migration UI
- `src/main.tsx` — [MODIFY] Add migration route

## Test Criteria
- [ ] Export toàn bộ Dexie data thành JSON thành công
- [ ] Upload lên Firestore giữ đúng relationships
- [ ] Images chuyển từ Base64 → Storage URLs thành công
- [ ] Migration 50 questions + 5 subjects hoàn thành trong < 30s
- [ ] Retry sau failure không tạo duplicate data

---
Next Phase: [phase-05-integration.md](./phase-05-integration.md)
