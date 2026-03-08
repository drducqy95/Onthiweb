# Phase 05: Frontend Integration (Replace Dexie → API)

Status: ⬜ Pending
Độ khó: ⭐⭐⭐⭐ Hard (4/5)
Dependencies: Phase 03, Phase 04
Sessions ước tính: 3

## Objective
Thay thế tất cả Dexie calls trong frontend bằng API calls tới Vercel backend. Giữ nguyên UI/UX.

---

## Session 5A: Data Layer + Question Bank

### 5.1 Cài React Query
- [ ] `npm install @tanstack/react-query`
- [ ] Wrap app với `<QueryClientProvider>` trong `main.tsx`
- [ ] Config defaults:
  - `staleTime: 5 * 60 * 1000` (5 phút)
  - `retry: 2`
  - `refetchOnWindowFocus: false`

### 5.2 Tạo API hooks layer
- [ ] Tạo `src/hooks/useSubjects.ts`
  - `useSubjects()` → GET /api/subjects/list
  - `useCreateSubject()` → POST + invalidate
  - `useUpdateSubject()` → PUT + invalidate
  - `useDeleteSubject()` → DELETE + invalidate subjects + questions cache
- [ ] Tạo `src/hooks/useQuestions.ts`
  - `useQuestions(subjectId, recursive?)` → GET /api/questions/list
  - `useCreateQuestion()` → POST + invalidate
  - `useUpdateQuestion()` → PUT + invalidate
  - `useDeleteQuestion()` → DELETE + invalidate
  - `useImportQuestions()` → POST /api/questions/import
  - `useUpdateQuestionStatus()` → PUT /api/questions/update-status
- [ ] Tạo `src/hooks/useExam.ts`
  - `useGenerateExam()` → POST /api/exam/generate
  - `useSubmitExam()` → POST /api/exam/submit
  - `useExamResults(page?)` → GET /api/exam/results
  - `useExamResult(id)` → GET /api/exam/results?id=xxx
- [ ] Tạo `src/hooks/useSettings.ts`
  - `useSettings()` → GET /api/settings
  - `useUpdateSettings()` → PUT + invalidate

### 5.3 Refactor QuestionBankScreen
- [ ] Replace `useLiveQuery(() => db.subjects.toArray())` → `useSubjects()`
- [ ] Handle loading state (skeleton/spinner)
- [ ] Handle error state (toast/retry button)
- [ ] Verify SubjectTree still renders correctly

### 5.4 Refactor SubjectTree
- [ ] Context menu "Tạo bộ đề con" → `useCreateSubject()`
- [ ] Context menu "Chỉnh sửa" → `useUpdateSubject()`
- [ ] Context menu "Xóa" → `useDeleteSubject()`
- [ ] Export ZIP → fetch questions from API instead of Dexie
- [ ] Edit dialog: property options → `usePropertyOptions()` hook
- [ ] ⚠️ Import ZIP upload: images → Storage, questions → API

### 5.5 Refactor QuestionDetailScreen
- [ ] Replace `useLiveQuery` → `useQuestions(subjectId, { recursive: true })`
- [ ] Flash card navigation giữ nguyên (local state)
- [ ] Search/filter giữ nguyên (filter client-side trên cached data)
- [ ] Delete question → `useDeleteQuestion()` + cache invalidation

---

## Session 5B: Practice + Exam + Create Question

### 5.6 Refactor CreateQuestionScreen
- [ ] `db.questions.add()` → `useCreateQuestion().mutateAsync()`
- [ ] `db.questions.update()` → `useUpdateQuestion().mutateAsync()`
- [ ] `db.questions.get(id)` → `useQuestion(id)` hoặc fetch 1 lần
- [ ] Image upload flow:
  1. User chọn ảnh → preview local (FileReader)
  2. On save → upload ảnh lên Firebase Storage
  3. Lấy download URL → gửi cùng question data tới API
- [ ] ⚠️ `useLiveQuery` property options → `usePropertyOptions()`

### 5.7 Refactor PracticeSelectionScreen
- [ ] Replace `useLiveQuery(db.subjects)` → `useSubjects()`
- [ ] Replace `useLiveQuery(db.propertyOptions)` → `usePropertyOptions()`
- [ ] Filter logic giữ nguyên (client-side)

### 5.8 Refactor PracticeScreen
- [ ] Load questions: `db.getQuestionsBySubjectRecursive()` → `useQuestions(id, { recursive })`
- [ ] Update question status sau practice:
  - Collect `{ id, status }` cho mỗi câu đã trả lời
  - Batch call `useUpdateQuestionStatus()`
- [ ] ⚠️ Giữ nguyên QuestionView, QuestionNav, useSwipeNavigation

### 5.9 Refactor ExamSelectionScreen
- [ ] Subjects list → `useSubjects()`
- [ ] Exam configs → `useExamConfigs()`
- [ ] Property options → `usePropertyOptions()`
- [ ] Filter logic giữ nguyên

### 5.10 Refactor ManageExamsScreen
- [ ] ExamConfig CRUD → `useExamConfigs()` + mutations
- [ ] Property options dropdown → `usePropertyOptions()`
- [ ] `useLiveQuery(db.examConfigs)` → `useExamConfigs()`

### 5.11 Refactor ExamScreen
- [ ] Generate exam: client-side random → `useGenerateExam().mutateAsync(configs)`
  - Server returns questions data → set vào ExamStore
- [ ] Submit exam: `useSubmitExam().mutateAsync(examData)`
  - Server chấm điểm → return result
  - Không cần client-side save vào Dexie nữa
- [ ] ⚠️ Zustand ExamStore giữ nguyên cho client-side state (timer, answers)

---

## Session 5C: Remaining Screens + Cleanup

### 5.12 Refactor ReviewExamScreen
- [ ] Load exam result: `db.examResults.get(id)` → `useExamResult(id)`
- [ ] Load questions for review → data included in exam result API response
- [ ] ⚠️ QuestionView rendering giữ nguyên

### 5.13 Refactor HistoryScreen
- [ ] `useLiveQuery(db.examResults)` → `useExamResults(page)`
- [ ] Implement "Load more" pagination
- [ ] Delete result → API mutation

### 5.14 Refactor ProgressDashboardScreen
- [ ] Question stats (mastered/wrong/new) → computed from `useQuestions()` cached data
- [ ] Hoặc tạo API endpoint riêng: `GET /api/stats/progress`
- [ ] Practice history chart → from `useExamResults()`

### 5.15 Refactor SettingsScreen
- [ ] Load settings: Zustand persist → `useSettings()` from API
- [ ] Save settings: Zustand setter → `useUpdateSettings().mutateAsync()`
- [ ] Background image:
  - Upload → Firebase Storage
  - Save URL vào settings
  - Load → download from Storage URL
- [ ] ⚠️ Keep Zustand for local-only preferences (tạm thời) nếu cần

### 5.16 Refactor PropertySettingsScreen
- [ ] `useLiveQuery(db.propertyOptions)` → `usePropertyOptions()`
- [ ] Add/Delete → API mutations

### 5.17 Refactor ImportModal
- [ ] DOCX import logic giữ nguyên (client-side parsing)
- [ ] Sau parse → upload images lên Storage trước
- [ ] Gọi `POST /api/questions/import` với Storage URLs thay vì Base64
- [ ] Progress: parse → upload images → import questions

### 5.18 Cleanup Dexie
- [ ] Đánh dấu `src/db.ts` deprecated (comment header)
- [ ] Giữ code cho: migration fallback + offline mode tương lai
- [ ] Remove `dexie` từ import trong tất cả screens đã refactor
- [ ] Remove `useLiveQuery` imports
- [ ] Verify: app hoạt động 100% qua API, không còn gọi Dexie trực tiếp

---

## Files to Create/Modify
| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useSubjects.ts` | NEW | API hooks cho subjects |
| `src/hooks/useQuestions.ts` | NEW | API hooks cho questions |
| `src/hooks/useExam.ts` | NEW | API hooks cho exam |
| `src/hooks/useSettings.ts` | NEW | API hooks cho settings |
| `src/screens/QuestionBankScreen.tsx` | MODIFY | Dexie → API |
| `src/components/SubjectTree.tsx` | MODIFY | Dexie → API |
| `src/screens/QuestionDetailScreen.tsx` | MODIFY | Dexie → API |
| `src/screens/CreateQuestionScreen.tsx` | MODIFY | Dexie → API |
| `src/screens/PracticeSelectionScreen.tsx` | MODIFY | Dexie → API |
| `src/screens/PracticeScreen.tsx` | MODIFY | Dexie → API |
| `src/screens/ExamSelectionScreen.tsx` | MODIFY | Dexie → API |
| `src/screens/ManageExamsScreen.tsx` | MODIFY | Dexie → API |
| `src/screens/ExamScreen.tsx` | MODIFY | Dexie → API |
| `src/screens/ReviewExamScreen.tsx` | MODIFY | Dexie → API |
| `src/screens/HistoryScreen.tsx` | MODIFY | Dexie → API |
| `src/screens/ProgressDashboardScreen.tsx` | MODIFY | Dexie → API |
| `src/screens/SettingsScreen.tsx` | MODIFY | Dexie → API |
| `src/screens/PropertySettingsScreen.tsx` | MODIFY | Dexie → API |
| `src/components/ImportModal.tsx` | MODIFY | Dexie → API |
| `src/db.ts` | MODIFY | Mark deprecated |

---
Next Phase: [phase-06-testing.md](./phase-06-testing.md)
