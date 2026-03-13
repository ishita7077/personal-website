import { cache } from "react";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { Note as NoteType } from "@/lib/notes/types";
import { NotesDesktopPage } from "./notes-desktop-page";
import { logger } from "@/lib/logger";
import { FALLBACK_PUBLIC_NOTES } from "@/lib/notes/fallback-public-notes";

// Enable ISR with a reasonable revalidation period for public notes
export const revalidate = 86400; // 24 hours

// Cached function to fetch a note by slug - eliminates duplicate fetches
const getNote = cache(async (slug: string) => {
  const supabase = await createServerClient();
  if (!supabase) {
    logger.warn("notes/[slug]/getNote", "No Supabase client; using fallback note", { slug });
    const fallback = FALLBACK_PUBLIC_NOTES.find((n) => n.slug === slug);
    if (fallback) logger.info("notes/[slug]/getNote", "Returning fallback note", { slug, source: "fallback" });
    return fallback || null;
  }
  try {
    const { data: note, error } = (await supabase
      .rpc("select_note", { note_slug_arg: slug })
      .single()) as { data: NoteType | null; error: unknown };
    if (error) {
      logger.error("notes/[slug]/getNote", "select_note RPC failed", { slug, error });
      const fallback = FALLBACK_PUBLIC_NOTES.find((n) => n.slug === slug);
      if (fallback) logger.info("notes/[slug]/getNote", "Using fallback after RPC error", { slug });
      return fallback || null;
    }
    if (note) logger.info("notes/[slug]/getNote", "Returning note from Supabase", { slug, source: "supabase" });
    return note;
  } catch (e) {
    logger.error("notes/[slug]/getNote", "getNote threw", { slug, error: e });
    const fallback = FALLBACK_PUBLIC_NOTES.find((n) => n.slug === slug);
    return fallback || null;
  }
});

// Dynamically determine if this is a user note
export async function generateStaticParams() {
  const supabase = createBrowserClient();
  if (!supabase) {
    logger.info("notes/[slug]/generateStaticParams", "No Supabase; using fallback slugs");
    return FALLBACK_PUBLIC_NOTES.filter((n) => n.public).map(({ slug }) => ({ slug }));
  }
  try {
    const { data: posts, error } = await supabase
      .from("notes")
      .select("slug")
      .eq("public", true);
    if (error) {
      logger.error("notes/[slug]/generateStaticParams", "notes select failed", error);
      return [];
    }
    if (!posts) return [];
    return posts.map(({ slug }) => ({ slug }));
  } catch (e) {
    logger.error("notes/[slug]/generateStaticParams", "generateStaticParams threw", e);
    return [];
  }
}

// Use dynamic rendering for non-public notes
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = slug.replace(/^notes\//, "");
  const note = await getNote(cleanSlug);

  if (!note) {
    return { title: "Note not found" };
  }

  const title = note.title || "new note";
  const emoji = note.emoji || "👋🏼";

  return {
    title: "ishita",
    openGraph: {
      images: [
        `/notes/api/og/?title=${encodeURIComponent(title)}&emoji=${encodeURIComponent(emoji)}`,
      ],
    },
  };
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params;
  const cleanSlug = slug.replace(/^notes\//, "");
  try {
    const note = await getNote(cleanSlug);

    if (!note) {
      logger.info("notes/[slug]/page", "No note found; showing placeholder or redirecting", { cleanSlug });
      if (cleanSlug === "about-me" || cleanSlug === "error") {
        return <NotesDesktopPage slug={cleanSlug} />;
      }
      return redirect("/notes/error");
    }

    logger.info("notes/[slug]/page", "Rendering note page", { cleanSlug, noteId: note.id });
    return <NotesDesktopPage slug={cleanSlug} />;
  } catch (e) {
    logger.error("notes/[slug]/page", "NotePage threw", { cleanSlug, error: e });
    return redirect("/notes/error");
  }
}
