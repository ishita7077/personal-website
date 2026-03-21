# MBA Interview Room (static bundle)

- **URL:** `/mba-interview-room` (programme practice, `/custom`, `/resources`, `/ai-stories`, `{id}/resources`)
- **Base:** `<base href="/MbaInterviewRoom/">`
- **Data:** `GET /api/mba-interview-room/schools`, `GET /api/mba-interview-room/school/[id]`
- **Optional feedback:** `POST /api/mba-interview/enhanced-feedback`

The Haas-only **Interview Room** at `/InterviewRoom` is a separate app under `public/InterviewRoom/`.

Docs: `docs/MBA_INTERVIEW_ARCHITECTURE.md`. Dataset validation: `npm run validate:mba-room`.
