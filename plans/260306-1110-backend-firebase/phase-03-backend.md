# Phase 03: Backend API Routes

Status: ⬜ Pending
Độ khó: ⭐⭐⭐⭐ Hard (4/5)
Dependencies: Phase 01, Phase 02
Sessions ước tính: 3

## Objective
Xây dựng toàn bộ Vercel Serverless API Routes cho CRUD subjects, questions, exam logic, settings, và profile.

---

## Session 3A: Subjects + Property Options API

### 3.1 Thiết kế Firestore Schema
- [ ] Document cấu trúc collections:
  ```
  users/{uid}/
  ├── subjects/{subjectId}     → { name, level, type, examTerm, parentId, createdAt }
  ├── questions/{questionId}   → { subjectId, content, questionType, options, ... }
  ├── examConfigs/{configId}   → { name, examTerm, level, subjects[] }
  ├── examResults/{resultId}   → { score, timestamp, questionIds, userAnswers, ... }
  └── propertyOptions/{optId}  → { name, type }
  ```
- [ ] Quyết định: subcollection dưới user (✅ isolation tự nhiên)
- [ ] Document trong plan folder

### 3.2 API helper utilities
- [ ] Tạo `api/lib/response-helpers.ts`
- [ ] `jsonResponse(data, status=200)` → `NextResponse.json()`
- [ ] `errorResponse(message, status)` → standardized error format `{ error: message }`
- [ ] `withAuth(handler)` → wrapper tự động verify token + inject `userId`
- [ ] Type definitions cho API request/response

### 3.3 POST /api/subjects/create
- [ ] Tạo `api/subjects/create.ts`
- [ ] Verify auth → lấy `userId`
- [ ] Validate: `name` required (string, non-empty)
- [ ] Set defaults: `createdAt: serverTimestamp()`, `parentId: null`
- [ ] Write vào `users/{userId}/subjects`
- [ ] Return `{ id, ...subjectData }`

### 3.4 GET /api/subjects/list
- [ ] Tạo `api/subjects/list.ts`
- [ ] Query tất cả subjects của user
- [ ] Return flat array (client build tree từ parentId)
- [ ] Optional: `?parentId=xxx` filter

### 3.5 PUT /api/subjects/update
- [ ] Tạo `api/subjects/update.ts`
- [ ] Body: `{ id, name?, examTerm?, level?, type?, parentId? }`
- [ ] Verify document thuộc user
- [ ] Update chỉ fields được gửi (merge)

### 3.6 DELETE /api/subjects/delete (Cascade)
- [ ] Tạo `api/subjects/delete.ts`
- [ ] Recursive find children:
  - Query `subjects` where `parentId == targetId`
  - Recursively find tất cả descendants
- [ ] Collect tất cả subjectIds (self + descendants)
- [ ] Batch delete:
  - Xóa tất cả questions thuộc các subjectIds
  - Xóa tất cả subject documents
  - Chunk 500 operations/batch (Firestore limit)
- [ ] Return `{ deletedSubjects: N, deletedQuestions: N }`

### 3.7 Property Options API
- [ ] Tạo `api/property-options.ts` (multi-method handler)
- [ ] GET → list all propertyOptions của user
- [ ] POST → create new option `{ name, type }`
- [ ] DELETE → delete option by id

---

## Session 3B: Questions API

### 3.8 POST /api/questions/create
- [ ] Tạo `api/questions/create.ts`
- [ ] Validate:
  - `content` required (non-empty string)
  - `subjectId` required (verify subject exists & belongs to user)
  - `questionType` ∈ `['MULTIPLE_CHOICE', 'TRUE_FALSE', 'TRUE_FALSE_TABLE']`
  - MC: `options.length >= 2`, `correctAnswers` valid letters
  - TF_TABLE: `subQuestions.length == subAnswers.length`
- [ ] Set defaults: `status: 0`, `createdAt: serverTimestamp()`
- [ ] Handle images: nếu có `image`/`explanationImage`/`optionImages` → expect Storage URLs (upload riêng)
- [ ] Return `{ id, ...questionData }`

### 3.9 GET /api/questions/list
- [ ] Tạo `api/questions/list.ts`
- [ ] Params: `subjectId` (required), `recursive` (boolean), `limit`, `startAfter`
- [ ] Nếu `recursive=true`:
  - Lấy tất cả descendant subjectIds
  - Query questions where `subjectId` in `[...allIds]`
  - ⚠️ Firestore `in` operator max 30 values → chunk nếu cần
- [ ] Nếu `recursive=false`: query trực tiếp `subjectId == param`
- [ ] Pagination: `orderBy('createdAt')`, `startAfter(cursor)`, `limit(N)`
- [ ] Return `{ questions: [...], nextCursor? }`

### 3.10 PUT /api/questions/update
- [ ] Tạo `api/questions/update.ts`
- [ ] Body: `{ id, ...fieldsToUpdate }`
- [ ] Validate questionType-specific fields (same as create)
- [ ] Verify question belongs to user (via subjectId → subject → user)
- [ ] Merge update

### 3.11 DELETE /api/questions/delete
- [ ] Tạo `api/questions/delete.ts`
- [ ] Verify question belongs to user
- [ ] Xóa images từ Storage nếu có (image, explanationImage, optionImages)
- [ ] Delete document

### 3.12 POST /api/questions/import
- [ ] Tạo `api/questions/import.ts`
- [ ] Body: `{ subjectId, questions: [...] }`
- [ ] Validate từng question (same rules as create)
- [ ] Batch write — chunk 500 operations
- [ ] Return `{ imported: N, errors: [{ index, message }] }`
- [ ] Timeout handling: nếu > 50 questions → process in chunks with progress

### 3.13 PUT /api/questions/update-status
- [ ] Tạo `api/questions/update-status.ts`
- [ ] Body: `{ updates: [{ id, status }] }` (status: 0|1|2)
- [ ] Batch update trong 1 transaction
- [ ] Dùng sau Practice mode (batch update mastered/wrong)

---

## Session 3C: Exam + Settings + User Profile API

### 3.14 POST /api/exam/generate
- [ ] Tạo `api/exam/generate.ts`
- [ ] Body: `{ configs: SubjectConfig[] }` — mỗi config = `{ subjectId, count, time }`
- [ ] Với mỗi config:
  - Query questions by subjectId (recursive)
  - Shuffle (Fisher-Yates)
  - Slice(0, count)
- [ ] Return `{ questions: [...fullQuestionData], totalTime }`
- [ ] ⚠️ Không trả `correctAnswers` nếu muốn chấm server-side (hoặc trả nếu chấm client-side)

### 3.15 POST /api/exam/submit
- [ ] Tạo `api/exam/submit.ts`
- [ ] Body: `{ sessionId, examName, configs, questionIds, userAnswers, userSubAnswers, isMultiSubject? }`
- [ ] Server-side chấm điểm:
  - Fetch questions by IDs
  - So sánh `userAnswers` vs `correctAnswers`
  - Tính score per subject + global
- [ ] Tạo `examResults` document
- [ ] Return `{ resultId, score, correctCount, totalQuestions, subjectResults?, passed? }`

### 3.16 GET /api/exam/results
- [ ] Tạo `api/exam/results.ts`
- [ ] `GET /api/exam/results` → list (paginated, ordered by timestamp desc)
  - Params: `limit`, `startAfter`
  - Return summary (không include full questions)
- [ ] `GET /api/exam/results?id=xxx` → chi tiết 1 bài thi
  - Include full question data (nội dung + đáp án)

### 3.17 Exam Configs API
- [ ] Tạo `api/exam/configs.ts` (multi-method)
- [ ] GET → list exam configs
- [ ] POST → create config `{ name, examTerm, level, subjects[] }`
- [ ] PUT → update config
- [ ] DELETE → delete config

### 3.18 PUT /api/settings/update
- [ ] Tạo `api/settings/update.ts`
- [ ] Body: settings object (darkMode, fontSize, fontFamily, primaryColor, shuffleQuestions, etc.)
- [ ] Merge vào `users/{uid}.settings`

### 3.19 GET /api/settings
- [ ] Tạo `api/settings/get.ts`
- [ ] Return `users/{uid}.settings` field
- [ ] Default values nếu settings chưa tồn tại

### 3.20 User Profile API
- [ ] Tạo `api/user/profile.ts` (multi-method)
- [ ] GET → return profile (fullName, gender, birthYear, educationLevel, avatar)
- [ ] PUT → update profile fields
- [ ] Avatar: expect Storage URL (upload riêng từ client)

---

## Files to Create
```
api/
├── lib/
│   └── response-helpers.ts
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
│   ├── import.ts
│   └── update-status.ts
├── exam/
│   ├── generate.ts
│   ├── submit.ts
│   ├── results.ts
│   └── configs.ts
├── settings/
│   ├── update.ts
│   └── get.ts
├── user/
│   └── profile.ts
└── property-options.ts
```

---
Next Phase: [phase-04-migration.md](./phase-04-migration.md)
