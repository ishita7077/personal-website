"use client";

import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Note } from "@/lib/notes/types";

export interface SessionNotes {
  sessionId: string;
  notes: Note[];
  setSessionId: (sessionId: string) => void;
  refreshSessionNotes: () => Promise<void>;
}

export const SessionNotesContext = createContext<SessionNotes>({
  sessionId: "",
  notes: [],
  setSessionId: () => {},
  refreshSessionNotes: async () => {},
});

export function SessionNotesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [sessionId, setSessionId] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);

  const refreshSessionNotes = useCallback(async () => {
    if (!supabase || !sessionId) {
      if (!supabase && sessionId) {
        try {
          const storageKey = `session_notes_${sessionId}`;
          const existingRaw =
            typeof window !== "undefined"
              ? window.localStorage.getItem(storageKey)
              : null;
          const existing: Note[] = existingRaw ? JSON.parse(existingRaw) : [];
          setNotes(existing);
        } catch (e) {
          logger.error(
            "session-notes",
            "Failed to read local session notes",
            { sessionId, error: e }
          );
          setNotes([]);
        }
      } else if (!sessionId) {
        setNotes([]);
      }
      return;
    }
    try {
      const sessionNotes = await getSessionNotes({ supabase, sessionId });
      setNotes(sessionNotes || []);
    } catch (e) {
      logger.error(
        "session-notes/refreshSessionNotes",
        "getSessionNotes failed",
        { sessionId, error: e }
      );
      setNotes([]);
    }
  }, [supabase, sessionId]);

  useEffect(() => {
    if (supabase) refreshSessionNotes();
    else setNotes([]);
  }, [refreshSessionNotes, sessionId, supabase]);

  return (
    <SessionNotesContext.Provider
      value={{
        sessionId,
        notes,
        setSessionId,
        refreshSessionNotes,
      }}
    >
      {children}
    </SessionNotesContext.Provider>
  );
}

async function getSessionNotes({
  supabase,
  sessionId,
}: {
  supabase: SupabaseClient;
  sessionId: string;
}) {

  const { data : notes } = await supabase.rpc("select_session_notes", {
    session_id_arg: sessionId
  });

  return notes;
}
