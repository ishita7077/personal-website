# MBA interview dataset (developers)

Generated files for **`/mba-interview-room`** (`public/MbaInterviewRoom/`). All ten programmes, including **Berkeley Haas**, load their bundles from this tree at runtime via `GET /api/mba-interview-room/school/[id]`. The standalone **`/InterviewRoom`** app is a separate Haas-only surface that uses its own `haas-data.js` copy.

## Layout

- `school_registry.json` — school ids, display names, data paths, and optional `listing` for UI cards.
- `<school_id>/school_meta.json` — programme copy, validated format paraphrase, URLs from step4/step5 CSVs.
- `<school_id>/question_bank.json` — prompts, `expected_answer_map`, optional per-prompt `prep_time_seconds` / `answer_time_seconds`, `handoff_basis`.
- `<school_id>/interview_room.json` — default session timing and `totalQuestions`; Haas uses `random_set` (7×6), others use `shuffle_weighted` pools.
- `<school_id>/evidence_map.json` — evidence-type projection of the bank.
- `<school_id>/answer_framework.md` — human-readable framework and URLs.

## Regenerating

```bash
npm run build:mba-dataset
```

Implementation: `scripts/build-mba-dataset.mjs` (reads `mba_final_handoff_static/` CSVs at build time).

## Handoff scope

`deep-research-report (1).md` is unrelated to MBA interviews. Structure and timing draw from **`deep-research-report (2).md`** plus step4/step5 packs.

## AI feedback

Multi-school practice uses `POST /api/mba-interview/enhanced-feedback`. `/InterviewRoom` uses `POST /api/interview-room/enhanced-feedback` (same env key pattern).
