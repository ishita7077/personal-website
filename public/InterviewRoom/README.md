# Interview Room

Practice MBA admissions interviews with video recording and live transcription. Simulates the UC Berkeley Haas Full-Time MBA interview format: 6 questions, timed prep and answer phases, with video and speech-to-text captured entirely in your browser.

**Everything runs locally.** Video, audio, and transcripts never leave your device.

## Share

| | Link |
|---|-----|
| **Live app** | [https://ishitasrivastava.xyz/InterviewRoom](https://ishitasrivastava.xyz/InterviewRoom) |
| **Source (fork/copy)** | [github.com/ishita7077/personal-website/tree/main/public/InterviewRoom](https://github.com/ishita7077/personal-website/tree/main/public/InterviewRoom) |

## Quick Start

1. Open `index.html` in a browser, or run a local server:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```
2. Allow camera and microphone when prompted.
3. Select UC Berkeley Haas and complete the device check.
4. Begin the interview.

## Requirements

- **Chrome or Edge** recommended (for full speech-to-text support)
- Camera and microphone
- HTTPS or localhost (browsers require secure context for media APIs)
- **Mobile:** Recording and review work on phones and tablets; live and offline transcription may be slower or limited. For the full experience use Chrome or Edge on a desktop.

## Interview Format

- 6 questions: 3 fixed (Goals/Why Haas, DEI, closing) + 3 randomized behavioral
- 45 seconds prep per question
- Up to 3 minutes to answer
- Press **Space** to skip prep or submit early
- Press **Esc** to end the session and go to review

## Privacy

All processing happens in your browser. No data is sent to any server. Closing the tab clears everything unless you download recordings or copy transcripts.

### Local AI review (InterviewRoom Phase 2)

InterviewRoom now includes an optional, fully local AI review layer:

- **Per-answer review**: For each completed answer, the app can generate a structured review with a text-only conversation flow graph, scores, strengths/gaps, coaching notes, and a faithful rewrite of your answer.
- **Session summary**: Once per-answer reviews are ready, the app can synthesize a session-level summary from those review objects (not from raw transcripts).
- **Transcript-first, AI-optional**: Transcripts and recordings continue to work everywhere InterviewRoom runs today, even if local AI review is unavailable.

Implementation details:

- **No external AI APIs**: All AI analysis runs locally in your browser using WebLLM and open models. Only model weights are downloaded from the CDN; your audio, video, and transcripts are never sent to a server for analysis.
- **Supported devices/browsers**: Local AI review requires a reasonably recent browser with WebAssembly and either WebGPU or SharedArrayBuffer support (Chrome/Edge on desktop recommended). On unsupported or low-powered devices, InterviewRoom automatically falls back to transcript-only mode.
- **First-run download**: The first time you trigger local review, the browser may download model weights. This can take time depending on your connection and hardware.
- **Quality gating**: If a transcript is too short, clearly corrupted, or extremely low quality, InterviewRoom will skip AI review for that answer, keep the transcript visible, and show a message like “Transcript quality too low for reliable AI feedback.”
- **Rambling detector**: A lightweight, deterministic “rambling” heuristic runs before AI review to flag structurally weak answers (e.g., heavy filler, looping, weak closure). This signal is conservative and used as metadata alongside AI review.

Developer notes:

- Per-answer analysis runs in a small review queue to avoid freezing the tab; only one local generation runs at a time.
- The session summary is computed from compact per-answer review JSON only (never by re-feeding the full raw transcripts).
- If the local review engine fails to initialize or validation of the model output fails, InterviewRoom falls back to transcript-only review and surfaces clear status messages.

### Local testing (mock data)

You can run the AI pipeline end-to-end **without WebLLM** using fixture data:

The local WebLLM-based review engine and its test harness have been removed. AI feedback now uses a consent-driven OpenAI flow only.

## License

MIT
