import Link from "next/link";

const REPO_URL = "https://github.com/noamseg/interview-coach-skill";

export const metadata = {
  title: "Interview Coach",
  description:
    "Chat-based interview prep with the Claude skill. JD analysis, mock Q&A, no resume upload.",
};

export default function InterviewCoachPage() {
  return (
    <main className="min-h-dvh bg-background p-6 sm:p-8">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-xl font-semibold text-foreground">Interview Coach</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Practise for interviews using the Interview Coach skill in Claude Code: JD analysis, mock
          interviews, and debriefs. No resume upload — you run it locally in Claude.
        </p>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Interview Coach (Claude skill)
            </h2>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 hover:underline shrink-0"
            >
              Open repo →
            </a>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              Clone the repo and open the folder in Claude Code (or Cursor with the skill).
            </li>
            <li>
              Rename <code className="rounded bg-muted px-1 py-0.5 text-xs">SKILL.md</code> to{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">CLAUDE.md</code>.
            </li>
            <li>
              Say <strong className="text-foreground">kickoff</strong> to start.
            </li>
          </ol>
        </div>

        <p className="text-xs text-muted-foreground">
          For timed video practice with school-specific questions and recording (including Berkeley Haas), use{" "}
          <Link href="/mba-interview-room" className="text-blue-600 hover:underline">
            MBA Interview Room
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
