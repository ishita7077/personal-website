# Repo audit — MBA interview surfaces

## `/InterviewRoom`

| Area | Location |
|------|----------|
| Route | `app/InterviewRoom/route.ts` → `public/InterviewRoom/` |
| Content | `haas-data.js`, `config-haas.js`, Haas resources |
| AI | `POST /api/interview-room/enhanced-feedback` |

## `/mba-interview-room`

| Area | Location |
|------|----------|
| Route | `app/mba-interview-room/route.ts` → `public/MbaInterviewRoom/` |
| Data | `data/mba_interview_dataset/{school_id}/` via `GET /api/mba-interview-room/school/[id]` |
| Registry API | `GET /api/mba-interview-room/schools` (excludes `berkeley_haas`) |
| AI | `POST /api/mba-interview/enhanced-feedback` |

## Shared tooling

| Area | Location |
|------|----------|
| Loaders / types | `lib/mba-interview/*` |
| Dataset build | `npm run build:mba-dataset` → `scripts/build-mba-dataset.mjs` |
| Typed React flow (legacy) | `app/api/mba-interview/*`, `components/apps/mba-interview-prep/*` |

## Handoff inputs

- Structure and timing: `mba_final_handoff_static/deep-research-report (2).md`
- URLs: step4 secondary and step5 community CSVs per school

See **`docs/MBA_INTERVIEW_ARCHITECTURE.md`** for runbooks and subdomain notes.
