"use client";

import { useWindowFocus } from "@/lib/window-focus-context";
import { WindowControls } from "@/components/window-controls";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const REPO_URL = "https://github.com/noamseg/interview-coach-skill";

interface InterviewCoachAppProps {
  inShell?: boolean;
}

export function InterviewCoachApp({ inShell = false }: InterviewCoachAppProps) {
  const windowFocus = useWindowFocus();
  const showWindowControls = inShell && windowFocus;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Title bar */}
      <div
        className={cn(
          "px-2 sm:px-4 py-2 flex items-center gap-2 shrink-0 select-none bg-muted border-b border-border/50"
        )}
        onMouseDown={showWindowControls ? windowFocus?.onDragStart : undefined}
      >
        <div className="flex items-center gap-1 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          <WindowControls
            inShell={!!showWindowControls}
            className="p-2"
            onClose={showWindowControls ? windowFocus?.closeWindow : undefined}
            onMinimize={showWindowControls ? windowFocus?.minimizeWindow : undefined}
            onToggleMaximize={showWindowControls ? windowFocus?.toggleMaximize : undefined}
            isMaximized={windowFocus?.isMaximized ?? false}
            closeLabel="Close window"
          />
        </div>
        <span className="text-sm font-medium text-foreground truncate">Interview Coach</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6 space-y-5 max-w-lg">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Practise for interviews using the Interview Coach skill in Claude Code: JD analysis, mock interviews, and debriefs. No resume upload — you run it locally in Claude.
          </p>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">Interview Coach (Claude skill)</h2>
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
              <li>Clone the repo and open the folder in Claude Code (or Cursor with the skill).</li>
              <li>Rename <code className="rounded bg-muted px-1 py-0.5 text-xs">SKILL.md</code> to <code className="rounded bg-muted px-1 py-0.5 text-xs">CLAUDE.md</code>.</li>
              <li>Say <strong className="text-foreground">kickoff</strong> to start.</li>
            </ol>
          </div>

          <p className="text-xs text-muted-foreground">
            For timed video practice with on-device recording (ten MBA programmes, including Haas), open{" "}
            <a
              href="/mba-interview-room"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              MBA Interview Room
            </a>
            .
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}
