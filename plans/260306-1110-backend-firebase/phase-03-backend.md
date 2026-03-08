# Phase 03: Backend API Routes

Status: ⬜ Pending
Độ khó: ⭐⭐⭐⭐ Hard (4/5)
Dependencies: Phase 01, Phase 02
Sessions ước tính: 3

## Objective
Xây dựng toàn bộ Vercel Serverless API Routes cho CRUD subjects, questions, exam logic, settings, và profile.

## Implementation Steps

### Subjects API
1. [ ] `POST /api/subjects/create` — Tạo bộ đề mới
2. [ ] `GET /api/subjects/list` — Danh sách bộ đề (tree structure)
3. [ ] `PUT /api/subjects/update` — Cập nhật bộ đề
4. [ ] `DELETE /api/subjects/delete` — Xóa bộ đề + câu hỏi con (cascade)

### Questions API
5. [ ] `POST /api/questions/create` — Tạo câu hỏi (+ increment counter)
6. [ ] `GET /api/questions/list` — Load câu hỏi theo subjectId (+ recursive)
7. [ ] `PUT /api/questions/update` — Cập nhật câu hỏi
8. [ ] `DELETE /api/questions/delete` — Xóa câu hỏi (+ decrement counter)
9. [ ] `POST /api/questions/import` — Import hàng loạt từ JSON/ZIP

### Exam API
10. [ ] `POST /api/exam/generate` — Tạo đề thi từ config (random selection)
11. [ ] `POST /api/exam/submit` — Nộp bài + chấm điểm + lưu lịch sử
12. [ ] `GET /api/exam/results` — Lịch sử thi (paginated) + chi tiết bài thi

## Files to Create
```
api/
├── subjects/
│   ├── create.ts
│   ├── list.ts
│   ├── update.ts
│   └── delete.ts
├── questions/
│   ├── create.ts
│   ├── list.ts
│   ├── update.ts
│   ├── delete.ts
│   └── import.ts
├── exam/
│   ├── generate.ts
│   ├── submit.ts
│   └── results.ts
└── settings/
    └── update.ts
```

## Ghi chú kỹ thuật

### Cascade Delete
Khi xóa subject, phải xóa tất cả câu hỏi thuộc subject đó (và child subjects nếu có). Dùng **batch delete** với Firestore batched writes (max 500 operations/batch).

### Exam Generate Logic
1. Nhận `SubjectConfig[]` (subjectId + count)
2. Với mỗi subject: query questions, random shuffle, slice(0, count)
3. Return `questionIds[]` + `totalTime`
4. Client lưu vào Zustand ExamStore (giữ client-side state)

### Import API
- Nhận JSON array of questions
- Validate từng câu
- Batch write (max 500/batch)
- Return `{ imported: N, errors: [...] }`

## Test Criteria
- [ ] CRUD subjects thành công (create, read, update, delete)
- [ ] CRUD questions thành công
- [ ] Import 50 câu hỏi từ JSON trong < 5s
- [ ] Generate đề thi random đúng số lượng
- [ ] Submit bài thi: chấm điểm chính xác,lưu result
- [ ] Cascade delete: xóa subject → xóa hết questions
- [ ] Error handling: 400 cho bad input, 401 cho unauthorized

---
Next Phase: [phase-04-migration.md](./phase-04-migration.md)
