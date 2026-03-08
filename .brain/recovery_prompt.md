# Recovery Prompt

Read this file to restore context from previous session.

## Current State
- **Feature:** Fix Explanation Line Breaks
- **Phase:** DONE
- **Last Active:** 2026-03-08T08:16:37.227375

## Key Context
- PropertyOption types: 'term' (kỳ thi), 'level' (cấp độ), 'type' (loại môn)
- db.seedDefaultProperties() runs on app start, only inserts if table empty
- on('populate') seeds on fresh DB creation
- getQuestionsBySubjectRecursive uses recursive findChildren to collect all descendant IDs
- SubjectTree edit dialog uses useLiveQuery for real-time property options in dropdowns
- ZIP export in SubjectTree includes metadata + recursive questions + all images
