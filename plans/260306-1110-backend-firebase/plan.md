# Plan: Backend Firebase — Multi-user Quiz App

Created: 2026-03-06 11:10
Updated: 2026-03-08 21:50
Status: 🟡 Planning Complete — Sub-tasks detailed

## Overview
Chuyển đổi app Ôn Thi Trắc Nghiệm từ offline-only (Dexie/IndexedDB) sang hệ thống multi-user với cloud backend (Vercel Serverless + Firebase Auth + Firestore).

## Tech Stack
- **Frontend:** React 19 (Vite) — giữ nguyên
- **Backend:** Vercel Serverless Functions (API Routes)
- **Database:** Cloud Firestore (NoSQL)
- **Auth:** Firebase Authentication (Google + Email/Password)
- **Storage:** Firebase Storage (images)
- **Deploy:** Vercel

## Phases

| Phase | Name | Độ khó | Sub-tasks | Sessions | Status |
|-------|------|--------|-----------|----------|--------|
| 01 | Firebase Setup & Vercel Config | ⭐⭐ | 9 | 1 | ⬜ Pending |
| 02 | Auth System (Login/Register/Protect) | ⭐⭐⭐ | 10 | 2 (2A, 2B) | ⬜ Pending |
| 03 | Backend API Routes (CRUD + Exam) | ⭐⭐⭐⭐ | 20 | 3 (3A, 3B, 3C) | ⬜ Pending |
| 04 | Data Migration (Dexie → Firestore) | ⭐⭐⭐ | 11 | 2 (4A, 4B) | ⬜ Pending |
| 05 | Frontend Integration (Replace Dexie) | ⭐⭐⭐⭐ | 18 | 3 (5A, 5B, 5C) | ⬜ Pending |
| 06 | Testing & Production Deploy | ⭐⭐⭐ | 11 | 2 (6A, 6B) | ⬜ Pending |

**Tổng:** 79 sub-tasks | ~13 sessions

## Session Breakdown

| Session | Phase | Focus |
|---------|-------|-------|
| 1 | 01 | Firebase project + SDK + rules + smoke test |
| 2A | 02 | AuthContext + Login/Register/ForgotPassword UI |
| 2B | 02 | API init-user + api-client + MainLayout + routing |
| 3A | 03 | Firestore schema + Subjects API + PropertyOptions |
| 3B | 03 | Questions CRUD + Import + Status update |
| 3C | 03 | Exam generate/submit/results + Settings + Profile |
| 4A | 04 | MigrationService + ID mapping + upload API |
| 4B | 04 | Image migration + UI + fallback + verification |
| 5A | 05 | React Query + API hooks + QuestionBank + SubjectTree |
| 5B | 05 | Practice + Exam + CreateQuestion refactor |
| 5C | 05 | Remaining screens + ImportModal + Dexie cleanup |
| 6A | 06 | E2E + multi-user + edge cases + security + perf |
| 6B | 06 | Vercel deploy + Firebase config + monitoring |

## ⚠️ Git Policy
> **KHÔNG push lên git sau mỗi phase riêng lẻ.** Chỉ commit & push **sau khi hoàn thành toàn bộ 6 phases** và đã verify trên production.

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
