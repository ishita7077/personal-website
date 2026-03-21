# MBA interview products (architecture)

Two entry points share the same UX patterns (device check, timers, recording, transcription, review) but use different static bundles and APIs.

| Path | Bundle | Data |
|------|--------|------|
| **`/InterviewRoom`** | `public/InterviewRoom/` | Standalone Haas practice (`haas-data.js`, `config-haas.js` in this bundle) |
| **`/mba-interview-room`** | `public/MbaInterviewRoom/` | Ten programmes (including Haas): `data/mba_interview_dataset/{school}/` via `/api/mba-interview-room/*` |

Berkeley Haas in the MBA Interview Room uses the same card → fetch bundle → session flow as every other school. The separate `/InterviewRoom` app remains available for the original single-school Haas experience.

## APIs

- **`GET /api/mba-interview-room/schools`** — Full school registry (includes `berkeley_haas`).
- **`GET /api/mba-interview-room/school/[id]`** — `interview_room.json`, question pool, `school_meta.json`, `answerFrameworkMd` for any registered id.
- **`POST /api/mba-interview/enhanced-feedback`** — Optional OpenAI feedback for the multi-school app.
- **`POST /api/interview-room/enhanced-feedback`** — Optional OpenAI feedback for `/InterviewRoom`.

## Dataset

- Build: `npm run build:mba-dataset` → `data/mba_interview_dataset/`.
- Inputs: `mba_final_handoff_static/` (report **(2)** for MBA structure, step4/step5 CSVs).
- Haas question text is still sourced in the build script from `public/InterviewRoom/src/js/haas-data.js` (canonical copy for regeneration).
- `school_registry.json` includes a `listing` object per school for marketing cards.
- `interview_room.json` holds default `prepTime` / `answerTime` / `totalQuestions`; `question_bank.json` may set `prep_time_seconds` / `answer_time_seconds` per prompt (video, Kira, etc.).

## Optional subdomain

Expose e.g. `mba.example.com` by pointing DNS at your deployment and rewriting `/` to `/mba-interview-room` (or redirect), depending on your host.

## Local testing

1. `npm install` — add `OPENAI_API_KEY` in `.env.local` if testing optional feedback.
2. `npm run build:mba-dataset` when the dataset build script or its inputs change.
3. `npm run dev` — open `/mba-interview-room` and `/InterviewRoom`; confirm sessions and Resources.
4. `npm run validate:mba-room` — dataset and session-order checks.
5. `npm run check` before release.

`npm run typecheck` runs `next typegen` then `tsc` (needed after a clean `.next`).

Do not open `public/MbaInterviewRoom/index.html` as a `file://` URL; APIs and `<base href>` require the Next server.

## Contributor copy (user-facing)

- Prefer neutral product language in UI: programme, practice session, official links, optional feedback.
- Keep implementation filenames and internal build paths out of applicant-visible strings (developer docs and this file are fine).

## Change boundaries

- Haas standalone: `public/InterviewRoom/`, `app/InterviewRoom/[[...path]]/route.ts`.
- Multi-school: `public/MbaInterviewRoom/`, `app/mba-interview-room/[[...path]]/route.ts`, `app/api/mba-interview-room/`, `lib/mba-interview/`, `data/mba_interview_dataset/`, `scripts/build-mba-dataset.mjs`, `scripts/validate-mba-interview-room.mjs`.
