# AI MBA Interview Simulator Dataset for Ten MBA Programmes

## Research basis and scope

This dataset is designed to power an AI interview simulator that can (a) mimic each programme’s real interview structure and (b) evaluate answers against school-specific expectations, not generic MBA heuristics. Where a programme has multiple interview components (e.g., team-based discussion, timed video questions, required pre-interview submissions, post-interview reflections), those components are included explicitly so the simulator can replicate the *full* candidate experience. citeturn9view0turn11view0turn12view0turn15view0turn17view0turn20view0

Interview formats were validated using official school guidance where available, and supplemented with highly credible admissions-prep sources when an official page did not state an item like duration or interviewer type. Each school folder includes a sources list used for validation. citeturn10view0turn11view0turn12view0turn13view0turn14view0turn15view0turn16view0turn17view0turn20view0turn21view0

## Validated interview structures across programmes

| Programme | Validated interview format | Interviewer type | Typical duration | Unique structural elements |
|---|---|---|---|---|
| entity["organization","Stanford Graduate School of Business","mba program stanford, ca, us"] (Stanford GSB) | 1:1, structured behavioural interview focused on *past actions* (not hypotheticals). citeturn21view0 | Trained subset of alumni or MBA Admissions team member. citeturn21view0 | 45–60 minutes. citeturn21view0 | “All admits must interview”; typically 2–3 candidates per seat interviewed; emphasis on recent meaningful professional/community experiences. citeturn21view0 |
| entity["organization","HBS","business school boston, ma, us"] (Harvard Business School) | 1:1, application-based interview tailored to your file. citeturn10view0 | MBA Admissions Board member who reviewed your application. citeturn10view0turn11view0 | 30 minutes. citeturn10view0turn11view0 | Required Post-Interview Reflection due within 24 hours (guidance 300–450 words). citeturn11view0 |
| entity["organization","The Wharton School","mba program philadelphia, pa, us"] (Wharton) | Team Based Discussion: 35-minute virtual group exercise (5–6 applicants) + 10-minute 1:1 reflection. citeturn9view0 | 10-minute reflection with admissions team member. citeturn9view0 | 35 + 10 minutes. citeturn9view0 | Explicitly models collaborative culture; evaluates engagement, leadership, communication, decision-making in a functioning team. citeturn9view0 |
| entity["organization","MIT Sloan School of Management","mba program cambridge, ma, us"] (MIT Sloan) | 1:1 interview emphasising behavioural examples (persuasion, teamwork, leadership). citeturn12view0 | Official guidance centres on behavioural probing; commonly reported as admissions staff (not alumni). citeturn12view0turn24view0 | Commonly ~30 minutes. citeturn24view0 | Required pre-interview short-answer + PDF upload (data visualisation or data-driven decision slide) due ≤24 hours before interview; interviews conducted virtually per official guidance. citeturn12view0 |
| entity["organization","University of Chicago Booth School of Business","mba program chicago, il, us"] (Chicago Booth) | 1:1 interview; conversational; includes time for you to ask questions. citeturn14view0 | Current student, graduate/alum, or admissions staff; interviewer types weighted equally in evaluation. citeturn13view0turn14view0 | About an hour. citeturn14view0 | Single required interview for admission; format can be on campus, convenient location, or virtual. citeturn13view0turn14view0 |
| entity["organization","Kellogg School of Management","mba program evanston, il, us"] (Northwestern Kellogg) | 1:1 behavioural-based interview; resume-only (“blind”) by design. citeturn7view0 | Resume-only interviewer; often alumni depending on cycle/logistics. citeturn7view0turn18search2 | Commonly 30–45 minutes (varies). citeturn18search2 | Interviewer has not read your application (resume-only) per Kellogg guidance; you must re-state motivations and goals clearly. citeturn7view0 |
| entity["organization","Haas School of Business","mba program berkeley, ca, us"] (Berkeley Haas) | Invitation-only; “dynamic interview options” including prerecorded video sessions and live remote conversations. citeturn8view0 | Live remote: current student or alum. citeturn8view0 | Varies by format (commonly ~30 minutes in reports). citeturn8view0turn2search12 | Strong cultural lens via four Defining Leadership Principles. citeturn22search2 |
| entity["organization","Yale School of Management","mba program new haven, ct, us"] (Yale SOM) | Blind 30-minute interview (resume-only) + separate video questions (two questions; 60 seconds each). citeturn15view0 | Current second-year student, recent alum, or Admissions Committee member. citeturn15view0 | 30 minutes (live interview). citeturn15view0 | Video questions assess communication/English; questions are largely behavioural + MBA/post-MBA plans. citeturn15view0 |
| entity["organization","LBS","business school london, uk"] (London Business School) | Interview with alumni or senior admissions staff; typically regional; can be in-person or online. citeturn16view0turn20view0 | Alumni or senior admissions staff. citeturn16view0turn20view0 | Varies; often ~45–60 minutes in reports. citeturn20view0turn2search6 | Candidates also submit an admissions video via entity["company","Kira Talent","video interview platform"]; interviewer may have read the full application and can probe any part of it. citeturn20view0 |
| entity["organization","Institut Européen d’Administration des Affaires","business school fontainebleau, fr"] (INSEAD) | Mandatory Kira video assessment for all applicants + (if pre-selected) two alumni interviews. citeturn17view0turn23view0 | Two alumni interviewers; they submit reports to Admissions Committee. citeturn17view0turn23view0 | Alumni interviews vary (often ~45–60); Kira ~15–20 minutes total. citeturn17view0 | Kira specifics: 4 video questions (45s prep / 60s response) + 1 written question (5 minutes) within 48 hours of deadline; evaluation criteria include academic capacity, international motivation, leadership potential. citeturn17view0turn23view0 |

## Dataset design for an AI interviewer

The dataset is structured to support three simulator capabilities:

It can replicate the *interaction pattern* of each school (e.g., Wharton TBD group dynamics and post-discussion reflection; MIT Sloan’s pre-interview data submission; Yale SOM and INSEAD timed video questions; HBS post-interview written reflection). citeturn9view0turn11view0turn12view0turn15view0turn17view0

It can generate realistic prompts with *programme-specific probability weighting*, using `probability` and `high_probability` flags so your simulator can sample “core” questions more frequently than edge cases.

It can evaluate answers using an evidence taxonomy that is actionable for automated scoring. Each question includes:
- `evidence_types` (e.g., leadership story, failure story, impact metric, values reflection, data analysis story)
- `evaluation_dimensions` (e.g., judgement, self-awareness, collaboration, integrity, school-fit precision)
These are designed as feature targets for rubric scoring, consistency checks, and follow-up-question selection.

## Dataset directory and files

[Download the complete dataset as a zip](sandbox:/mnt/data/mba_interview_dataset.zip)

The zip contains this directory structure (exactly as requested) and files per school:

- `/mba_interview_dataset/<school>/question_bank.json`  
  Step 1 (validated structure) + Step 2 (40–60 questions) + per-question metadata (probability, evidence types, evaluation dimensions)

- `/mba_interview_dataset/<school>/answer_framework.md`  
  Step 3 (school-specific answer maps) in markdown tables + evidence taxonomy + sources list

- `/mba_interview_dataset/<school>/evidence_map.json`  
  Step 4 (resource density) mapping question IDs → evidence types for programmatic evaluation

## Self-audit against requirements

Each school has ≥40 questions, with an explicit high-probability subset:

| School folder | Questions | High-probability flagged | Exact duplicates |
|---|---:|---:|---:|
| stanford_gsb | 50 | 20 | 0 |
| hbs | 49 | 22 | 0 |
| wharton | 50 | 21 | 0 |
| mit_sloan | 50 | 19 | 0 |
| chicago_booth | 50 | 18 | 0 |
| kellogg | 50 | 17 | 0 |
| berkeley_haas | 50 | 17 | 0 |
| yale_som | 50 | 15 | 0 |
| london_business_school | 50 | 16 | 0 |
| insead | 49 | 19 | 0 |

Format alignment checks (structural elements from official/credible sources are represented in the question banks): Wharton includes TBD opening/pacing and 10-minute reflection; HBS includes Post-Interview Reflection; MIT Sloan includes the pre-interview data prompt; Yale SOM includes 60-second video prompts; Haas includes prerecorded-video style prompts; INSEAD includes Kira video prompts and explicit two-interviewer consistency prep. citeturn9view0turn11view0turn12view0turn15view0turn8view0turn17view0turn23view0