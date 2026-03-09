# Changelog — Shipping pass

Summary of changes made to bring the app to a production-clean, ship-ready state. No change to core product shape (static HTML/CSS/vanilla JS, no backend, no auth, no analytics).

---

## 1. Trust and copy

- **Consistent 6 questions:** All references (HTML, guide, README) now say 6 questions; session label shows `Qn / 6`.
- **Waiting room "Leave":** Copy and flow updated so leaving is explicit: "Leave" with tooltip that answers are only saved if you use "Finish & review" first; leaving ends the session. A confirmation modal explains this and offers "Stay" / "Leave".
- **End session:** Button and tooltip now say "End session and go to review" so the outcome (review screen) is clear. Guide shortcut updated to match.
- **Download labels:** "Audio" button removed; single "Download recording" used for each answer, and "Download all recordings" for the bulk action. Files are saved as video in WebM format under the hood, but the user-facing copy avoids file-type jargon.
- **Copy sweep:** Grammar, consistency, and calm tone across device check, permissions, guide, and toasts (e.g. "Requesting camera and microphone…", "Answer saved. Pick another question or finish.").

---

## 2. Progress logic

- **Status-driven progress bar:** The session progress bar is driven by `questionStatuses` (pending / active / done / skipped), not by `currentQuestion` index order, so it stays correct when questions are answered out of order.
- **Explicit states:** Segments use classes: `pending`, `active`, `current`, `done`, `skipped` so the bar reflects actual state.

---

## 3. Answer finalization guards

- **Single finish:** `finishAnswer` is guarded so it cannot run twice (e.g. double Space/Esc). A `finalizingAnswer` flag is set at start and cleared in a `finally` after `stopRecording()`.
- **Controls disabled:** Skip and End session buttons are disabled while an answer is being finalized (`setSessionControlsEnabled(false/true)`).
- **Shortcuts:** Space and Esc are ignored when `finalizingAnswer` is true to avoid overlapping cleanup.

---

## 4. Transcript sanitization

- **No raw innerHTML for transcript text:** An `escapeHtml` helper and DOM/textContent are used for all user- or AI-derived transcript text.
- **Live transcript:** Updated via `textContent` and created DOM nodes for final/interim segments.
- **Review transcript views:** Flow, Key Points, and Transcript are built with `createElement` and `textContent`; sentence text is escaped when needed.
- **Future-proof:** Any future AI analysis rendering should use the same pattern (escapeHtml or textContent).

---

## 5. Review object URL lifecycle

- **Cached URLs:** Review screen uses `IR.getReviewBlobUrl(index, blob)` so each recording gets at most one object URL, stored in `IR.state.reviewBlobUrls`.
- **Revoke on leave:** `IR.revokeReviewBlobUrls()` is called when navigating away from review and when starting a new session, so URLs are revoked and not recreated on every re-render.

---

## 6. Clipboard and download robustness

- **Clipboard:** `copyToClipboard(text, onSuccess, onFail)` tries `navigator.clipboard.writeText` and falls back to `document.execCommand('copy')` with a temporary textarea; errors show a calm toast ("Copy failed. Try selecting and copying manually.").
- **Button labels:** Copy and download buttons match the actual output (e.g. "Copy transcript", "Download recording", "Download all recordings").

---

## 7. Media lifecycle

- **Recorder stopped in cleanup:** `stopAll()` now stops an active `MediaRecorder` (if any) before stopping stream tracks, and clears `recorder` and `chunks`.
- **Review screen:** Camera/mic are stopped when entering review (`stopAll()` in `endSession()` before navigating to review).
- **Device disconnect:** If the camera or microphone is disconnected while on the device-check screen, `permState` is set to `error` and the permission UI is updated with clear guidance. On other screens, a toast is shown.

---

## 8. Permission and error handling

- **Distinguished cases:**
  - **Permission denied:** "Camera and microphone access was denied" with steps to allow in the address bar.
  - **Device missing:** "No camera or microphone was found" (e.g. `NotFoundError`).
  - **Device busy/unavailable:** "Camera or microphone is in use by another app…" (e.g. `NotReadableError`).
  - **Insecure/unsupported:** "Camera and microphone are not supported in this browser or context. Use HTTPS or localhost."
- **Copy:** Short, calm instructions for each case; retry button label "Try again" or "Retry camera & microphone" as appropriate.

---

## 9. Prototype cleanup

- **Event binding in JS:** Inline `onclick` / `onkeydown` removed from the main app HTML. Handlers are attached in `IR.init()` (e.g. nav logo, school card, guide, tech check, waiting room, session controls, review footer).
- **CSS classes for visibility:** Preview video, device select, session media, rec indicator, and live transcript use classes (e.g. `ir-visible`) instead of inline `style="display:..."`.
- **Shared utility classes:** Shortcuts text, label spacing, and button padding use small utility classes in `main.css` instead of inline styles.

---

## 10. Review UX

- **Transcript tab names:** "Flow" / "Headlines" / "Raw" renamed to "Answer Flow", "Key Points", "Transcript".
- **Empty states:** "No transcript available." and "No key points detected." (with a hint class) for empty or single-sentence answers.
- **Enhancement status:** When offline Whisper has upgraded a transcript, an "Enhanced" badge is shown on that review card's transcript section; `IR.state.transcriptEnhanced[index]` is set in `ai.js` and cleared on new session.

---

## 11. Docs and QA

- **CHANGELOG_SHIPPING.md:** This file.
- **QA checklist:** See `QA_CHECKLIST.md` for a short manual QA list (normal session, out-of-order answers, early submit, end session during answer, clipboard failure, no speech recognition, camera/mic disconnect).

---

## Constraints respected

- No framework migration
- No backend, no auth, no analytics
- No large refactor beyond the above
- Product remains a simple, privacy-first interview practice tool
