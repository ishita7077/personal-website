# MBA interview products (architecture)

Two entry points share the same UX patterns (device check, timers, recording, transcription, review) but use different static bundles and APIs.

| Path | Bundle | Data |
|------|--------|------|
| **`/InterviewRoom`** | `public/InterviewRoom/` | Haas question sets (`haas-data.js`), `config-haas.js`, Haas resources |
| **`/mba-interview-room`** | `public/MbaInterviewRoom/` | `data/mba_interview_dataset/{school}/` via `/api/mba-interview-room/*` |

The MBA home screen includes a **Berkeley Haas** card that links to `/InterviewRoom`. The JSON API list omits `berkeley_haas` because that programme is loaded from the Haas bundle above.

## APIs

- **`GET /api/mba-interview-room/schools`** — Registry slice (no `berkeley_haas`).
- **`GET /api/mba-interview-room/school/[id]`** — `interview_room.json`, question pool, `school_meta.json`, `answerFrameworkMd`. Responds **404** for `berkeley_haas` with `usePath: /InterviewRoom`.
- **`POST /api/mba-interview/enhanced-feedback`** — Optional OpenAI feedback for the multi-school app.
- **`POST /api/interview-room/enhanced-feedback`** — Optional OpenAI feedback for `/InterviewRoom`.

## Dataset

- Build: `npm run build:mba-dataset` → `data/mba_interview_dataset/`.
- Inputs: `mba_final_handoff_static/` (report **(2)** for MBA structure, step4/step5 CSVs).
- `school_registry.json` includes a `listing` object per school for marketing cards.
- `interview_room.json` holds default `prepTime` / `answerTime` / `totalQuestions`; `question_bank.json` may set `prep_time_seconds` / `answer_time_seconds` per prompt (video, Kira, etc.).

## Optional subdomain

Expose e.g. `mba.example.com` by pointing DNS at your deployment and rewriting `/` to `/mba-interview-room` (or redirect), depending on your host.

## Local testing

1. `npm install` — add `OPENAI_API_KEY` in `.env.local` if testing AI.
2. `npm run build:mba-dataset` when the script or handoff inputs change.
3. `npm run dev` — open `/InterviewRoom` and `/mba-interview-room`; confirm sessions, Resources, and optional AI.
4. `npm run check` before release.

`npm run typecheck` runs `next typegen` then `tsc` (needed after a clean `.next`).

Do not open `public/MbaInterviewRoom/index.html` as a `file://` URL; APIs and `<base href>` require the Next server.

## Change boundaries

- Prefer small, focused diffs under `public/InterviewRoom/` (Haas-only).
- Multi-school work lives under `public/MbaInterviewRoom/`, `app/mba-interview-room/`, `app/api/mba-interview-room/`, `lib/mba-interview/`, `data/mba_interview_dataset/`, `scripts/build-mba-dataset.mjs`.
