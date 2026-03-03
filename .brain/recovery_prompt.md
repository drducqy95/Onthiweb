# Recovery Prompt - Onthiweb

## Last Session: 2026-03-03T11:21:00+07:00

## What Was Done
Fixed 6 major issues in this session:

1. **Property Dropdown Sync (Bug 1)** - `ManageExamsScreen` + `PracticeSelectionScreen` dropdowns now use `useLiveQuery` on `propertyOptions` instead of hardcoded values
2. **Parent Subject Questions (Bug 2)** - `QuestionDetailScreen` uses `db.getQuestionsBySubjectRecursive()` to load all child questions
3. **Edit Subject Dialog (Bug 3)** - `SubjectTree` has new edit dialog with name/examTerm/level/type fields + live property dropdowns
4. **Background Transparency (Bug 4)** - Reduced opacity across 7 files for better background image visibility
5. **Filter Systems Added** - `ExamSelectionScreen` Tự chọn tab and `QuestionBankScreen` now have full filter dropdowns (Kỳ thi, Cấp độ, Loại, Môn gốc toggle) synced with `propertyOptions`
6. **Default Property Seed Data** - Added 15 defaults in `db.ts`: 4 kỳ thi, 6 cấp độ, 5 loại môn. Auto-seeds on app start if table empty.
7. **ZIP Export** - Added to `SubjectTree` context menu and edit dialog, exports metadata + recursive questions + images

## Key Files Modified
- `src/db.ts` - Added DEFAULT_PROPERTIES, seedDefaultProperties(), on('populate')
- `src/screens/ManageExamsScreen.tsx` - Live property dropdowns
- `src/screens/PracticeSelectionScreen.tsx` - Merged propertyOptions + subject values
- `src/screens/ExamSelectionScreen.tsx` - Full filter system added to Tự chọn tab
- `src/screens/QuestionBankScreen.tsx` - Full filter system + tree/flat switching
- `src/screens/QuestionDetailScreen.tsx` - Recursive question loading
- `src/components/SubjectTree.tsx` - Edit dialog + ZIP export
- `src/components/MainLayout.tsx` - Reduced opacity /80→/60

## Architecture Notes
- PropertyOption types: 'term', 'level', 'type'
- All filter screens merge `propertyOptions` DB + subject-derived values via `useMemo`
- `db.seedDefaultProperties()` called via `db.open().then(...)` in db.ts

## To Resume
Run `/recap` to load full context.
