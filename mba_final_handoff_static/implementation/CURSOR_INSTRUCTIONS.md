Use the files in this handoff as the source of truth.

Your job is implementation and data assembly, not open-ended research.

## Use these inputs
- `deep-research-report (1).md`
- `deep-research-report (2).md`
- `prompts.ts`
- `sources/step4_secondary_sources_pack/`
- `sources/step5_community_texture_pack/`

## Non-negotiable rules
1. Do not break the existing Haas-specific Interview Room.
2. Build the multi-school product as a separate route/page.
3. Do not hallucinate missing school data.
4. Create the missing school data files first, in a dedicated `/data/mba_interview_dataset/` directory.
5. Only after the data files exist, wire them into the runtime.

## Create this target structure
/data/mba_interview_dataset/
  /stanford_gsb/
    question_bank.json
    answer_framework.md
    evidence_map.json
    school_meta.json
  /hbs/
  /wharton/
  /mit_sloan/
  /chicago_booth/
  /kellogg/
  /berkeley_haas/
  /yale_som/
  /london_business_school/
  /insead/

## How to create the missing dataset files
- Use the deep research reports as the main school-by-school structure source.
- Use `step4_secondary_sources_pack` for school-affiliated nuance.
- Use `step5_community_texture_pack` for community/applicant texture.
- Preserve school-specific structure:
  - Stanford: structured behavioral
  - HBS: file-aware interview + post-interview reflection
  - Wharton: TBD + short reflection interview
  - MIT Sloan: pre-interview short-answer + interview
  - Kellogg: resume-based behavioral
  - Booth: conversational fit-aware
  - Haas: prerecorded video/live hybrid
  - Yale SOM: video questions + blind interview
  - LBS: alumni/admissions interview
  - INSEAD: Kira + alumni interviews

## Implementation sequence
A. Audit current repo and locate Haas-specific code.
B. Create school registry.
C. Create missing school data files under `/data/mba_interview_dataset/`.
D. Build shared interview engine.
E. Keep Haas working.
F. Add multi-school route/page.
G. Wire first 5 schools.
H. Then wire remaining 5 schools.

## Output deliverables
- repo audit note
- school registry
- shared interview engine
- answer evaluation layer
- final summary layer
- preserved Haas experience
- new multi-school UI
- README for developers
