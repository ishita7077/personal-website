import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/utils/supabase/client";
import { Note } from "@/lib/notes/types";
import { logger } from "@/lib/logger";

interface NotesRouter {
  push: (href: string) => void;
  refresh: () => void;
}

export async function createNote(
  sessionId: string | null,
  router: NotesRouter,
  addNewPinnedNote: (slug: string) => void,
  refreshSessionNotes: () => Promise<void>,
  setSelectedNoteSlug: (slug: string | null) => void,
  useCallbackNavigation: boolean = false,
  onNoteCreated?: (note: Note) => void
) {
  const supabase = createClient();

  const noteId = uuidv4();
  const slug = `new-note-${noteId}`;

  const note = {
    id: noteId,
    slug: slug,
    title: "",
    content: [
      "👋 welcome to your own note inside my notebook.",
      "",
      "this space is a private canvas for you — feel free to play, sketch ideas, or make this page yours.",
      "",
      "you can always create another note from the File menu or the + button in the sidebar.",
      "",
    ].join("\n"),
    public: false,
    created_at: new Date().toISOString(),
    session_id: sessionId,
    category: "today",
    emoji: "👋🏼",
  };

  // Local-only fallback when Supabase is not configured.
  if (!supabase) {
    try {
      const storageKey = `session_notes_${sessionId ?? "local"}`;
      const existingRaw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(storageKey)
          : null;
      const existing: Note[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [...existing, note];
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, JSON.stringify(updated));
      }

      addNewPinnedNote(slug);
      await refreshSessionNotes();
      setSelectedNoteSlug(slug);

      if (onNoteCreated) {
        onNoteCreated(note);
      }

      if (!useCallbackNavigation) {
        router.push(`/notes/${slug}`);
        router.refresh();
      }
    } catch (error) {
      logger.error("create-note", "Local note create failed", { sessionId, error });
    }
    return;
  }

  try {
    const { error } = await supabase.from("notes").insert(note);

    if (error) throw error;

    if (useCallbackNavigation) {
      // Use callbacks instead of router navigation
      addNewPinnedNote(slug);
      await refreshSessionNotes();
      setSelectedNoteSlug(slug);
      // Fetch the full note and call the callback
      if (onNoteCreated) {
        const { data: fullNote } = await supabase
          .rpc("select_note", { note_slug_arg: slug })
          .single();
        if (fullNote) {
          onNoteCreated(fullNote as Note);
        }
      }
    } else {
      // Use router navigation (standalone browser mode)
      addNewPinnedNote(slug);
      refreshSessionNotes().then(() => {
        setSelectedNoteSlug(slug);
        router.push(`/notes/${slug}`);
        router.refresh();
      });
    }
  } catch (error) {
    logger.error("create-note", "Error creating note", { sessionId, error });
  }
}
