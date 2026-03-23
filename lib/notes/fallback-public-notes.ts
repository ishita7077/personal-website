import { Note } from "@/lib/notes/types";
import { siteConfig } from "@/config/site";

// Fallback public notes used when Supabase is not configured.
// These mirror the markdown files in content/notes/*.md.

const substackLine = `for long-form writing, see [The Numismatica](${siteConfig.substackUrl}).`;

const ABOUT_ME_CONTENT = `Hello! I'm Ishita  
I am building and experimenting at the intersection of Blockchains and AI.

## currently

- **Polkassembly - Remote (Bangkok)**
  - VP of strategic initiatives · $25M SaaS company · 40+ enterprise clients
  - Built and shipped GavBot, an AI fundraising co-pilot used by 1,200+ founders
  - Led polkassembly's $250K raise with Gavin Wood (Ethereum co-founder) as lead investor
  - Scaled Polkasafe (treasury tooling for blockchain protocols) from $35M to $300M AUM in 6 months - 2nd largest in the Polkadot ecosystem

## previously

- **Avail · Blockchain Infra Builder · $800M Series A backed by Founders Fund - Dubai**
  - Led and executed their $70M raise - Peter Thiel's Founders Fund co-led both Seed and Series A
  - Led vendor negotiations with market makers and exchanges for their token launch; the token delivered $350M trading volume in week 1, top 1% of 5K+ crypto launches
  - Wrote the industry's first Token Vendor Negotiations Handbook - 500+ founders, $8M+ in token launch costs saved

- **Elixir Capital · VC Fund based out of London & Abu Dhabi · hub71 - Abu Dhabi**
  - Established Research Unions - researcher community with 100+ technical members
  - As Investments Principal - sourced and led due diligence on 300+ startups
  - Built Elixir's Investment Research platform including co-authoring thought leadership reports on Blockchain investing that received 2M views on X

- **Woodstock Fund · India's Oldest Blockchain VC Fund · $300M peak AUM - Dubai**
  - Speed ran Analyst to Research Partner in 2 years; featured in YourStory (49M readers), KR Asia
  - Deployed $4.5M across 15 deals; brought Sequoia as co-lead on MetaSky

- **Deutsche bank· Germany's largest bank · Intern - Mumbai office**
  - Built Python automations for equities market risk desk
  - Decline pre-placement offer to join Woodstock Fund

- **Bits Pilani · Electronics and Instrumentation (EIE), with a Minor in Finance**
  - Publications:
    - Paper on Antenna design presented at European Conf. on Antenna & Propagation
    - Paper in Physics published in Begell House's Telecommunications & Radio Engineering journal
    - 15 citations; Research Gate profile
  - Events Head, Culture Fest: Directed 120+ volunteers in executing 48 high-impact performing arts events, managing a $130K budget
  - Elected as Department Secretary by 100+ student members; acted as liaison between faculty and student body

## & related paraphernalia

- Mentoring: Helped 50+ entrepreneurs via programs with Polkadot Decoded, Women in Web3 and Builder's Tribe; hosted and moderated 3 panels with 300+ audience
- Paws 2 Whiskers Volunteer: Conduct online foster trainings and adopted my rescue dog
- McKinsey NGWL: Invited to McKinsey's Next Generation Women Leaders' summit (Asia, 2020)
- Economic Times Award : Won Economic Times' 4-phased national competition; in the top 0.3% (2020)
- Interests: acted in 3 college drama productions, 4 years of training in Hindustani Classical Singing, and traveled across SE Asia and Europe, visited 15 countries since 2020`;

export const FALLBACK_PUBLIC_NOTES: Note[] = [
  {
    id: "interview-room-fallback",
    slug: "interview-room",
    title: "interview room",
    content: [
      "# interview room",
      "",
      "practice interviews with timed questions, webcam recording, and live transcription.",
      "",
      "- custom questions + flexible prep/answer timing",
      "- optional AI transcript feedback",
      "- all recordings stay on your device",
      "",
      "[Open Interview Room](https://www.ishitasrivastava.xyz/InterviewRoom)",
      "",
    ].join("\n"),
    emoji: "🎤",
    public: true,
    created_at: new Date().toISOString(),
    session_id: null,
    category: "navigation",
  },
  {
    id: "about-me-fallback",
    slug: "about-me",
    title: "about me",
    content: ABOUT_ME_CONTENT,
    emoji: "👋",
    public: true,
    created_at: new Date().toISOString(),
    session_id: null,
    category: "about",
  },
  {
    id: "quick-links-fallback",
    slug: "quick-links",
    title: "quick links",
    content: [
      "# quick links",
      "",
      "selected work and references that are a good starting point if you're trying to understand what i’ve been building and thinking about lately.",
      "",
      "- **Avail – $27M seed (Founders Fund)** · [Reuters](https://www.reuters.com/technology/peter-thiels-founders-fund-backs-27-mln-funding-avail-2024-02-26/)",
      "- **Avail – $43M Series A** · [The Block](https://www.theblock.co/post/298374/peter-thiel-founders-fund-series-a-avail)",
      "- **Hub71 crypto accelerator** · [Program overview](https://www.hub71.com/program/hub71-plus-digital-assets)",
      "- **Filecoin virtual machine report** · [X thread](https://x.com/FilecoinTLDR/status/1689270961218973696)",
      "- **MetaSky fundraise** · [Sequoia India & Woodstock announcement](https://timesofindia.indiatimes.com/web3-community-platform-metasky-brings-in-usd-1-8-million-led-by-sequoia-capital-india-woodstock-fund/articleshow/90398554.cms)",
      "",
      substackLine,
      "",
    ].join("\n"),
    emoji: "📎",
    public: true,
    created_at: new Date().toISOString(),
    session_id: null,
    category: "navigation",
  },
  {
    id: "principles-fallback",
    slug: "principles",
    title: "principles",
    content: [
      "# principles",
      "",
      "this is the system i use to make decisions and ship work.",
      "",
      "1) find the real constraint",
      "   - not the hand-wavy blocker",
      "   - the thing that most limits progress",
      "",
      "2) make uncertainty explicit",
      "   - list assumptions",
      "   - list disconfirming evidence",
      "   - update as data arrives",
      "",
      "3) break ambiguity into decision trees",
      "   - clear paths, clear thresholds",
      "   - not opinions, but structured forks",
      "",
      "4) optimize for clarity, then for velocity",
      "   - clarity first reduces waste",
      "   - velocity next drives impact",
      "",
      "5) ship systems not one-offs",
      "   - reusable patterns > one-time wins",
      "",
      "6) hold leverage, not ego",
      "   - ask: “what is the smallest action that changes the outcome?”",
      "",
    ].join("\n"),
    emoji: "📖",
    public: true,
    created_at: new Date().toISOString(),
    session_id: null,
    category: "principles",
  },
  {
    id: "bookmarks-fallback",
    slug: "bookmarks",
    title: "bookmarks",
    content: [
      "# bookmarks",
      "",
      "these are tools, frameworks, and foundational references i return to.",
      "",
      "- negotiation framework",
      "- launch execution checklist",
      "- investor relations playbook",
      "- token design incentive map",
      "- AI research-to-decision loop templates",
      "",
    ].join("\n"),
    emoji: "📚",
    public: true,
    created_at: new Date().toISOString(),
    session_id: null,
    category: "references",
  },
  {
    id: "on-repeat-fallback",
    slug: "on-repeat",
    title: "on repeat",
    content: [
      "# on repeat",
      "",
      "songs that i listen to when i’m thinking deeply or grinding work cycles.",
      "",
      "- (add tracks you like)",
      "- (add tracks you like)",
      "- (add tracks you like)",
      "",
      "keep it personal. this note stays blank until you decide what belongs here.",
      "",
    ].join("\n"),
    emoji: "🔁",
    public: true,
    created_at: new Date().toISOString(),
    session_id: null,
    category: "music",
  },
  {
    id: "reading-list-fallback",
    slug: "reading-list",
    title: "reading list",
    content: [
      "# reading list",
      "",
      "a running log of books that change how i think about building, leadership, and systems.",
      "",
      "## currently reading",
      "",
      "- ⏳ (add what i’m reading right now)",
      "",
      "## core reads",
      "",
      "- ✅ [The Hard Thing About Hard Things](https://www.goodreads.com/book/show/18176747-the-hard-thing-about-hard-things) — Ben Horowitz",
      "  - she’s the ceo. i’ve fan-mailed ben horowitz about this book and gifted copies to founders i work with.",
      "",
      "- ✅ [Range](https://www.goodreads.com/book/show/41795733-range) — David Epstein",
      "  - 15/10 well‑researched book on how generalists rule the world.",
      "",
      "- ✅ [Hooked](https://www.goodreads.com/book/show/22668729-hooked) — Nir Eyal",
      "  - this book got me out of a reading slump. it’s a very hooky book about why certain products pull people back again and again.",
      "",
      "- ✅ [Shoe Dog](https://www.goodreads.com/book/show/27220736-shoe-dog) — Phil Knight",
      "  - i read this while traveling in japan. also the reason i now have a mild irrational hatred for onitsuka tigers (shakes fist at kitami).",
      "",
      "- ✅ [The Long Way to a Small, Angry Planet](https://www.goodreads.com/book/show/22733729-the-long-way-to-a-small-angry-planet) — Becky Chambers",
      "  - cozy sci‑fi about life on a small spaceship drifting through the galaxy. not epic space battles—just people, relationships, and quiet moments in a very big universe.",
      "",
    ].join("\n"),
    emoji: "📘",
    public: true,
    created_at: new Date().toISOString(),
    session_id: null,
    category: "reading",
  },
  {
    id: "favorite-blogs-fallback",
    slug: "favorite-blogs",
    title: "favorite blogs",
    content: [
      "# favorite blogs",
      "",
      "blogs that influence how i think about systems, markets, and strategy.",
      "",
      "- (add blogs you check regularly)",
      "- (add newsletters you follow)",
      "- (add authors you read often)",
      "",
    ].join("\n"),
    emoji: "📰",
    public: true,
    created_at: new Date().toISOString(),
    session_id: null,
    category: "reading",
  },
];


