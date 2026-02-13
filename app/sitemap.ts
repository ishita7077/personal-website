import { createClient } from "@/utils/supabase/server";
import { MetadataRoute } from "next";
import { logger } from "@/lib/logger";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();
    let notesUrls: { url: string; lastModified: Date }[] = [];
    if (supabase) {
        const { data: notes } = await supabase
            .from('notes')
            .select('slug, created_at')
            .eq('public', true)
            .order('created_at', { ascending: false });
        notesUrls = notes?.map((note) => ({
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000"}/notes/${note.slug}`,
            lastModified: new Date(note.created_at),
        })) || [];
    } else {
        logger.warn("sitemap", "No Supabase; sitemap has no note URLs");
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";
    return [
        { url: siteUrl, lastModified: new Date() },
        { url: `${siteUrl}/notes`, lastModified: new Date() },
        ...notesUrls,
    ];
}