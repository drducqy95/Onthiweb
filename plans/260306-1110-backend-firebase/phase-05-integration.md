# Phase 05: Frontend Integration (Replace Dexie → API)

Status: ⬜ Pending
Độ khó: ⭐⭐⭐⭐ Hard (4/5)
Dependencies: Phase 03, Phase 04
Sessions ước tính: 3

## Objective
Thay thế tất cả Dexie calls trong frontend bằng API calls tới Vercel backend. Giữ nguyên UI/UX.

## Implementation Steps

1. [ ] **Tạo `DataProvider` context** — Abstract data layer
   - Cung cấp interface giống Dexie nhưng gọi API
   - Caching layer (React Query hoặc SWR)
   - Loading states + error handling

2. [ ] **Refactor `QuestionBankScreen`** — subjects list từ API
   - `useLiveQuery` → `useQuery` (React Query)
   - SubjectTree dùng API data

3. [ ] **Refactor `QuestionDetailScreen`** — questions CRUD từ API
   - Load questions by subjectId từ API
   - Create/Edit/Delete qua API

4. [ ] **Refactor `PracticeScreen`** — questions + status updates từ API
   - Load questions recursive từ API
   - Update question status qua API sau khi trả lời

5. [ ] **Refactor `ExamScreen`** — exam generate + submit qua API
   - Generate đề thi qua API (thay vì client-side random)
   - Submit bài thi qua API
   - Kết quả trả về từ server (chấm điểm server-side)

6. [ ] **Refactor `ReviewExamScreen`** — load results từ API
   - Fetch exam result + questions qua API

7. [ ] **Refactor `HistoryScreen`** — paginated results từ API

8. [ ] **Refactor `SettingsScreen`** — sync settings qua API
   - Save settings → PUT /api/settings/update
   - Load settings từ user document

9. [ ] **Refactor `CreateQuestionScreen`** — create/edit qua API

10. [ ] **Refactor `ProgressDashboardScreen`** — aggregated stats từ API

## Files to Modify
- `src/screens/QuestionBankScreen.tsx` — Dexie → API
- `src/screens/QuestionDetailScreen.tsx` — Dexie → API
- `src/screens/PracticeScreen.tsx` — Dexie → API
- `src/screens/ExamScreen.tsx` — Dexie → API
- `src/screens/ReviewExamScreen.tsx` — Dexie → API
- `src/screens/HistoryScreen.tsx` — Dexie → API
- `src/screens/SettingsScreen.tsx` — Zustand persist → API
- `src/screens/CreateQuestionScreen.tsx` — Dexie → API
- `src/screens/ProgressDashboardScreen.tsx` — Dexie → API

## Ghi chú kỹ thuật

### Caching Strategy (React Query)
- `staleTime: 5 * 60 * 1000` (5 phút)
- Invalidate cache sau mutations (create/update/delete)
- Optimistic updates cho UX tốt hơn

### Offline Support (Optional — Phase sau)
- React Query có `persistQueryClient` plugin
- Có thể giữ Dexie làm offline cache layer
- Sync lên server khi có mạng

## Test Criteria
- [ ] Tất cả CRUD operations hoạt động qua API
- [ ] UI không thay đổi (user không nhận ra sự khác biệt)
- [ ] Loading states hiển thị khi fetch data
- [ ] Error messages hiển thị khi API fail
- [ ] Cache invalidation đúng sau mutations

---
Next Phase: [phase-06-testing.md](./phase-06-testing.md)
