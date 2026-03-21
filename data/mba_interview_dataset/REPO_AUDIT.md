# Repo map — MBA interview surfaces

## `/InterviewRoom`

| Item | Location |
|------|-----------|
| Route | `app/InterviewRoom/[[...path]]/route.ts` → `public/InterviewRoom/index.html` |
| Assets | `public/InterviewRoom/` (`<base href="/InterviewRoom/">`) |
| AI (optional) | `POST /api/interview-room/enhanced-feedback` |

## `/mba-interview-room`

| Item | Location |
|------|-----------|
| Route | `app/mba-interview-room/[[...path]]/route.ts` → `public/MbaInterviewRoom/index.html` |
| Data | `data/mba_interview_dataset/{school_id}/` via `GET /api/mba-interview-room/school/[id]` |
| Registry | `GET /api/mba-interview-room/schools` |
| AI (optional) | `POST /api/mba-interview/enhanced-feedback` |

## Shared

| Item | Location |
|------|-----------|
| Loaders / types | `lib/mba-interview/*` |
| Dataset build | `npm run build:mba-dataset` → `scripts/build-mba-dataset.mjs` |
| Dataset checks | `npm run validate:mba-room` → `scripts/validate-mba-interview-room.mjs` |

See **`docs/MBA_INTERVIEW_ARCHITECTURE.md`** for deployment and local testing.
