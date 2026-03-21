# Wispr Flow competitor truth map

## wispr_feature_inventory.md

### Core dictation behaviours

| feature_name | short_description | source_type | classification | confidence | citation |
|---|---|---|---|---|---|
| Dictate into any text field across apps | System-wide voice-to-text intended to work “anywhere you can type” (desktop + mobile), inserting into the active text field, not a specific editor. | Official docs | Official claim | High | citeturn7view2turn17view4turn14view0 |
| Push-to-talk activation (desktop) | Hold a global hotkey to record; release to stop and paste formatted text. Default hotkeys: Mac uses Fn; Windows uses Ctrl+Win. | Official docs | Official claim | High | citeturn7view1turn11view2 |
| Hands-free dictation mode (desktop) | Start continuous listening without holding keys, via a dedicated hands-free shortcut or by double-tapping the dictation hotkey; stop to paste via shortcut or UI. | Official docs | Official claim | High | citeturn7view3turn7view1 |
| Desktop “Flow Bar” control surface | Desktop has a central on-screen control (“Flow Bar”) that can start hands-free dictation and shows listening state; it can be hidden by default and enabled in settings. | Official docs | Official claim | Medium | citeturn7view3turn7view1 |
| Android “Flow Bubble” overlay | Android uses a floating bubble overlay that appears when a text field is focused; supports tap-to-dictate and hold-to-dictate. | Official docs | Official claim | High | citeturn7view1turn6search6 |
| Bubble visibility constraints (Android) | Bubble appears only when a text field is focused; hides when focus leaves text fields. | Official docs | Official claim | High | citeturn7view1 |
| Bubble snooze (Android) | Bubble can be snoozed for ~10 minutes by dragging; user can “shake” device to bring it back earlier (when idle). | Official docs | Official claim | High | citeturn4search5turn7view3 |
| Bubble resizing (Android) | Bubble size can be adjusted via a slider with several discrete sizes and reset to default. | Official docs | Official claim | Medium | citeturn7view1turn3search18 |
| iOS keyboard-based dictation | On iOS, Flow operates as a keyboard extension (text appears directly in the field, not via clipboard by default). | Official docs | Official claim | High | citeturn5view9turn14view2 |
| iOS “quick dictation to clipboard” shortcut | iOS supports shortcuts such as “Quick Dictation to Clipboard” for apps that block third-party keyboards (e.g., some banking/password-manager apps). | Official docs | Official claim | High | citeturn4search13turn4search7 |
| “Paste Last Transcript” workflow | Provides a “Paste Last Transcript” shortcut and menu item for cases where auto-paste fails (notably remote desktops). | Official docs | Official claim | High | citeturn7view4 |
| Clipboard mediation with restore (desktop) | Uses clipboard to paste dictated text, then restores the user’s prior clipboard contents (documented as ~500ms in a remote-desktop guide). | Official docs | Official claim | Medium | citeturn7view4turn7view1 |
| Per-dictation serialisation | Flow will not start a new dictation while a prior transcript is still processing, to avoid conflicts. | Official docs | Official claim | Medium | citeturn7view1 |
| Dictation cancellation behaviour | ESC cancels a dictation on desktop; cancelled text does not paste, but can be found in “Recent activity”. | Official docs | Official claim | Medium | citeturn7view1 |
| Session time limits | Desktop warns at ~5 minutes and stops at ~6 minutes; iOS has a ~5-minute session maximum. | Official docs | Official claim | High | citeturn7view1turn13view0 |
| Audio format constraints (API evidence) | Public API schema specifies 16kHz WAV audio (base64) and a maximum payload of 25MB or ~6 minutes. | Official technical docs | Official claim | High | citeturn13view0 |
| Multi-language dictation and translation | Claims support for 100+ languages and translation in 100+ languages (public marketing + press coverage). | Official site + third-party media | Official claim | Medium | citeturn17view4turn14view0 |
| “Whisper” capability | Claims it works even when whispering / low-volume speech (marketed as “Whisper” and in a microphone guide). | Official docs | Official claim | Medium | citeturn17view4turn4search11turn14view3 |
| “Press enter” voice action | Saying “press enter” at the end of a dictation can trigger an Enter keypress after paste; the phrase is removed from transcript output. | Official docs | Official claim | High | citeturn7view3turn6search4turn7view1 |
| Smart punctuation and explicit punctuation words | Automatic punctuation is claimed; users can also speak punctuation names (period/comma/etc.) and structural commands (“new line”, “new paragraph”). | Official docs | Official claim | High | citeturn7view0 |
| “Backtrack” self-correction | Recognises correction phrases like “actually” or “scratch that” and edits the output accordingly. | Official docs | Official claim | High | citeturn7view0turn17view4 |
| List formatting | Converts spoken numbering/ordering into formatted numbered lists. | Official docs | Official claim | High | citeturn7view0turn17view4 |
| Android transcript cards | After dictation, Android stores transcripts as cards with copy-to-clipboard, retry, delete actions. | Official docs | Official claim | Medium | citeturn6search6turn4search17 |
| History and audio download (desktop) | Desktop “History” can include audio recordings downloadable as WAV for troubleshooting accuracy issues. | Official docs | Official claim | Medium | citeturn3search6 |

### Editing / rewrite behaviours

| feature_name | short_description | source_type | classification | confidence | citation |
|---|---|---|---|---|---|
| “Auto edits” while dictating | Public marketing claims Flow “edits while you speak”, producing polished text (removing fillers, formatting). | Official site | Official claim | Medium | citeturn17view4turn15search9 |
| Filler-word removal | Explicit claim that filler words (“um”, “uh”) are removed automatically. | Official site + third-party media | Official claim | Medium | citeturn17view4turn14view0 |
| Command Mode: voice-driven transforms | “Command Mode” transforms selected text with spoken instructions (rewrite/translate/etc.) and can “search the web” by speaking; described as a paid feature. | Official docs | Official claim | Medium | citeturn4search10turn8search5 |
| Command Mode: Q&A via Perplexity | Command Mode can answer questions “via Perplexity” per product documentation. | Official docs | Official claim | Medium | citeturn4search10 |
| Command Mode enablement gates | Requires paid subscription (including trial) and enabling via “Experimental” settings page. | Official docs | Official claim | High | citeturn8search5turn5view7 |
| Scratchpad editor with “suggestion chips” | Floating Scratchpad on Mac provides one-click AI transformations (polish/restructure/translate) and supports custom prompts; auto-saves. | Official docs | Official claim | Medium | citeturn5view8 |
| “Polished text” routing rules | If Scratchpad is enabled and auto-paste is off, polished output opens in Scratchpad instead of auto-pasting; if Scratchpad disabled, polished text auto-pastes. | Official docs | Official claim | Medium | citeturn5view9turn5view8 |
| “Speak to edit” framing (third-party) | A third-party review characterises Command Mode as “edit your text with your voice”; also notes it can be “glitchy”. | Third-party review | Third-party observation | Low | citeturn14view2 |

### Command or control behaviours

| feature_name | short_description | source_type | classification | confidence | citation |
|---|---|---|---|---|---|
| Command Mode activation shortcuts | Command Mode can be bound to key or mouse-button shortcuts; supports multiple shortcuts and combinations. | Official docs | Official claim | Medium | citeturn8search5turn7view1 |
| Mouse button triggers (desktop) | Dictation shortcuts can use mouse buttons (Middle Click, Mouse4–Mouse10) as triggers. | Official docs | Official claim | Medium | citeturn7view1 |
| Hotkey conflict guidance | Recommends changing shortcuts if they conflict with OS/other apps; provides supported/unsupported hotkey guidance. | Official docs | Official claim | Medium | citeturn5view9turn4search4 |
| Auto-hide in sensitive apps (Android) | Android docs claim the bubble auto-hides in 136+ banking/financial apps; context reading disabled there for security. | Official docs | Official claim | Medium | citeturn5view0turn4search2 |
| Insertion error recovery | When paste fails, dictated text is kept in clipboard and surfaced with a “Paste” button (desktop Flow Bar / Android bubble). | Official docs | Official claim | High | citeturn5view9turn4search3turn4search9 |
| Remote desktop mode | For Citrix/RDP/VDI, Flow runs locally and relies on clipboard sharing; may require manual paste steps. | Official docs | Official claim | High | citeturn7view4turn5view9 |
| iOS Action Button / Back Tap integration | iOS supports configuring dictation shortcuts via Action Button and Back Tap (uses Apple Shortcuts). | Official docs | Official claim | Medium | citeturn6search9turn4search7 |

### Personalisation / vocabulary / memory behaviours

| feature_name | short_description | source_type | classification | confidence | citation |
|---|---|---|---|---|---|
| Personal dictionary (manual + rules) | Dictionary supports adding vocabulary words (names/terms) and replacement rules for persistent misspellings; syncs across devices. | Official docs | Official claim | High | citeturn5view4turn6search10 |
| Dictionary “word boosting” (server-side use) | Documentation states vocabulary words are sent to the server to improve recognition during transcription. | Official docs | Official claim | High | citeturn5view4 |
| Dictionary “replacement rules” (local post-processing) | Documentation states replacement rules are applied locally after transcription returns. | Official docs | Official claim | High | citeturn5view4 |
| Auto-add to dictionary by monitoring edits | If enabled, Flow “monitors the text box where it pastes text” to detect spelling edits and auto-add them to dictionary; user can disable. | Official policy page | Official claim | Medium | citeturn10view4turn17view4 |
| Snippets (voice shortcuts) | Snippets let users define trigger phrases that insert longer predefined text; triggers ignore punctuation to reduce false negatives. | Official docs | Official claim | Medium | citeturn5view5turn17view4 |
| Bulk import for dictionary/snippets | Desktop supports bulk import via CSV/JSON (up to 1,000 items), gated to paid plans. | Official docs | Official claim | Medium | citeturn3search4 |
| Flow Styles (tone/format profiles) | “Flow Styles” configure formatting/tone across app categories (e.g., email vs messages); availability: Mac/Windows/iOS; noted as rolling out and may be English-only. | Official docs | Official claim | Medium | citeturn5view6turn7view1turn17view4 |
| Context Awareness toggle | Setting allows use of surrounding text content and app context to improve transcription and formatting; can be disabled for sensitive environments. | Official docs + policy page | Official claim | Medium | citeturn5view0turn10view4turn18view0 |
| Context Awareness: password field exclusion | Password field contents are never read or included in context; spoken audio is still processed on servers for transcription even when in password fields. | Official docs | Official claim | Medium | citeturn5view0turn11view1 |
| Context inputs include screenshot / HTML / text (API evidence) | Public API schema includes optional context fields such as screenshot, page content text/HTML, and surrounding textbox before/after/selected text. | Official technical docs | Official claim | High | citeturn13view0turn13view1 |
| Conversation-aware dictation (API evidence) | API schema supports passing conversation metadata (participants + recent messages) for messaging/AI contexts. | Official technical docs | Official claim | Medium | citeturn13view1 |
| App-type aware formatting (policy + API evidence) | Claims Flow uses app name/type (email/ai/other) to shape writing style (e.g., formal vs casual), supported by API schema’s app.type field. | Official policy + technical docs | Official claim | High | citeturn10view4turn13view0 |
| “Flow Notes” sync | Policy claims “Flow Notes” sync across desktop and mobile, while audio/dictation history does not. | Official policy page | Official claim | Medium | citeturn10view4 |
| Hub stats and insights | Hub described as home for settings + usage insights (streak, total words, words/min; history; dictionary; snippets; notes). | Official docs | Official claim | Medium | citeturn7view2 |

### App / platform support

| feature_name | short_description | source_type | classification | confidence | citation |
|---|---|---|---|---|---|
| Supported platforms | Claims availability on Mac, Windows, iPhone, Android. | Official site | Official claim | High | citeturn15search2turn17view4turn14view0 |
| macOS requirements | macOS 12+ and compatible hardware; required permissions include microphone + accessibility; screen capture may be optional for context features. | Official docs | Official claim | Medium | citeturn7view2turn4search0turn3search24 |
| Windows requirements | Windows 10/11; x64 required; ARM-based Windows not supported; permissions include microphone + accessibility, and optional screen capture for context. | Official docs | Official claim | Medium | citeturn5view1turn7view2 |
| iOS requirements | iOS 18.3+ is required (as specified in documentation and App Store listing). | Official docs + app listing | Official claim | High | citeturn7view2turn15search9 |
| Android permissions model | Requires microphone + accessibility service + “display over other apps” (for bubble); battery optimisation disable recommended for reliability. | Official docs | Official claim | High | citeturn7view1turn3search18 |
| Android Accessibility rationale | Docs explain accessibility is used to detect text fields and insert dictated text; claims it avoids sensitive fields and can be revoked anytime. | Official docs | Official claim | Medium | citeturn3search7turn4search2 |
| Desktop app technology (Electron evidence) | Security documentation and bug bounty policy refer to “desktop Electron app” and “macOS/Windows Electron” client. | Official docs | Official observation | High | citeturn18view0turn18view2 |

### Privacy / local vs cloud claims

| feature_name | short_description | source_type | classification | confidence | citation |
|---|---|---|---|---|---|
| Cloud transcription requirement | States transcription always occurs in the cloud; offline dictation is not supported. | Official policy + official docs | Official claim | High | citeturn10view4turn16view0turn7view2 |
| Privacy Mode (zero data retention) | When enabled, audio/transcripts/edits are not stored or used for model training by the company or third parties (claimed “zero data retention”). | Official docs + policy pages | Official claim | Medium | citeturn11view0turn11view1turn16view0turn10view4 |
| Privacy Mode: data still collected | Privacy Mode applies to dictation content; account/profile, usage metadata, logs, billing may still be collected for operations. | Official docs | Official claim | Medium | citeturn5view3turn11view1turn13view4 |
| Privacy Mode setting sync (and enforcement options) | Privacy Mode settings sync across devices; enterprise can enforce (ZDR) and configure local storage policies (store, delete-after-24h, or never store). | Official docs | Official claim | Medium | citeturn5view3turn11view0turn13view4 |
| HIPAA BAA locking | Signing a HIPAA BAA can permanently lock Privacy Mode on (described in security docs + privacy docs). | Official docs | Official claim | Medium | citeturn11view0turn12search5turn5view3 |
| iOS enterprise “fail-safe” | If enterprise-enforced ZDR cannot be verified (connection loss), iOS is documented to auto-enable/lock privacy until connection restores (with limited background retries). | Official docs | Official claim | Medium | citeturn5view3 |
| Encryption in transit + at rest | Claims TLS/HTTPS encryption in transit and cloud-provider encryption at rest; includes details on desktop trust store behaviour. | Official docs | Official claim | High | citeturn18view0turn10view4 |
| Subprocessor list | Discloses subprocessors across AI/LLM providers, auth, payments, analytics, storage, communications, enterprise services; additionally claims privacy-mode zero-retention requirements flow down contractually. | Official docs | Official claim | Medium | citeturn13view4turn16view0turn10view4 |
| Analytics opt-out not available | Docs state there are no in-app controls to opt out of analytics tracking (other than account deletion). | Official docs | Official claim | High | citeturn13view4 |
| Content licence (Terms) | Terms state user “content remains yours” but grants a licence for providing, improving, and protecting services; prohibits reverse engineering to access source code/algorithms. | Official legal | Official claim | High | citeturn16view1turn16view2 |

### Performance / latency claims

| feature_name | short_description | source_type | classification | confidence | citation |
|---|---|---|---|---|---|
| “4x faster than typing” | Repeated marketing claim across docs and app listings. | Official site + official docs + app listing | Official claim | Medium | citeturn7view2turn17view4turn15search9 |
| Infra rewrite “30% faster” | Media reports a company-stated infrastructure rewrite making dictation ~30% faster (associated with Android launch). | Third-party media reporting an official claim | Official claim via media | Medium | citeturn14view0 |
| Target latency budget (700ms post-speech) | CTO post claims users expect end-to-end transcription + LLM formatting within ~700ms of stopping speaking, with sub-budgets for ASR/LLM/networking. | Official technical blog | Official claim | Medium | citeturn17view0 |
| Clipboard restore latency (~500ms) | Remote desktop guide claims clipboard is restored within about 500ms after successful paste. | Official docs | Official claim | Medium | citeturn7view4 |
| Bluetooth mic latency note | Docs warn Bluetooth microphones add latency; recommend built-in or wired microphones for faster performance. | Official docs | Official claim | Medium | citeturn6search12turn6search5 |

### Team / enterprise / admin features

| feature_name | short_description | source_type | classification | confidence | citation |
|---|---|---|---|---|---|
| Flow Basic / Pro / Enterprise plan gating | Feature matrix shows gating by plan: dictation caps (Basic) vs unlimited (Pro), Command Mode (Pro+), and enterprise security/admin features (Enterprise). | Official docs + official site | Official claim | High | citeturn5view7turn10view1 |
| Team shared dictionary + snippets | Team plans support shared dictionary and shared snippets to standardise names/jargon and canned responses. | Official docs + official site | Official claim | Medium | citeturn5view7turn10view3turn17view4 |
| Usage dashboards | Admin dashboards show aggregated usage (e.g., adoption, top apps), while “individual audio/transcripts/dictation data stay private” (claimed). | Official site | Official claim | Medium | citeturn10view3turn12search9 |
| SSO/SAML + SCIM (Enterprise) | Security docs describe SSO/SAML via WorkOS and SCIM for provisioning; includes enforcement behaviours and role policy. | Official docs | Official claim | Medium | citeturn11view0turn18view3turn13view4 |
| Local data policies enforcement | Enterprise can enforce local retention policies (store normally, auto-delete after 24h, never store); enforcement described as client-side. | Official docs | Official claim | Medium | citeturn11view0turn13view4turn18view0 |
| SOC 2 / ISO 27001 claims | Marketing claims SOC 2 Type II and ISO 27001 (often described as Enterprise-only). | Official site | Official claim | Medium | citeturn10view1turn16view0turn5view7 |

## wispr_claims_ledger.csv

| claim_id | claim | category | source_type | source_name | official_or_unofficial | evidence_excerpt_summary | confidence | contradiction_flag | notes |
|---|---|---|---|---|---|---|---|---|---|
| CLM-001 | Works in any text field across apps/devices | Capability | Official docs | “Starting your first dictation” | Official | “dictate in any app; paste into text box” | High | N | Cross-app insertion is a central contract. citeturn7view1 |
| CLM-002 | Desktop push-to-talk via hold-to-record hotkey | Capability | Official docs | “Starting your first dictation” | Official | Hold Fn / Ctrl+Win to record; release to paste | High | N | Default activation contract. citeturn7view1 |
| CLM-003 | Hands-free dictation exists (desktop) | Capability | Official docs | “Use Flow hands-free” | Official | Dedicated hands-free shortcut / Flow Bar | High | N | Implies endpointing differs from push-to-talk. citeturn7view3 |
| CLM-004 | Android uses floating bubble overlay (tap/hold modes) | Capability | Third-party media | TechCrunch Android launch | Official claim via media | Bubble tap-to-start; hold-to-dictate; close to stop | Medium | N | Cross-check with Android docs for consistency. citeturn14view0 |
| CLM-005 | iOS uses a dedicated keyboard integration | Capability | Third-party media | TechCrunch Android launch | Official claim via media | iOS “dedicated keyboard” vs Android bubble | Medium | N | Matches iOS docs framing. citeturn14view0turn5view9 |
| CLM-006 | Flow temporarily uses clipboard to paste on desktop and restores clipboard | Mechanism | Official docs | Remote desktop guide | Official | Copies dictated text, attempts paste, restores clipboard ~500ms | Medium | N | Defines insertion mechanism boundaries and failure modes. citeturn7view4 |
| CLM-007 | Flow tracks the correct target field for the dictation | Mechanism | Official docs | “Starting your first dictation” | Official | Inserts into field clicked at dictation start | Medium | N | Important for multi-input UIs (chat/AI apps). citeturn7view1 |
| CLM-008 | Dictation session caps: ~6 min desktop, ~5 min iOS | Limitation | Official docs | “Starting your first dictation” + API schema | Official | Stops after ~6 min; API max 6 minutes | High | N | Matches API schema max audio duration. citeturn7view1turn13view0 |
| CLM-009 | Smart Formatting formats punctuation/numbers/lists | Capability | Official docs | Smart Formatting / Backtrack | Official | Turns speech into formatted punctuation + lists | High | N | This is part of “auto-edit” layer. citeturn7view0 |
| CLM-010 | Backtrack self-correction exists | Capability | Official docs | Smart Formatting / Backtrack | Official | “actually/scratch that” rewrites preceding content | High | N | Suggests stateful decoding. citeturn7view0 |
| CLM-011 | Removes filler words (“um”, “uh”) | Capability | Official site + media | Features page + TechCrunch | Official | “Remove fillers” and “cleans up filler words” | Medium | N | Likely a text normalisation layer. citeturn17view4turn14view0 |
| CLM-012 | Context Awareness uses limited text context and app identity | Privacy/Capability | Official docs | Context Awareness | Official | Reads active app + limited nearby text (e.g., recipients) | Medium | N | Scope still includes sensitive considerations. citeturn5view0 |
| CLM-013 | Password fields excluded from context | Privacy | Official docs | Context Awareness | Official | Password fields never read/included | Medium | N | Still sends spoken audio to cloud for transcription. citeturn5view0 |
| CLM-014 | Context inputs may include screenshots | Privacy/Mechanism | Official technical docs | API “Request Schema” | Official | Optional “screenshot” context field exists | High | Y | Tension with some “limited text only” framings. citeturn13view0turn5view1 |
| CLM-015 | Screen capture permission is optional and used when needed | Privacy/Mechanism | Official docs | System requirements | Official | Screen capture access “optional” for context | Medium | Y | Conflicts with some user concerns of “constant screenshots”. citeturn5view1turn4search0 |
| CLM-016 | Transcription always occurs in the cloud | Privacy/Architecture | Official policy | Data Controls | Official | “Transcription always occurs on the cloud” | High | N | Eliminates true offline mode as a contract. citeturn10view4turn16view0 |
| CLM-017 | Privacy Mode means zero dictation retention and no training | Privacy | Official policy + docs | Privacy page + Security Overview | Official | With Privacy Mode on: no audio/transcripts/edits stored or trained | Medium | Y | Some docs disagree on platform availability; see contradictions file. citeturn16view0turn11view0turn11view1 |
| CLM-018 | Without Privacy Mode, dictation data may be used to train/improve | Privacy | Official policy | Data Controls | Official | Disabling Privacy Mode permits evaluation/training | Medium | N | Important product-contract toggle. citeturn10view4 |
| CLM-019 | No in-app opt-out of analytics tracking | Privacy | Official docs | Subprocessors & Third-Party Security | Official | Opt-out not available except account deletion | High | N | Impacts privacy posture for regulated rebuilds. citeturn13view4 |
| CLM-020 | Uses multiple AI/LLM providers including OpenAI and Anthropic | Architecture | Official docs | Subprocessors & Third-Party Security | Official | Lists LLM providers used for formatting/command mode | Medium | N | Vendor dependence is explicit. citeturn13view4 |
| CLM-021 | Uses open-source Llama 3.1 + proprietary LLMs for services | Architecture | Official policy + media | Data Controls + Computerworld | Official | Mentions Llama 3.1 and OpenAI-style providers | Medium | N | “Services” includes editing; ASR model not specified. citeturn10view4turn14view3 |
| CLM-022 | Latency target: ~700ms after user stops speaking | Performance | Official technical blog | “Technical Challenges Behind Flow” | Official | End-to-end transcription + formatting within ~700ms | Medium | N | High-level objective, not a guarantee. citeturn17view0 |
| CLM-023 | Infrastructure rewrite made dictation ~30% faster | Performance | Third-party media | TechCrunch Android launch | Official claim via media | Company said rewrite “30% faster than before” | Medium | N | Treat as marketing/press claim unless independently benchmarked. citeturn14view0 |
| CLM-024 | Team plan supports shared dictionary/snippets + central billing | Enterprise | Official docs | Plans and inclusions | Official | Pro includes team features + shared dict/snippets | Medium | N | Important for admin + collaborative contract. citeturn5view7turn10view3 |
| CLM-025 | Enterprise includes SSO/SAML + SCIM | Enterprise | Official docs | Security Overview + Access Controls | Official | SSO via WorkOS; SCIM provisioning | Medium | N | Defines enterprise integration expectations. citeturn11view0turn18view3 |
| CLM-026 | SOC 2 Type II / ISO 27001 posture | Compliance | Official site + docs | Pricing + Privacy page + Plans doc | Official | Claims SOC2 Type II and ISO 27001 for Enterprise | Medium | Y | Security Overview says “working toward”; see contradictions. citeturn16view0turn5view7turn11view0turn10view1 |
| CLM-027 | Android has “limited functionality” vs desktop/iOS | Platform maturity | Official docs | Bug bounty policy | Official | Android limited; bubble + history are key surfaces | Medium | N | Useful for rebuild parity planning. citeturn18view2 |
| CLM-028 | Android features not yet available (dictionary/styles/language/privacy) | Platform maturity | Official docs | “What is Flow?” | Official | Android beta: several features “not yet available” | Low | Y | Conflicts with newer Android docs and claims. citeturn11view2 |
| CLM-029 | User-generated content licence includes “improving” services | Legal | Official legal | Terms of Service | Official | Licence to “use content” to provide/improve/protect | High | N | Privacy Mode may narrow actual usage; see policy pages. citeturn16view1turn16view0 |
| CLM-030 | API service not generally available | Platform / ecosystem | Official technical docs | API docs header | Official | “Not offering API service… exclusive partners” | Medium | N | Public docs exist but access is restricted. citeturn13view0turn13view2 |

## wispr_contradictions.md

### Privacy Mode availability and controls differ across official sources

**Contradiction title**  
Privacy Mode appears to be both “available across Desktop/iOS/Android” and “available to individual users only on Android (with enterprise-only elsewhere).”

**Sources in tension**  
Security docs state Privacy Mode is offered across desktop, iOS, and Android, with instructions for enabling it on desktop/iOS via Settings → Data & Privacy. citeturn11view0turn16view0  
A dedicated Privacy Mode guide states “Privacy Mode for individual users is currently available on Android only,” and describes enterprise enablement separately. citeturn11view1turn5view3

**Why it matters for engineering**  
This affects the product contract for data retention and training opt-outs: whether privacy controls are user-level across all clients or restricted by plan/platform drives both UI and backend retention enforcement design.

**Current best interpretation**  
Best-fit reconciliation is that Privacy Mode exists cross-platform, but entitlement (individual vs enterprise) and/or UI availability has changed over time, and the “Android-only for individuals” statement may be stale relative to newer pages that describe desktop/iOS toggles. Confidence is limited because multiple official pages conflict. citeturn11view0turn11view1turn16view0

**Confidence**  
Medium

### Android maturity claims conflict with Android help-centre content

**Contradiction title**  
Android is described as “limited” and missing key features, while Android documentation describes a substantial feature set.

**Sources in tension**  
“Bug bounty” notes Android has limited functionality and identifies bubble + transcript history as primary surfaces. citeturn18view2  
A “What is Flow?” article states Android beta lacks custom dictionary, snippets, writing styles, language selection, and privacy mode. citeturn11view2  
Meanwhile Android-specific setup/troubleshooting articles document bubble sizing, snooze, history storage limits, privacy mode toggles, and clipboard behaviours. citeturn3search18turn4search5turn11view1turn5view9

**Why it matters for engineering**  
If Android parity is materially behind desktop/iOS, a rebuild strategy might prioritise different baselines per platform. Conflicting public docs complicate what users expect as “standard behaviour” on Android.

**Current best interpretation**  
Android likely shipped in iterative waves: early beta lacked dictionary/styles/language selection, and later releases added some controls; some overview docs may not have been updated at the same pace as troubleshooting/setup docs. Confidence remains limited without release-note correlation. citeturn11view2turn3search18turn4search5

**Confidence**  
Medium

### Context Awareness described as “limited text” yet public API schema includes screenshots

**Contradiction title**  
Context Awareness is framed as limited text context, but technical schema includes screenshot context inputs.

**Sources in tension**  
Context Awareness help article frames context as app identity plus “limited text content” (example: recipient names). citeturn5view0  
System requirements mention optional screen capture permission enabling on-screen context reading. citeturn5view1turn4search0  
Public API schema includes an explicit optional “screenshot” field plus content_text/content_html fields. citeturn13view0turn13view1

**Why it matters for engineering**  
This is a core privacy boundary: if the system can capture screenshots, then “context awareness” potentially includes highly sensitive on-screen data. It also implies a larger “context ingestion” subsystem than “limited text near cursor”.

**Current best interpretation**  
Flow likely supports multiple context channels: (a) lightweight text-only context derived via accessibility APIs; and (b) richer context via screen capture (or extracted HTML/text) when enabled/needed. Public API schema demonstrates the richer superset of possible inputs; product UI may gate these behind explicit permissions and toggles. citeturn13view0turn5view1turn5view0

**Confidence**  
Medium

### SOC 2 / ISO 27001 posture varies across official pages

**Contradiction title**  
Some pages say certifications are achieved; another says they are “working toward” them.

**Sources in tension**  
Privacy/security marketing page states “SOC 2 Type II certified” and includes an ISO 27001 section. citeturn16view0  
Pricing and plan docs advertise “SOC 2 Type II & ISO 27001” as Enterprise features. citeturn10view1turn5view7  
Security Overview states “Working toward SOC 2 Type II and ISO 27001 certifications”. citeturn11view0

**Why it matters for engineering**  
A rebuild targeting enterprise/compliance needs must be precise about audit scope and reality (certified vs in-progress). Misstating compliance is a material risk.

**Current best interpretation**  
Security Overview may be stale or written before certification completion; marketing pages may reflect later attainment. Without live access to the compliance report itself (linked externally), treat “certified” as a claim requiring verification. citeturn16view0turn11view0

**Confidence**  
Low to Medium

### “Transcription always cloud” coexists with “Privacy Mode local-only storage” language

**Contradiction title**  
Some phrasing suggests Privacy Mode can keep data “only on your device,” while other policy says transcription is always cloud.

**Sources in tension**  
Data Controls explicitly states transcription always happens in the cloud. citeturn10view4turn16view0  
Privacy Mode guide includes language about “keep all transcription data stored only on your local device,” while still describing server-side processing + discard. citeturn11view1turn5view3

**Why it matters for engineering**  
This affects how users interpret “local-only” guarantees. A rebuild must differentiate “local retention” from “local processing”.

**Current best interpretation**  
Privacy Mode is best read as “zero retention on supplier servers” rather than “fully on-device transcription”. Dictation content may still traverse cloud infrastructure for processing but is contractually discarded afterward; local device history storage is separately configurable. citeturn10view4turn11view1turn5view3

**Confidence**  
High

## wispr_competitor_map.md

### Adjacent products that plausibly constrain a Wispr Flow-style rebuild

| product | what they seem to do well | what they seem to do poorly | target user | likely differentiation versus Wispr Flow | citations |
|---|---|---|---|---|---|
| entity["company","Superwhisper","dictation app"] | Strong privacy positioning via offline/on-device operation; explicit “works offline” promise; supports user vocabulary and “modes” for formatting/tone. citeturn19search0turn19search11 | Less evidence (from public sources surfaced here) of cross-device sync and enterprise controls comparable to Flow; offline-first may trade off “context awareness” features. citeturn19search0 | Privacy-conscious individuals and professionals; users needing dictation without internet. citeturn19search0 | Wispr Flow differentiates via cloud-first low-latency ambitions, cross-device sync of personalisation, and enterprise compliance tooling; Superwhisper differentiates via offline guarantee. citeturn10view4turn5view7turn19search0 |
| entity["company","Typeless","ai voice dictation"] | Mobile-first “AI voice keyboard” positioning; claims real-time polished output, works in every app, voice editing, 100+ languages and mixed-language support. citeturn19search5turn19search8 | Public sources here don’t show deep enterprise controls (SSO/SCIM, ZDR enforcement) comparable to Flow Enterprise; unknown desktop breadth from sources collected. citeturn19search5turn5view7 | Heavy mobile communicators (WhatsApp/email/chat); users who want “polished writing” as default. citeturn19search8 | Flow differentiates via cross-platform stack (desktop + mobile) and richer enterprise compliance/admin; Typeless competes head-on on polished mobile dictation and multi-language. citeturn15search2turn5view7turn19search8 |
| entity["company","Aqua Voice","ai dictation"] | Extreme speed claims (startup <50ms; text inserted sometimes ~450ms); “any text field” positioning; developer tool adjacency cited (Cursor/terminal). citeturn19search17turn19search21 | Platform scope appears focused on desktop (Mac/Windows) from surfaced sources; weaker evidence of enterprise/compliance and cross-device personalisation. citeturn19search17turn19search21 | Professionals and developers who prioritise latency and frictionless desktop insertion. citeturn19search17turn19search21 | Wispr Flow differentiates with mobile coverage and codified enterprise privacy controls; Aqua Voice differentiates with speed-first positioning and potentially simpler product surface. citeturn15search2turn5view7turn19search17 |
| entity["company","VoiceInk","local dictation mac"] | Strong “local models / complete privacy” positioning (on-device transcription); likely appealing to offline-first users. citeturn19search2turn19search18 | Naming ambiguity: multiple “VoiceInk” products exist across web/app stores/open-source; feature parity vs Flow unclear from limited primary evidence collected. citeturn19search2turn19search6turn19search18 | Users who want on-device dictation and local privacy controls (particularly macOS users). citeturn19search2 | Wispr Flow’s contrast is cloud-first transcription plus enterprise ZDR/compliance and cross-device sync; VoiceInk’s contrast is “local-only” privacy. citeturn10view4turn5view7turn19search2 |
| entity["company","Handy","offline speech-to-text app"] | Open-source, offline, cross-platform “shortcut → transcribe → paste anywhere” approach; explicit focus on modifiability and local-only processing via whisper.cpp (per public discussion). citeturn19search4 | As described publicly, appears “intentionally simple” with fewer productised features (enterprise admin, context awareness, team sharing). citeturn19search4 | Builders and power users who want hackable local dictation, potentially as a base for custom workflows. citeturn19search4 | Wispr Flow differentiates by packaging: polished cross-platform UX, context-aware formatting, and enterprise/compliance; Handy differentiates by openness and offline-only constraints. citeturn17view4turn19search4turn5view7 |

## wispr_public_architecture_hypotheses.md

Inference is allowed only in this section. “Evidence observed” items are strictly grounded in cited public materials.

| subsystem | evidence observed | likely role (inference) | confidence | open questions | citations supporting evidence portion |
|---|---|---|---|---|---|
| Invocation / trigger model | Desktop: hold-to-talk hotkey (Fn / Ctrl+Win); hands-free shortcut (Fn+Space/Ctrl+Win+Space) and double-tap to latch; mouse buttons supported. citeturn7view1turn7view3 Android: bubble tap/hold modes and bubble appears on text-field focus. citeturn7view1 iOS: keyboard mic button + Shortcuts (Action Button/Back Tap). citeturn5view9turn6search9 | Multi-modal triggers feeding one session manager that enforces single active dictation at a time, plus platform-specific wrappers (hotkey listener, overlay bubble, keyboard extension, shortcuts). | High | How is hotkey capture implemented on macOS/Windows (native vs Electron-level hooks)? How is accidental activation prevented? | citeturn7view1turn7view3turn18view2 |
| Audio capture | Users can select microphones; switching devices restarts recording session; “Prefer built-in microphone” options on iOS; Bluetooth adds latency. citeturn6search5turn6search12turn4search18 | A capture layer normalises device audio into a consistent internal format and handles device changes mid-session (restart/rebind). | Medium | Do they stream partial audio chunks or batch-upload only on endpoint? How is noise suppression handled (OS vs custom)? | citeturn6search5turn13view0turn17view0 |
| Endpointing / segmentation | Push-to-talk release, hands-free stop button, bubble checkmark; “press enter” voice command; hard time caps (~5–6 min). citeturn7view1turn7view3turn13view0 | A session controller likely uses explicit user actions as primary endpoint, with optional VAD/timeout guardrails; post-end triggers formatting + insertion actions. | Medium | Is there voice activity detection to auto-stop in hands-free mode? Does it support streaming partial results? | citeturn7view3turn17view0 |
| Transcription path | Policy: “Transcription always occurs on the cloud.” citeturn10view4turn16view0 API schema: 16kHz WAV base64; max 25MB/6 min. citeturn13view0 | Cloud ASR service that accepts normalised audio; likely returns raw transcript plus metadata; usage suggests near-real-time responsiveness targets. | Medium | What ASR model(s) are used (in-house vs vendor)? Is transcription streaming token-by-token or returned after end? Any on-device pre-processing? | citeturn17view0turn13view0turn13view4 |
| Formatting / rewriting layer | Smart Formatting + Backtrack; filler removal; Styles; blog claims combined “transcription and LLM formatting/interpretation” performance budgets. citeturn7view0turn17view0turn17view4 Data Controls: app-context used for formatting; textbox context used for casing/spacing/punctuation. citeturn10view4turn13view0 | Two-stage output pipeline: ASR creates baseline text; a formatting layer conditions output on app type, textbox context, and user style preferences, producing “paste-ready” text. | High | Is formatting strictly deterministic rules + LLM, or LLM-only? How are “Backtrack” and correction intents represented? | citeturn7view0turn17view0turn13view0 |
| Command mode | Docs: highlight text + issue voice command; can rewrite/translate/search web; can answer “via Perplexity”; paywalled and enabled via Experimental. citeturn4search10turn8search5turn5view7 Subprocessor list: multiple LLM providers used for “transcription formatting” and “command mode”. citeturn13view4 | A separate “instruction execution” pipeline: captures selected text + instruction, routes to one of several LLM providers, returns replacement text (or external answer) and then inserts/pastes depending on settings. | Medium | How is prompt routing decided among providers? Are there safeguards for sensitive selections (e.g., password-proximal text)? | citeturn13view4turn5view0turn11view1 |
| Personalisation store | Dictionary sync across devices; vocabulary words sent server-side for recognition; replacement rules applied locally. citeturn5view4turn6search10 Snippets sync and can be shared for teams. citeturn5view7turn13view3 | Likely a cloud-backed user profile for dictionary/snippets/styles, with a client-side cache loaded at startup and per-session; supports team-scoped shared resources. | High | Where is personalisation stored (service choice is not explicit) and how is it partitioned per team? How are replacement rules versioned? | citeturn5view4turn13view4turn18view3 |
| Context ingestion | Docs: Context Awareness uses app ID + limited text; system requirements mention optional screen capture; API schema includes screenshot/content_html/content_text plus textbox before/after/selected. citeturn5view0turn5view1turn13view0 | Context adapter that can derive low-risk context via accessibility APIs and optionally enrich via screen capture or extracted page content; feeds both ASR disambiguation and formatting. | Medium | Under what conditions is screenshot used vs content_text/HTML? Is screenshot stored or only transmitted transiently? How is enterprise policy enforced? | citeturn11view1turn13view4turn17view0 |
| Insertion mechanism | Desktop relies on clipboard and simulated paste; remote desktops require manual workflows; iOS uses keyboard insertion; Android uses accessibility insertion with clipboard fallback. citeturn7view4turn5view9turn3search7 | Platform-specific “text injection” services: desktop paste automation; iOS key events + keyboard APIs; Android accessibility to identify target field and inject text. | High | How robust is injection across difficult surfaces (terminals, elevated privilege apps, secure inputs)? What is the fallback UX contract? | citeturn5view9turn7view4turn4search3 |
| Sync / settings / analytics | Uses analytics and messaging vendors; no in-app opt-out except deletion. citeturn13view4 Privacy Mode settings can sync across devices; subscription/dictionary/snippets sync; history generally does not sync. citeturn5view3turn6search10 | A cloud settings service + client caching supports entitlements, sync, and telemetry; “history” remains primarily local to reduce sensitivity/size and enable device-local control. | Medium | What is included in “usage metadata” and how is it minimised under ZDR? Are there separate telemetry modes for Enterprise? | citeturn5view3turn13view4turn16view0 |
| Privacy architecture | Privacy Mode claims zero retention for dictation content with contractual pass-through to subprocessors; still allows operational metadata and logs. citeturn11view1turn13view4turn5view3 Password/banking protections described across platforms. citeturn5view0turn11view1 | Likely implemented as a retention policy flag that controls server-side persistence plus client-side history rules, with enterprise policy enforcement on clients (documented). | Medium | How is “zero retention” technically enforced with each vendor? Are there separate endpoints or headers? How is auditability achieved? | citeturn11view0turn18view0turn13view4 |

## Appendix

### Additional public intelligence not included in the required artefacts

#### Public-source signals about roadmap and product direction

An official “master plan” post frames a three-phase strategy: (1) reliable voice input, (2) “voice to action”, and (3) wearables ubiquity; it explicitly references prior time spent on a wearable/BCI approach and a shift back to “reliable voice input” as the adoption wedge. citeturn17view1

A technical post by the CTO describes internal performance targets and modelling challenges, including an end-to-end budget of ~700ms after the user stops speaking and sub-budgets for ASR/LLM/network. It also claims work on context-conditioned ASR, learning from user corrections, and “personalised LLM formatting” at token-level control. citeturn17view0

#### Public-source signals about funding and adoption (treat as press-reported claims)

Reporting around the Android launch states users dictated over 1.3 million English words in a few days of early rollout and that the company had raised $81M total (with funding rounds in June/November 2025) and a reported ~$700M valuation. citeturn14view0turn14view3

#### Security / privacy implementation hints in public documentation

Public security documentation references client-side enforcement for enterprise security policies (e.g., enforcing zero retention and local deletion policies on clients, not only server-side configuration). citeturn11view0turn18view0

The public bug bounty policy enumerates production domains and notes “macOS/Windows Electron” clients plus APIs, and implies the Android client had “limited functionality” relative to desktop/iOS at the time of writing. citeturn18view2

Public API documentation exists for a “Voice Interface API” but states the API is not generally available and is restricted to an exclusive partner set. citeturn13view0turn13view2

#### Naming and scope clarifications

In official documentation, “Flow” is used as a shorthand for the product, but it refers to the same system-wide dictation product described as Wispr Flow across marketing and documentation. citeturn7view2turn17view4turn14view0

In the adjacent market, there is naming ambiguity around “VoiceInk”: at least one site positions “VoiceInk” as a local/offline macOS dictation app, while an open-source repository also uses the same name; additionally, app store listings exist under “VoiceInk”. These should be disambiguated carefully during competitor analysis. citeturn19search2turn19search18turn19search6

#### Extra raw source index for engineering workspace

The following is a non-exhaustive list of the highest-yield public sources surfaced in this research pass (grouped by purpose). This list is intended for quick repo-linking and follow-up extraction.

```text
Core product docs (Help Centre)
- https://docs.wisprflow.ai/articles/2772472373-what-is-flow
- https://docs.wisprflow.ai/articles/6409258247-starting-your-first-dictation
- https://docs.wisprflow.ai/articles/6391241694-use-flow-hands-free
- https://docs.wisprflow.ai/articles/5373093536-how-do-i-use-smart-formatting-and-backtrack
- https://docs.wisprflow.ai/articles/4816967992-how-to-use-command-mode
- https://docs.wisprflow.ai/articles/4052411709-teach-flow-your-words-with-the-dictionary
- https://docs.wisprflow.ai/articles/5784437944-create-and-use-snippets
- https://docs.wisprflow.ai/articles/2368263928-how-to-setup-flow-styles
- https://docs.wisprflow.ai/articles/7971211038-fix-text-not-pasting-after-dictation
- https://docs.wisprflow.ai/articles/7336156466-use-flow-with-remote-desktops-citrix-rdp-vdi
- https://docs.wisprflow.ai/articles/4678293671-feature-context-awareness
- https://docs.wisprflow.ai/articles/6274675613-privacy-mode-data-retention
- https://docs.wisprflow.ai/articles/1922179110-data-security-encryption
- https://docs.wisprflow.ai/articles/5375461355-subprocessors-third-party-security
- https://docs.wisprflow.ai/articles/3147443438-security-overview
- https://docs.wisprflow.ai/articles/9186653552-vulnerability-disclosure-bug-bounty-policy

Official marketing + policy
- https://wisprflow.ai/
- https://wisprflow.ai/features
- https://wisprflow.ai/data-controls
- https://wisprflow.ai/privacy
- https://wisprflow.ai/pricing
- https://wisprflow.ai/terms-of-service
- https://wisprflow.ai/post/technical-challenges
- https://wisprflow.ai/post/the-master-plan

Public API docs
- https://api-docs.wisprflow.ai/request_schema
- https://api-docs.wisprflow.ai/rest_api_quickstart

Third-party coverage (selected)
- https://techcrunch.com/2026/02/23/wispr-flow-launches-an-android-app-for-ai-powered-dictation/
- https://zapier.com/blog/wispr-flow/
- https://www.computerworld.com/article/4107331/wispr-ceo-interview-post-keyboard-office.html

Competitors (selected primary sources)
- https://superwhisper.com/
- https://superwhisper.com/docs/modes/voice
- https://www.typeless.com/
- https://play.google.com/store/apps/details?id=com.typeless.mobile
- https://www.ycombinator.com/companies/aqua-voice
- https://www.producthunt.com/products/aqua
- https://tryvoiceink.com/
```

#### Extra public discussion signal (user-reported; treat as low confidence unless corroborated)

A third-party article frames a key privacy concern as “context awareness” involving screen context, and a separate third-party review notes broad device access requirements and that Context Awareness may use what it sees on screen when enabled. These claims should be treated as user-level observations and reconciled against the explicit API schema and permission gating described in official documentation. citeturn14view2turn13view0turn5view1