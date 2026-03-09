# Manual QA checklist (shipping)

Use this list to verify the app before release. Test on **Chrome or Edge** (for full speech-to-text) and, if possible, one other browser (e.g. Firefox/Safari) for recording-only paths.

---

## Session flow

- [ ] **Normal session:** Start → device check → Begin interview → waiting room → click Q1 → prep 45s (or skip) → answer (or submit early) → back to waiting room → click another question (e.g. Q3) → same flow → Finish & review. All 6 questions appear; progress bar reflects status; completed questions show as locked.
- [ ] **Out-of-order answering:** From waiting room, answer e.g. Q2, then Q5, then Q1. Progress bar shows done/active/pending by status, not by index order. Review shows all answered questions with correct Q numbers and transcripts.
- [ ] **Early submit:** During answer phase, click "Submit answer →" or press Space before the 3 minutes. Answer is saved, timer stops, you return to waiting room.
- [ ] **End session during answer:** Press Esc or click "End session" while answering. Confirm "End session" in modal. You land on review with that answer saved; no double-save or stuck state.
- [ ] **All questions done:** Complete all 6 (or submit at least one and use "Finish & review"). Session completes; review shows cards; "New session" returns to home.

---

## Copy and trust

- [ ] **6 questions everywhere:** Home, guide, session label, and README all say 6 questions (no "5").
- [ ] **Leave waiting room:** Click "Leave" → modal says answers are only saved if you used "Finish & review" first; "Leave" ends session and goes home. No implication that you can "resume" later.
- [ ] **End session:** Button/tooltip say "End session and go to review"; after confirming, you are on the review screen.

---

## Review and export

- [ ] **Review cards:** Expand/collapse; video plays; transcript area shows notes clearly; enhancement badge appears when offline Whisper has upgraded a transcript.
- [ ] **Download:** "Download recording" downloads a playable video file. "Download all recordings" downloads one file per recorded answer.
- [ ] **Copy transcript:** Single-question "Copy transcript" and "Copy all transcripts" put correct text on clipboard. If clipboard fails (e.g. in some insecure contexts), a clear error toast appears and no crash.

---

## Clipboard failure

- [ ] **Simulate failure:** If possible (e.g. run over file:// or in a context that blocks clipboard), trigger copy. App shows "Copy failed. Try selecting and copying manually." and does not throw.

---

## No speech recognition

- [ ] **Browser without speech API:** Use a browser (or mode) without Web Speech API. Device check shows warning that live transcription is not supported; recording still works. Session and review work; transcript may be empty or from offline Whisper only.

---

## Camera / microphone

- [ ] **Permission denied:** Deny camera or mic. UI shows "Camera and microphone access was denied" and clear steps to allow. Retry works after allowing.
- [ ] **No device:** Disconnect all cameras/mics (or use a VM with none). Error message indicates no device found (or in use). Retry after connecting device works.
- [ ] **Disconnect during session:** With session or waiting room open, disconnect camera or mic (e.g. unplug USB). On device-check screen, UI updates to error state with "Try again". On other screens, a toast indicates disconnect.
- [ ] **Device check:** Camera list and mic list populate; switching device updates preview and mic level; "Begin interview" enables after success.

---

## Keyboard and guards

- [ ] **Space / Esc:** During session, Space skips prep or submits answer; Esc opens "End session" modal. Rapid key presses do not cause double submit or double modal.
- [ ] **Finalization:** While "Saving…" (or equivalent), Skip and End session are disabled; pressing Space/Esc does nothing until finalization completes.

---

## Object URLs and cleanup

- [ ] **Review then New session:** Open review, expand a card, play video → click "New session". No console errors; no leaked blob URLs (optional: check in devtools that no stale object URLs remain).
- [ ] **Leave waiting room:** Leave from waiting room → confirm Leave. Next "Begin interview" and review do not reuse old blob URLs from a previous run.

---

## General

- [ ] **Guide:** Help button opens guide; backdrop and Close close it. Copy is consistent with 6 questions and "End session and go to review".
- [ ] **Modals:** "End session" and "Leave waiting room" modals close on backdrop click or "Continue"/"Stay"; primary action performs the right navigation and cleanup.
