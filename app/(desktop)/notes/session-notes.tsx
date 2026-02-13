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
      if (!supabase) {
        logger.warn("session-notes", "No Supabase; clearing session notes");
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
