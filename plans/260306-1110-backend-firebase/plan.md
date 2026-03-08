# Plan: Backend Firebase — Multi-user Quiz App

Created: 2026-03-06 11:10
Status: 🟡 Planning Complete

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

| Phase | Name | Độ khó | Status | Sessions |
|-------|------|--------|--------|----------|
| 01 | Firebase Setup & Vercel Config | ⭐⭐ | ⬜ Pending | 1 |
| 02 | Auth System (Login/Register/Protect) | ⭐⭐⭐ | ⬜ Pending | 2 |
| 03 | Backend API Routes (CRUD + Exam) | ⭐⭐⭐⭐ | ⬜ Pending | 3 |
| 04 | Data Migration (Dexie → Firestore) | ⭐⭐⭐ | ⬜ Pending | 2 |
| 05 | Frontend Integration (Replace Dexie calls) | ⭐⭐⭐⭐ | ⬜ Pending | 3 |
| 06 | Testing & Production Deploy | ⭐⭐⭐ | ⬜ Pending | 2 |

**Tổng:** 51 tasks | ~13 sessions

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
