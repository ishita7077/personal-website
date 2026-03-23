"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Note as NoteType } from "@/lib/notes/types";
import { FALLBACK_PUBLIC_NOTES } from "@/lib/notes/fallback-public-notes";
import { logger } from "@/lib/logger";
import { SessionNotesProvider } from "@/app/(desktop)/notes/session-notes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWindowFocus } from "@/lib/window-focus-context";
import Sidebar from "./sidebar";
import Note from "./note";

const ABOUT_ME_FALLBACK = FALLBACK_PUBLIC_NOTES.find((n) => n.slug === "about-me") ?? null;
const INTERVIEW_ROOM_FALLBACK = FALLBACK_PUBLIC_NOTES.find((n) => n.slug === "interview-room") ?? null;

function withInterviewRoomNote(notes: NoteType[]): NoteType[] {
  if (!INTERVIEW_ROOM_FALLBACK) return notes;
  if (notes.some((note) => note.slug === "interview-room")) return notes;
  return [INTERVIEW_ROOM_FALLBACK, ...notes];
}

interface NotesAppProps {
  isMobile?: boolean;
  inShell?: boolean; // When true, use callback navigation instead of route navigation
  initialSlug?: string; // If provided, select this note on load
}

export function NotesApp({ isMobile = false, inShell = false, initialSlug }: NotesAppProps) {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const supabase = createClient();
  const windowFocus = useWindowFocus();
  // Container ref for scoping dialogs to this app (fallback when not in desktop shell)
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch public notes on mount
  useEffect(() => {
    async function fetchNotes() {
      if (!supabase) {
        logger.warn("notes-app/fetchNotes", "No Supabase; using fallback notes");
        const data = withInterviewRoomNote(FALLBACK_PUBLIC_NOTES);
        setNotes(data);
        // On mobile without initialSlug, show sidebar only (no note selected)
        if (isMobile && !initialSlug) {
          setLoading(false);
          return;
        }
        const targetSlug = initialSlug || "about-me";
        const defaultNote = data.find((n: NoteType) => n.slug === targetSlug);
        if (defaultNote && !selectedNote) {
          setSelectedNote(defaultNote);
        }
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("public", true)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error("notes-app/fetchNotes", "Public notes fetch failed", error);
        setLoading(false);
        return;
      }
      if (data) {
        const notesWithInterviewRoom = withInterviewRoomNote(data as NoteType[]);
        setNotes(notesWithInterviewRoom);
        // On mobile without initialSlug, show sidebar only (no note selected)
        // On desktop or with initialSlug, select a note
        if (isMobile && !initialSlug) {
          // Don't auto-select a note on mobile - show sidebar only
          setLoading(false);
          return;
        }

        // Use initialSlug if provided, otherwise "about-me", otherwise first note
        const targetSlug = initialSlug || "about-me";
        const defaultNote = notesWithInterviewRoom.find((n: NoteType) => n.slug === targetSlug);

        if (defaultNote && !selectedNote) {
          // about-me: always use fallback so content/notes/about-me.md is source of truth
          if (defaultNote.slug === "about-me" && ABOUT_ME_FALLBACK) {
            logger.info("notes-app/fetchNotes", "Using fallback for about-me (source of truth)");
            setSelectedNote(ABOUT_ME_FALLBACK);
          } else if (defaultNote.slug === "interview-room" && INTERVIEW_ROOM_FALLBACK) {
            logger.info("notes-app/fetchNotes", "Using fallback for interview-room");
            setSelectedNote(INTERVIEW_ROOM_FALLBACK);
          } else {
            const { data: fullNote } = await supabase
              .rpc("select_note", { note_slug_arg: defaultNote.slug })
              .single();
            if (fullNote) {
              setSelectedNote(fullNote as NoteType);
            }
          }
        } else if (!defaultNote && initialSlug && !selectedNote) {
          if (initialSlug === "about-me" && ABOUT_ME_FALLBACK) {
            logger.info("notes-app/fetchNotes", "Using fallback for about-me (direct slug)");
            setSelectedNote(ABOUT_ME_FALLBACK);
          } else if (initialSlug === "interview-room" && INTERVIEW_ROOM_FALLBACK) {
            logger.info("notes-app/fetchNotes", "Using fallback for interview-room (direct slug)");
            setSelectedNote(INTERVIEW_ROOM_FALLBACK);
          } else {
            const { data: fullNote } = await supabase
              .rpc("select_note", { note_slug_arg: initialSlug })
              .single();
            if (fullNote) {
              setSelectedNote(fullNote as NoteType);
            } else {
              // Note doesn't exist - fall back to first public note and update URL
              const fallbackNote = data[0];
              if (fallbackNote) {
                const { data: fallbackFullNote } = await supabase
                  .rpc("select_note", { note_slug_arg: fallbackNote.slug })
                  .single();
                if (fallbackFullNote) {
                  setSelectedNote(fallbackFullNote as NoteType);
                  window.history.replaceState(null, "", `/notes/${fallbackNote.slug}`);
                }
              }
            }
          }
        } else if (!selectedNote) {
          // No initialSlug provided and no note selected - use first note
          const fallbackNote = data[0];
          if (fallbackNote) {
            const { data: fullNote } = await supabase
              .rpc("select_note", { note_slug_arg: fallbackNote.slug })
              .single();
            if (fullNote) {
              setSelectedNote(fullNote as NoteType);
            }
          }
        }
      }
      setLoading(false);
    }
    fetchNotes();
  }, [supabase, initialSlug, isMobile, selectedNote]);

  const handleNoteSelect = useCallback(
    async (note: NoteType) => {
      if (!supabase) {
        // Fallback mode: just select the note locally
        setSelectedNote(note);
        window.history.replaceState(null, "", `/notes/${note.slug}`);
        if (isMobile) setShowSidebar(false);
        return;
      }
      if (note.slug === "about-me" && ABOUT_ME_FALLBACK) {
        logger.info("notes-app/handleNoteSelect", "Using fallback for about-me");
        setSelectedNote(ABOUT_ME_FALLBACK);
        window.history.replaceState(null, "", `/notes/${note.slug}`);
        if (isMobile) setShowSidebar(false);
        return;
      }
      if (note.slug === "interview-room" && INTERVIEW_ROOM_FALLBACK) {
        logger.info("notes-app/handleNoteSelect", "Using fallback for interview-room");
        setSelectedNote(INTERVIEW_ROOM_FALLBACK);
        window.history.replaceState(null, "", `/notes/${note.slug}`);
        if (isMobile) setShowSidebar(false);
        return;
      }
      const { data: fullNote } = await supabase
        .rpc("select_note", { note_slug_arg: note.slug })
        .single();
      if (fullNote) {
        setSelectedNote(fullNote as NoteType);
        // Update URL to reflect selected note
        window.history.replaceState(null, "", `/notes/${note.slug}`);
        // On mobile, hide sidebar when note is selected
        if (isMobile) {
          setShowSidebar(false);
        }
      }
    },
    [supabase, isMobile]
  );

  const handleBackToSidebar = useCallback(() => {
    setShowSidebar(true);
    // Update URL when going back to sidebar on mobile
    if (isMobile) {
      window.history.replaceState(null, "", "/notes");
    }
  }, [isMobile]);

  // Handler for new note creation - sets note and updates URL
  const handleNoteCreated = useCallback((note: NoteType) => {
    setSelectedNote(note);
    // Update URL to reflect the new note
    window.history.replaceState(null, "", `/notes/${note.slug}`);
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [isMobile]);

  // Show empty background while loading to prevent flash
  if (loading) {
    return <div className="h-full bg-background" />;
  }

  // On mobile, show either sidebar or note content
  if (isMobile) {
    return (
      <SessionNotesProvider>
        <div
          ref={containerRef}
          data-app="notes"
          tabIndex={-1}
          onMouseDown={() => containerRef.current?.focus()}
          className="notes-app h-full bg-background text-foreground outline-none"
        >
          {showSidebar ? (
            <Sidebar
              notes={notes}
              onNoteSelect={handleNoteSelect}
              isMobile={true}
              selectedSlug={selectedNote?.slug}
              useCallbackNavigation
              onNoteCreated={handleNoteCreated}
            />
          ) : (
            <div className="h-full">
              {selectedNote && (
                <div className="h-full p-3">
                  <Note key={selectedNote.id} note={selectedNote} onBack={handleBackToSidebar} />
                </div>
              )}
            </div>
          )}
        </div>
      </SessionNotesProvider>
    );
  }

  // Desktop view - show both sidebar and note
  return (
    <SessionNotesProvider>
      <div
        ref={containerRef}
        data-app="notes"
        tabIndex={-1}
        onMouseDown={() => containerRef.current?.focus()}
        className="notes-app h-full flex bg-background text-foreground relative outline-none"
      >
            <Sidebar
              notes={notes}
              onNoteSelect={handleNoteSelect}
              isMobile={false}
              selectedSlug={selectedNote?.slug}
              useCallbackNavigation
              onNoteCreated={handleNoteCreated}
            />
        <div className="flex-grow h-full overflow-hidden relative">
          {/* Drag overlay - matches nav height, doesn't affect layout */}
          {inShell && windowFocus && (
            <div
              className="absolute top-0 left-0 right-0 h-[52px] z-10 select-none"
              onMouseDown={(e) => {
                const overlay = e.currentTarget as HTMLElement;
                const startX = e.clientX;
                const startY = e.clientY;
                let didDrag = false;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const dx = Math.abs(moveEvent.clientX - startX);
                  const dy = Math.abs(moveEvent.clientY - startY);
                  if (!didDrag && (dx > 5 || dy > 5)) {
                    didDrag = true;
                    windowFocus.onDragStart(e);
                  }
                };

                const handleMouseUp = (upEvent: MouseEvent) => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);

                  if (!didDrag) {
                    // It was a click - find and click the element below
                    overlay.style.pointerEvents = 'none';
                    const elementBelow = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
                    overlay.style.pointerEvents = '';
                    if (elementBelow && elementBelow !== overlay) {
                      (elementBelow as HTMLElement).click();
                    }
                  }
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          )}
          <ScrollArea className="h-full" isMobile={false} bottomMargin="0px">
            {selectedNote ? (
              <div className="w-full min-h-full p-3">
                <Note key={selectedNote.id} note={selectedNote} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Select a note</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </SessionNotesProvider>
  );
}
