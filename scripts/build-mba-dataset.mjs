/**
 * Generates /data/mba_interview_dataset/* from handoff paths and explicit templates.
 * Run from repo root: node scripts/build-mba-dataset.mjs
 *
 * Attribution model:
 * - haas question text + rubrics: mirrored from public/InterviewRoom/src/js/haas-data.js (repo source of truth for Haas).
 * - Interview structure claims: mba_final_handoff_static/deep-research-report (2).md (MBA table + narrative).
 * - URLs: step4_secondary_sources_pack + step5_community_texture_pack CSVs (read at build time).
 * - Non-Haas practice stems: labeled practice_archetype; tied to structure + CSV URLs in handoff_basis (not claimed as leaked questions).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const HANDOFF = path.join(ROOT, "mba_final_handoff_static");
const OUT = path.join(ROOT, "data", "mba_interview_dataset");

const REPORT2 = "mba_final_handoff_static/deep-research-report (2).md";

const HAAS_SETS = [
  [
    { id: "S1-Q1", text: "Walk me through your career path and the decisions that led you to where you are today." },
    { id: "S1-Q2", text: "Why do you want an MBA at this point in your career?" },
    { id: "S1-Q3", text: "Tell me about a time when you faced strong opposition to one of your ideas. What did you do?" },
    { id: "S1-Q4", text: "Describe a situation where you had to motivate a team when morale was low." },
    { id: "S1-Q5", text: "What is the biggest transformation happening in your industry today?" },
    { id: "S1-Q6", text: "If admitted, how would you contribute to the Haas community?" },
  ],
  [
    { id: "S2-Q1", text: "What are your short-term and long-term career goals?" },
    { id: "S2-Q2", text: "Why Berkeley Haas specifically?" },
    { id: "S2-Q3", text: "Tell me about a time when you were proven wrong in a professional debate. How did you react?" },
    { id: "S2-Q4", text: "Describe a time when you had to work on a project where you initially lacked familiarity with the topic." },
    { id: "S2-Q5", text: "What is one professional accomplishment you are most proud of?" },
    { id: "S2-Q6", text: "Which of Haas' four defining principles resonates most with you and why?" },
  ],
  [
    { id: "S3-Q1", text: "What motivates your career decisions?" },
    { id: "S3-Q2", text: "Tell me about a time you demonstrated leadership without formal authority." },
    { id: "S3-Q3", text: "Describe a conflict you had with a teammate and how you handled it." },
    { id: "S3-Q4", text: "Tell me about a risk you took professionally. What happened?" },
    { id: "S3-Q5", text: "What clubs, initiatives, or activities would you engage with at Haas?" },
    { id: "S3-Q6", text: "What role do you typically play in teams?" },
  ],
  [
    { id: "S4-Q1", text: "Why do you believe now is the right time for you to pursue an MBA?" },
    { id: "S4-Q2", text: "Tell me about the most challenging professional situation you have faced." },
    { id: "S4-Q3", text: "Describe a time when you had to persuade someone to change their mind." },
    { id: "S4-Q4", text: "What is something constructive feedback taught you about yourself?" },
    { id: "S4-Q5", text: "How have you built consensus among people with differing opinions?" },
    { id: "S4-Q6", text: "What impact do you want to have in your industry in the long term?" },
  ],
  [
    { id: "S5-Q1", text: "What distinguishes you from other MBA applicants?" },
    { id: "S5-Q2", text: "Tell me about a time you worked within a diverse team." },
    { id: "S5-Q3", text: "Describe a project that did not initially go well. What did you do to address it?" },
    { id: "S5-Q4", text: "What would your manager say are your greatest strengths?" },
    { id: "S5-Q5", text: "What do you want out of your MBA experience personally and professionally?" },
    { id: "S5-Q6", text: "If you were leading your organization today, what is one strategic change you would make?" },
  ],
  [
    { id: "S6-Q1", text: "Tell me about yourself beyond what is on your resume." },
    { id: "S6-Q2", text: "Describe a time when you had to learn something quickly in order to succeed." },
    { id: "S6-Q3", text: "Tell me about a time when humility played an important role in your work." },
    { id: "S6-Q4", text: "What is one weakness you are actively working to improve?" },
    { id: "S6-Q5", text: "What role do you typically take within your group of friends or communities outside work?" },
    { id: "S6-Q6", text: "What would your ideal post-MBA job look like?" },
  ],
  [
    { id: "S7-Q1", text: "How did you decide on your current career path?" },
    { id: "S7-Q2", text: "Describe a time when you had to manage a stressful or complicated project." },
    { id: "S7-Q3", text: "Tell me about a time you promoted collaboration across different teams." },
    { id: "S7-Q4", text: "What is the biggest lesson you have learned from a professional failure?" },
    { id: "S7-Q5", text: "What will you bring to your MBA classmates that they may not already have?" },
    { id: "S7-Q6", text: "Is there anything else you would like the admissions committee to know about you?" },
  ],
];

const HAAS_REC = [
  { q: "walk me through your career path and the decisions that led you to where you are today", g: "Explain the logic behind progression, key decisions, learning at each stage, and how it prepares your next step." },
  { q: "why do you want an mba at this point in your career", g: "Frame MBA as deliberate investment in skills, perspective, transition or acceleration." },
  { q: "tell me about a time when you faced strong opposition to one of your ideas", g: "Show listening, refining, persuading, or adapting; bold ideas with humility and evidence." },
  { q: "describe a situation where you had to motivate a team when morale was low", g: "Stress alignment and collaboration, not only individual motivation." },
  { q: "what is the biggest transformation happening in your industry today", g: "Name a shift, why it matters, strategic implications." },
  { q: "if admitted, how would you contribute to the haas community", g: "Answer in terms of us: perspective, involvement, what classmates gain." },
  { q: "what are your short-term and long-term career goals", g: "Credible arc: near-term role/function/industry, then broader impact." },
  { q: "why berkeley haas specifically", g: "Defining Leadership Principles, Bay Area context, curriculum, culture, contribution." },
  { q: "tell me about a time when you were proven wrong in a professional debate", g: "Composure, openness to evidence, humility, learning." },
  { q: "describe a time when you had to work on a project where you initially lacked familiarity", g: "Curiosity, learning speed, resourcefulness, seeking perspectives." },
  { q: "what is one professional accomplishment you are most proud of", g: "Impact, your role, why it mattered." },
  { q: "which of haas' four defining principles resonates most with you", g: "Pick one, define in your words, prove with a story." },
  { q: "what motivates your career decisions", g: "Problems, opportunities, impact; tie to past and future." },
  { q: "tell me about a time you demonstrated leadership without formal authority", g: "Influence through initiative, communication, collaboration." },
  { q: "describe a conflict you had with a teammate and how you handled it", g: "Trust, differences, improved outcome." },
  { q: "tell me about a risk you took professionally", g: "Intelligent risk, not impulsive." },
  { q: "what clubs, initiatives, or activities would you engage with at haas", g: "Name specifics and what you would do there." },
  { q: "what role do you typically play in teams", g: "Behaviors and values, not buzzwords." },
  { q: "why do you believe now is the right time for you to pursue an mba", g: "Tie needs to curriculum, peers, coaching, culture." },
  { q: "tell me about the most challenging professional situation you have faced", g: "Character and growth; concise organized response." },
  { q: "describe a time when you had to persuade someone to change their mind", g: "Listen, reasoning, consensus." },
  { q: "what is something constructive feedback taught you about yourself", g: "Receptivity, reflection, change." },
  { q: "how have you built consensus among people with differing opinions", g: "Empathy, structure, evidence, trust." },
  { q: "what impact do you want to have in your industry in the long term", g: "Grounded problems, environment, strengths and values." },
  { q: "what distinguishes you from other mba applicants", g: "Distinctive perspective and contribution to community." },
  { q: "tell me about a time you worked within a diverse team", g: "Learning, adaptation, how difference improved work." },
  { q: "describe a project that did not initially go well", g: "Diagnosis, steps to improve, resilience." },
  { q: "what would your manager say are your greatest strengths", g: "Judgment, leadership, collaboration with examples." },
  { q: "what do you want out of your mba experience personally and professionally", g: "Connect goals to Haas structure." },
  { q: "if you were leading your organization today, what is one strategic change you would make", g: "Problem, move, why it matters." },
  { q: "tell me about yourself beyond what is on your resume", g: "Values, community, perspective beyond resume." },
  { q: "describe a time when you had to learn something quickly in order to succeed", g: "Curiosity, speed, resources." },
  { q: "tell me about a time when humility played an important role in your work", g: "Self-awareness without arrogance." },
  { q: "what is one weakness you are actively working to improve", g: "Self-awareness and credible MBA-linked plan." },
  { q: "what role do you typically take within your group of friends or communities outside work", g: "Human dimension, community role." },
  { q: "what would your ideal post-mba job look like", g: "Progression tied to skills and exploration." },
  { q: "how did you decide on your current career path", g: "Reasoning and reflection on evolution." },
  { q: "describe a time when you had to manage a stressful or complicated project", g: "Prioritization, communication, resilience." },
  { q: "tell me about a time you promoted collaboration across different teams", g: "Align goals, remove barriers." },
  { q: "what is the biggest lesson you have learned from a professional failure", g: "Growth and character." },
  { q: "what will you bring to your mba classmates that they may not already have", g: "Contribution to class community." },
  { q: "is there anything else you would like the admissions committee to know about you", g: "One concise additive point." },
];

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function haasGuidance(text) {
  const n = norm(text);
  const row = HAAS_REC.find((r) => n.includes(norm(r.q)) || norm(r.q).includes(n));
  return row ? row.g : "Give a clear STAR-style story where applicable; connect to Haas Defining Leadership Principles when relevant.";
}

function expectedMapFromGuidance(questionGoal, guidance, redFlags = []) {
  return {
    questionGoal,
    corePoints: [
      "Answer the question directly in the first 1–2 sentences.",
      "Include a concrete situation or example with your role and actions.",
      "Close with outcome, learning, or how it shapes your MBA goals.",
    ],
    niceToHave: [guidance.slice(0, 220)],
    redFlags: redFlags.length ? redFlags : ["Vague generalities with no example.", "Contradicting your stated goals.", "Negative framing about teammates without accountability."],
    examplesOfGoodDirection: [guidance],
  };
}

function readCsvUrls(packDirName, schoolFolder, fileBase) {
  const p = path.join(HANDOFF, "sources", packDirName, schoolFolder, `${fileBase}-sources.csv`);
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8").trim();
  if (!raw) return [];
  const lines = raw.split("\n").slice(1);
  const urls = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const m = line.match(/https?:\/\/[^,\s"]+/);
    if (m) urls.push(m[0].replace(/"$/g, ""));
  }
  return [...new Set(urls)];
}

function parseSecondaryUrls(schoolFolder) {
  return readCsvUrls("step4_secondary_sources_pack", schoolFolder, "secondary");
}

function parseCommunityUrls(schoolFolder) {
  return readCsvUrls("step5_community_texture_pack", schoolFolder, "community");
}

const SCHOOL_FOLDERS = {
  stanford_gsb: "stanford-gsb",
  hbs: "harvard-business-school",
  wharton: "wharton",
  mit_sloan: "mit-sloan",
  chicago_booth: "chicago-booth",
  kellogg: "kellogg",
  berkeley_haas: "haas",
  yale_som: "yale-som",
  london_business_school: "london-business-school",
  insead: "insead",
};

const SCHOOL_META_BASE = {
  stanford_gsb: {
    display_name: "Stanford GSB",
    validated_interview_format:
      "1:1 structured behavioural interview focused on past actions; trained alumni or admissions; ~45–60 minutes; deep probing.",
    unique_elements:
      "All admits interview; emphasis on recent meaningful professional/community experiences; depth over breadth (per handoff report).",
    interviewer_type: "Alumni subset or MBA Admissions team",
    community_texture:
      "Community reports emphasize deep follow-ups and substance over polish (step5 community notes).",
  },
  hbs: {
    display_name: "Harvard Business School",
    validated_interview_format: "1:1 application-based interview tailored to your file; ~30 minutes.",
    unique_elements: "Post-Interview Reflection due within 24 hours (guidance often cited as ~300–450 words).",
    interviewer_type: "MBA Admissions Board member who reviewed your application",
    community_texture: "Reports emphasize file-aware, detail-probing questions (Clear Admit pattern in handoff CSV).",
  },
  wharton: {
    display_name: "The Wharton School",
    validated_interview_format: "Team Based Discussion ~35 minutes + ~10 minute 1:1 reflection.",
    unique_elements: "Group exercise evaluating collaboration, communication, leadership in a team setting.",
    interviewer_type: "Admissions team member for 1:1 segment",
    community_texture: "Community threads emphasize collaborative behavior over winning your own idea (handoff CSV).",
  },
  mit_sloan: {
    display_name: "MIT Sloan",
    validated_interview_format: "1:1 behavioural interview; virtual per official guidance in handoff.",
    unique_elements: "Pre-interview short-answer + PDF (data visualisation or data-driven decision slide) due shortly before interview.",
    interviewer_type: "Commonly admissions staff (handoff + community notes)",
    community_texture: "Structured, execution-focused prep flow (step4 secondary notes).",
  },
  chicago_booth: {
    display_name: "Chicago Booth",
    validated_interview_format: "1:1 conversational interview; time for your questions.",
    unique_elements: "Single required interview; student, alum, or staff weighted equally in evaluation.",
    interviewer_type: "Student, alum, or admissions staff",
    community_texture: "Fit-aware conversational tone (handoff structure).",
  },
  kellogg: {
    display_name: "Northwestern Kellogg",
    validated_interview_format: "1:1 behavioural interview; resume-only (blind) by design.",
    unique_elements: "Interviewer has not read full application; restate goals and motivations clearly.",
    interviewer_type: "Often alumni depending on cycle",
    community_texture: "Blind interview implies resume-grounded storytelling.",
  },
  berkeley_haas: {
    display_name: "Berkeley Haas",
    validated_interview_format: "Invitation-only; prerecorded video and/or live remote options.",
    unique_elements: "Defining Leadership Principles as cultural lens; dynamic interview options per official interview page (step4).",
    interviewer_type: "Student or alum for live remote",
    community_texture: "Same as school-affiliated interview + values pages (step4).",
  },
  yale_som: {
    display_name: "Yale School of Management",
    validated_interview_format: "Blind ~30 minute interview + separate video questions (two; ~60 seconds each in handoff).",
    unique_elements: "Video assesses communication; live interview resume-only.",
    interviewer_type: "Second-year student, recent alum, or admissions committee member",
    community_texture: "Separate components for video vs blind live (handoff).",
  },
  london_business_school: {
    display_name: "London Business School",
    validated_interview_format: "Interview with alumni or senior admissions staff; regional; in-person or online.",
    unique_elements: "Admissions video via Kira Talent; interviewer may have read full application.",
    interviewer_type: "Alumni or senior admissions staff",
    community_texture: "Alumni/admissions mix and geography (handoff).",
  },
  insead: {
    display_name: "INSEAD",
    validated_interview_format: "Mandatory Kira video assessment + if pre-selected, two alumni interviews.",
    unique_elements:
      "Handoff cites Kira pattern: four video questions (45s prep / 60s response) + one written (5 minutes) within 48 hours of deadline; dual alumni reports.",
    interviewer_type: "Two alumni interviewers submitting reports",
    community_texture: "Applicant-cycle timing texture (Clear Admit in handoff CSV).",
  },
};

const BEHAVIORAL_ARCHETYPES = [
  { text: "Tell me about a time you influenced an outcome when you did not have formal authority.", types: ["leadership_story"], dims: ["judgement", "collaboration"] },
  { text: "Describe a professional setback or failure. What happened and what did you change afterward?", types: ["failure_story", "self_awareness"], dims: ["integrity", "self_awareness"] },
  { text: "Tell me about a time you resolved a conflict between two stakeholders.", types: ["collaboration_story"], dims: ["empathy", "judgement"] },
  { text: "Give an example of using data or analysis to drive a decision.", types: ["data_story", "impact_metric"], dims: ["judgement"] },
  { text: "Tell me about a time you had to deliver results with incomplete information.", types: ["judgement_story"], dims: ["judgement", "resilience"] },
  { text: "Describe a time you changed your mind after receiving new information.", types: ["self_awareness"], dims: ["humility", "judgement"] },
  { text: "Tell me about a time you mentored or developed someone.", types: ["leadership_story"], dims: ["collaboration", "impact"] },
  { text: "Describe a high-stakes presentation or executive conversation you led.", types: ["communication_story"], dims: ["clarity", "impact"] },
  { text: "Tell me about a time you improved a process or way of working.", types: ["impact_metric"], dims: ["execution", "judgement"] },
  { text: "Describe working across cultures, time zones, or language barriers.", types: ["global_story"], dims: ["collaboration", "adaptability"] },
  { text: "Tell me about an ethical grey area you navigated.", types: ["values_reflection"], dims: ["integrity", "judgement"] },
  { text: "Describe a time you said no to a senior leader or client.", types: ["judgement_story"], dims: ["integrity", "courage"] },
  { text: "Tell me about a time you had to fire someone or end a collaboration.", types: ["leadership_story"], dims: ["judgement", "empathy"] },
  { text: "Describe a time you volunteered for an ambiguous project and made it succeed.", types: ["initiative_story"], dims: ["execution", "leadership"] },
  { text: "What is the hardest feedback you have received, and how did you respond?", types: ["self_awareness"], dims: ["humility", "growth"] },
  { text: "Tell me about a time you balanced short-term pressure with long-term quality.", types: ["judgement_story"], dims: ["judgement", "prioritization"] },
  { text: "Describe a time you built trust in a low-trust environment.", types: ["collaboration_story"], dims: ["empathy", "integrity"] },
  { text: "Tell me about a product, service, or initiative you launched.", types: ["impact_metric"], dims: ["execution", "impact"] },
  { text: "Describe a time you disagreed with your team’s consensus.", types: ["judgement_story"], dims: ["courage", "collaboration"] },
  { text: "Why MBA, and why now?", types: ["goals_clarity"], dims: ["school_fit", "judgement"] },
  { text: "What are your short-term and long-term career goals?", types: ["goals_clarity"], dims: ["school_fit"] },
  { text: "What kind of leader do you aspire to be in ten years?", types: ["values_reflection"], dims: ["self_awareness"] },
  { text: "What industries or functions are you exploring post-MBA?", types: ["goals_clarity"], dims: ["exploration"] },
  { text: "How would classmates describe you in one sentence?", types: ["values_reflection"], dims: ["self_awareness"] },
  { text: "What is a misconception people might have about you?", types: ["self_awareness"], dims: ["humility"] },
  { text: "Tell me about a time you had to prioritize among three urgent demands.", types: ["prioritization"], dims: ["judgement", "execution"] },
  { text: "Describe a time you recovered a failing project.", types: ["resilience"], dims: ["execution", "judgement"] },
  { text: "What would you ask the admissions committee if roles were reversed?", types: ["curiosity"], dims: ["school_fit"] },
];

/**
 * Default session timers per school — derived from `deep-research-report (2).md`
 * “Typical duration” column and interview structure (1:1 length, TBD + reflection, etc.).
 * Individual prompts override for video/Kira/written/TBD segments (see applyQuestionTiming).
 */
function getSchoolSessionDefaults(schoolId) {
  const map = {
    stanford_gsb: { prepTime: 90, answerTime: 480, totalQuestions: 6 }, // 45–60 min deep 1:1
    hbs: { prepTime: 45, answerTime: 300, totalQuestions: 5 }, // ~30 min file interview
    wharton: { prepTime: 45, answerTime: 300, totalQuestions: 6 }, // 35 + 10 min components blended across prompts
    mit_sloan: { prepTime: 45, answerTime: 255, totalQuestions: 6 }, // ~30 min behavioural
    chicago_booth: { prepTime: 60, answerTime: 540, totalQuestions: 6 }, // ~1 hour conversational
    kellogg: { prepTime: 45, answerTime: 315, totalQuestions: 6 }, // 30–45 min blind
    berkeley_haas: { prepTime: 45, answerTime: 180, totalQuestions: 6 }, // aligned with /InterviewRoom Haas config
    yale_som: { prepTime: 45, answerTime: 255, totalQuestions: 6 }, // ~30 min blind live; videos override
    london_business_school: { prepTime: 60, answerTime: 450, totalQuestions: 6 }, // 45–60 min reports
    insead: { prepTime: 45, answerTime: 330, totalQuestions: 6 }, // alumni 45–60; Kira overrides
  };
  return map[schoolId] || { prepTime: 45, answerTime: 180, totalQuestions: 6 };
}

function applyQuestionTiming(schoolId, q) {
  if (schoolId === "berkeley_haas") {
    return { ...q, prep_time_seconds: 45, answer_time_seconds: 180 };
  }
  const d = getSchoolSessionDefaults(schoolId);
  let prep = d.prepTime;
  let answer = d.answerTime;
  const phase = q.interview_phase || "";
  const qt = String(q.question_type || "");

  if (phase === "video" && schoolId === "yale_som") {
    prep = 10;
    answer = 60;
  } else if (phase === "kira_video") {
    prep = schoolId === "london_business_school" ? 30 : 45;
    answer = schoolId === "london_business_school" ? 75 : 60;
  } else if (phase === "kira_written" || qt === "written_timed") {
    prep = 60;
    answer = 300;
  } else if (phase === "post_interview_reflection" || qt === "written_reflection") {
    prep = 120;
    answer = 600;
  } else if (phase === "pre_interview_written" && schoolId === "mit_sloan") {
    prep = 180;
    answer = 600;
  } else if (phase === "tbd_debrief" && schoolId === "wharton") {
    prep = 60;
    answer = 180;
  } else if (phase === "one_on_one" && schoolId === "wharton") {
    prep = 45;
    answer = 600;
  } else if (schoolId === "insead" && phase === "alumni_live") {
    prep = 45;
    answer = 420;
  }

  return { ...q, prep_time_seconds: prep, answer_time_seconds: answer };
}

function structuralBlocks(schoolId) {
  const basis = { report_md: REPORT2, practice_label: "structural_simulation" };
  switch (schoolId) {
    case "hbs":
      return [
        {
          text: "Post-Interview Reflection simulation: HBS invitees submit a written reflection after the interview (handoff cites ~300–450 words, due within 24 hours). Draft the reflection you would submit: what you covered, what you wish you had added, and tone appropriate to admissions.",
          phase: "post_interview_reflection",
          qtype: "written_reflection",
          types: ["reflection_quality", "accuracy"],
          dims: ["self_awareness", "integrity"],
          high_probability: true,
          basis,
        },
        {
          text: "File-aware probe simulation: your interviewer has reviewed your full application. Walk through one bullet on your resume they might ask you to go two levels deeper on.",
          phase: "live_file_aware",
          qtype: "behavioral",
          types: ["depth_probe"],
          dims: ["specificity", "consistency"],
          high_probability: true,
          basis,
        },
      ];
    case "wharton":
      return [
        {
          text: "TBD simulation (debrief): After a 35-minute team discussion (handoff), explain in 2–3 minutes how you balanced advocating for your view with helping the group reach a recommendation.",
          phase: "tbd_debrief",
          qtype: "team_exercise",
          types: ["collaboration_story", "communication"],
          dims: ["collaboration", "empathy", "judgement"],
          high_probability: true,
          basis,
        },
        {
          text: "1:1 reflection simulation (handoff ~10 minutes): What is one thing you want the admissions staff member to understand about how you behaved in the group exercise?",
          phase: "one_on_one",
          qtype: "reflection",
          types: ["self_awareness"],
          dims: ["humility", "clarity"],
          high_probability: true,
          basis,
        },
      ];
    case "mit_sloan":
      return [
        {
          text: "Pre-interview exercise simulation: MIT Sloan uses a short written component and a PDF such as a data visualisation or data-driven decision slide due shortly before the interview (handoff). Outline the headline insight, the chart or table you would show, and the decision it supported.",
          phase: "pre_interview_written",
          qtype: "data_task",
          types: ["data_story", "slide_logic"],
          dims: ["judgement", "clarity"],
          high_probability: true,
          basis,
        },
      ];
    case "yale_som":
      return [
        {
          text: "[60-second video simulation] Why pursue an MBA, and why now? (Handoff cites ~60 seconds per video question.)",
          phase: "video",
          qtype: "timed_video",
          types: ["communication", "goals_clarity"],
          dims: ["clarity", "school_fit"],
          high_probability: true,
          basis,
        },
        {
          text: "[60-second video simulation] Tell me about a recent professional challenge and what you learned.",
          phase: "video",
          qtype: "timed_video",
          types: ["self_awareness"],
          dims: ["clarity", "growth"],
          high_probability: true,
          basis,
        },
      ];
    case "insead":
      return [
        {
          text: "[Kira-style video simulation — handoff: ~45s prep / ~60s response] Describe a time you worked with people from very different cultural or professional backgrounds.",
          phase: "kira_video",
          qtype: "timed_video",
          types: ["global_story", "collaboration"],
          dims: ["adaptability", "international_motivation"],
          high_probability: true,
          basis,
        },
        {
          text: "[Kira-style written simulation — handoff: ~5 minutes] Why INSEAD now, and how does it connect to your international career goals?",
          phase: "kira_written",
          qtype: "written_timed",
          types: ["school_fit", "goals_clarity"],
          dims: ["school_fit", "international_motivation"],
          high_probability: true,
          basis,
        },
        {
          text: "Alumni interview simulation (handoff: two alumni interviews if pre-selected): What story best shows your leadership outside your home country or culture?",
          phase: "alumni_live",
          qtype: "behavioral",
          types: ["leadership_story", "global_story"],
          dims: ["leadership", "consistency"],
          high_probability: true,
          basis,
        },
      ];
    case "london_business_school":
      return [
        {
          text: "Kira admissions video simulation (handoff: LBS uses Kira Talent). In 60–90 seconds, why LBS and why London for your goals?",
          phase: "kira_video",
          qtype: "timed_video",
          types: ["school_fit"],
          dims: ["school_fit", "clarity"],
          high_probability: true,
          basis,
        },
        {
          text: "Alumni interview simulation: how would you explain your post-MBA target geography and role to an alum in your region?",
          phase: "alumni_live",
          qtype: "goals",
          types: ["goals_clarity"],
          dims: ["school_fit", "judgement"],
          high_probability: true,
          basis,
        },
      ];
    case "berkeley_haas":
      return [];
    default:
      return [];
  }
}

function buildQuestionsForSchool(schoolId) {
  const folder = SCHOOL_FOLDERS[schoolId];
  const secondary = parseSecondaryUrls(folder);
  const community = parseCommunityUrls(folder);
  const handoff_basis_common = {
    report_md: REPORT2,
    step4_urls_sample: secondary.slice(0, 6),
    step5_urls_sample: community.slice(0, 6),
    practice_archetype_note:
      "Practice stems implement the interview structure described in the handoff report; they are not claimed to be verbatim past interview questions.",
  };

  if (schoolId === "berkeley_haas") {
    const list = [];
    let i = 0;
    for (const set of HAAS_SETS) {
      for (const q of set) {
        i += 1;
        const g = haasGuidance(q.text);
        list.push({
          id: `haas-${q.id}`,
          interview_phase: "live_or_video",
          text: q.text,
          question_type: "behavioral_or_school_fit",
          high_probability: i <= 17,
          evidence_types: ["haas_repo_question_bank"],
          evaluation_dimensions: ["school_fit", "values_alignment", "specificity"],
          handoff_basis: {
            ...handoff_basis_common,
            repo_source: "public/InterviewRoom/src/js/haas-data.js",
            step4_urls_sample: secondary,
          },
          expected_answer_map: expectedMapFromGuidance("Respond with specificity and Haas-relevant values framing.", g),
        });
      }
    }
    const videoDupes = ["S1-Q2", "S2-Q2", "S3-Q5", "S4-Q1", "S5-Q5", "S6-Q4", "S7-Q1", "S7-Q5"];
    for (const id of videoDupes) {
      const orig = list.find((x) => x.id === `haas-${id}`);
      if (orig) {
        list.push({
          ...orig,
          id: `haas-video-${id}`,
          interview_phase: "prerecorded_video_simulation",
          text: `[Prerecorded video simulation — same practice content as live] ${orig.text}`,
          high_probability: false,
        });
      }
    }
    return list.map((q) => applyQuestionTiming("berkeley_haas", q));
  }

  const structural = structuralBlocks(schoolId);
  const questions = [];
  let idx = 0;

  const preamble =
    schoolId === "kellogg"
      ? "[Resume-only simulation] The interviewer has only your resume. "
      : schoolId === "yale_som"
        ? "[Blind interview simulation] The interviewer has your resume only. "
        : schoolId === "hbs"
          ? "[File-aware simulation] The interviewer has read your application. "
          : schoolId === "stanford_gsb"
            ? "[Deep behavioural simulation] Expect follow-ups; focus on recent meaningful experiences. "
            : schoolId === "chicago_booth"
              ? "[Conversational simulation] Leave room for authenticity and questions back. "
              : "";

  for (const s of structural) {
    idx += 1;
    questions.push({
      id: `${schoolId}-str-${idx}`,
      interview_phase: s.phase,
      text: s.text,
      question_type: s.qtype,
      high_probability: s.high_probability,
      evidence_types: s.types,
      evaluation_dimensions: s.dims,
      handoff_basis: { ...handoff_basis_common, ...s.basis },
      expected_answer_map: expectedMapFromGuidance(
        `Address the simulated component (${s.phase}) with specifics.`,
        `Ground in real examples; align with ${SCHOOL_META_BASE[schoolId].display_name} structure from handoff report.`
      ),
    });
  }

  for (let j = 0; j < BEHAVIORAL_ARCHETYPES.length; j++) {
    const a = BEHAVIORAL_ARCHETYPES[j];
    idx += 1;
    const high =
      schoolId === "stanford_gsb"
        ? j < 20
        : schoolId === "hbs"
          ? j < 22
          : j < 18;
    questions.push({
      id: `${schoolId}-bhv-${j + 1}`,
      interview_phase: "live_behavioral",
      text: `${preamble}${a.text}`,
      question_type: "behavioral",
      high_probability: high,
      evidence_types: a.types,
      evaluation_dimensions: a.dims,
      handoff_basis: handoff_basis_common,
      expected_answer_map: expectedMapFromGuidance(
        "Use situation, task, action, result where appropriate; add reflection.",
        "Show judgement, self-awareness, and collaboration signals appropriate to this programme’s interview style in the handoff report."
      ),
    });
  }

  while (questions.length < 50) {
    idx += 1;
    questions.push({
      id: `${schoolId}-extra-${idx}`,
      interview_phase: "live_behavioral",
      text: `${preamble}What is a problem in your industry you would like to help solve post-MBA, and what is your first step?`,
      question_type: "goals",
      high_probability: false,
      evidence_types: ["goals_clarity", "impact_metric"],
      evaluation_dimensions: ["school_fit", "judgement"],
      handoff_basis: handoff_basis_common,
      expected_answer_map: expectedMapFromGuidance(
        "Name a credible problem, why it matters, and a concrete first step.",
        "Tie to skills you want from the MBA without overstating certainty."
      ),
    });
  }

  return questions.slice(0, 50).map((q) => applyQuestionTiming(schoolId, q));
}

function buildEvidenceMap(questions) {
  const byId = {};
  for (const q of questions) {
    byId[q.id] = {
      evidence_types: q.evidence_types || [],
      evaluation_dimensions: q.evaluation_dimensions || [],
      interview_phase: q.interview_phase,
      handoff_basis: q.handoff_basis || {},
    };
  }
  return {
    version: 1,
    questions: byId,
    taxonomy_notes:
      "Evidence types and dimensions align with dataset design described in deep-research-report (2).md; URLs appear in per-question handoff_basis and school_meta.",
  };
}

function buildAnswerFrameworkMd(schoolId, meta) {
  const m = SCHOOL_META_BASE[schoolId];
  const folder = SCHOOL_FOLDERS[schoolId];
  const sec = parseSecondaryUrls(folder).join("\n- ");
  const com = parseCommunityUrls(folder).join("\n- ");

  return `# ${m.display_name} — answer framework

## Handoff structure (from ${REPORT2})

**Validated format (paraphrased from handoff):** ${m.validated_interview_format}

**Distinctive elements:** ${m.unique_elements}

**Interviewer profile (handoff):** ${m.interviewer_type}

**Community / texture note:** ${m.community_texture}

## Evidence taxonomy (programmatic targets)

| Evidence type | Use |
|---|---|
| leadership_story | Past actions showing influence and judgement |
| failure_story / resilience | Learning, accountability |
| goals_clarity | Credible MBA and career arc |
| data_story | Quant reasoning, slide logic (MIT pre-interview) |
| school_fit | Programme-specific why-school |
| values_reflection | Principles and self-awareness |

## School-affiliated sources (step4 CSV URLs)

- ${sec || "(no CSV in handoff)"}

## Community / applicant texture (step5 CSV URLs)

- ${com || "(no CSV in handoff)"}

## How to answer (shared)

1. Answer the question first; then illustrate.
2. Use one strong example with your role, tradeoffs, and outcome.
3. Reflect on learning or how it informs MBA goals.
4. For simulations (TBD, Kira, video timers), respect the stated time box in your practice.

---
_Generated by scripts/build-mba-dataset.mjs. Do not treat practice stems as confidential interview content._
`;
}

function tagsFromQuestionType(qtype) {
  const t = String(qtype || "").toLowerCase();
  const tags = [];
  if (t.includes("goal")) tags.push("goals");
  if (t.includes("behavioral")) tags.push("leadership");
  if (t.includes("values") || t.includes("reflection")) tags.push("values");
  if (t.includes("team") || t.includes("tbd")) tags.push("collaboration");
  if (t.includes("video") || t.includes("kira")) tags.push("communication");
  if (t.includes("school_fit") || t.includes("why")) tags.push("goals");
  return tags.length ? tags : ["behavioral"];
}

function sessionQuestionPayload(q) {
  if (!q) return null;
  return {
    id: q.id,
    text: q.text,
    expected_answer_map: q.expected_answer_map,
    question_type: q.question_type,
    interview_phase: q.interview_phase,
    high_probability: !!q.high_probability,
    tags: tagsFromQuestionType(q.question_type),
    prep_time_seconds: q.prep_time_seconds,
    answer_time_seconds: q.answer_time_seconds,
  };
}

function buildInterviewRoomFile(schoolId, questions) {
  const d = getSchoolSessionDefaults(schoolId);
  const base = {
    version: 1,
    school_id: schoolId,
    prepTime: d.prepTime,
    answerTime: d.answerTime,
    totalQuestions: d.totalQuestions,
    timing_basis: "deep-research-report (2).md typical duration + structural components",
  };
  if (schoolId === "berkeley_haas") {
    const map = new Map(questions.map((q) => [q.id, q]));
    const sets = HAAS_SETS.map((set) =>
      set
        .map((row) => sessionQuestionPayload(map.get(`haas-${row.id}`)))
        .filter(Boolean)
    );
    return { ...base, pickMode: "random_set", sets };
  }
  return { ...base, pickMode: "shuffle_weighted", sets: null };
}

function truncateText(str, max) {
  const s = String(str || "").trim();
  if (!s) return "";
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function fmtAnswerDuration(sec) {
  const m = sec / 60;
  if (Math.abs(m - Math.round(m)) < 0.05) return `${Math.round(m)} min`;
  const whole = Math.floor(m);
  const s = Math.round(sec - whole * 60);
  if (whole === 0) return `${sec}s`;
  return s ? `${whole}m${s}s` : `${whole} min`;
}

/** UI + API listing: handoff interview style + default timers (prompts may override, e.g. 60s video). */
function buildListingForRegistry(schoolId, questionCount, interviewRoom) {
  const m = SCHOOL_META_BASE[schoolId];
  const pickBlurb =
    interviewRoom.pickMode === "random_set"
      ? "7 rotating six-question sets"
      : `weighted picks from ${questionCount}-prompt programme bank`;

  const timingTail =
    schoolId === "berkeley_haas"
      ? ""
      : " · video/Kira/written-style prompts use shorter timers in-session";

  return {
    interview_style_summary: truncateText(m.validated_interview_format, 158),
    unique_hook: truncateText(m.unique_elements, 132),
    interviewer_profile: truncateText(m.interviewer_type, 96),
    practice_mechanics: `Up to ${interviewRoom.totalQuestions} prompts · default ${interviewRoom.prepTime}s prep / ${fmtAnswerDuration(interviewRoom.answerTime)} answer · ${pickBlurb}${timingTail}`,
    question_bank_count: questionCount,
    pick_mode: interviewRoom.pickMode,
  };
}

function writeSchool(schoolId) {
  const folder = SCHOOL_FOLDERS[schoolId];
  const secondary = parseSecondaryUrls(folder);
  const community = parseCommunityUrls(folder);
  const meta = {
    school_id: schoolId,
    ...SCHOOL_META_BASE[schoolId],
    handoff_paths: {
      primary_structure_report: REPORT2,
      step4_pack: `mba_final_handoff_static/sources/step4_secondary_sources_pack/${folder}/`,
      step5_pack: `mba_final_handoff_static/sources/step5_community_texture_pack/${folder}/`,
    },
    secondary_source_urls: secondary,
    community_source_urls: community,
  };

  const questions = buildQuestionsForSchool(schoolId);
  const bank = {
    version: 1,
    school_id: schoolId,
    question_count: questions.length,
    questions,
  };

  const evidence = buildEvidenceMap(questions);
  const fw = buildAnswerFrameworkMd(schoolId, meta);
  const interviewRoom = buildInterviewRoomFile(schoolId, questions);
  const listing = buildListingForRegistry(schoolId, questions.length, interviewRoom);

  const dir = path.join(OUT, schoolId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "school_meta.json"), JSON.stringify(meta, null, 2));
  fs.writeFileSync(path.join(dir, "question_bank.json"), JSON.stringify(bank, null, 2));
  fs.writeFileSync(path.join(dir, "evidence_map.json"), JSON.stringify(evidence, null, 2));
  fs.writeFileSync(path.join(dir, "answer_framework.md"), fw);
  fs.writeFileSync(path.join(dir, "interview_room.json"), JSON.stringify(interviewRoom, null, 2));
  console.log("wrote", schoolId, questions.length, "questions");

  return {
    id: schoolId,
    display_name: meta.display_name,
    data_dir: `data/mba_interview_dataset/${schoolId}`,
    listing,
  };
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const schools = [];
  for (const id of Object.keys(SCHOOL_META_BASE)) {
    schools.push(writeSchool(id));
  }
  const reg = { version: 1, schools };
  fs.writeFileSync(path.join(OUT, "school_registry.json"), JSON.stringify(reg, null, 2));
  console.log("registry ->", path.join(OUT, "school_registry.json"));
}

main();
