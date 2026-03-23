import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/config/site";
import "./globals.css";
import { SystemSettingsProvider } from "@/lib/system-settings-context";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Ishita S",
  description: siteConfig.description,
  icons: {
    // Keep a stable Apple-like favicon across all routes (used for the "tab icon").
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701'/></svg>",
  },
  openGraph: {
    type: "website",
    title: "Ishita S",
    siteName: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ishita S",
    description: siteConfig.description,
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, interactive-widget=resizes-content"
        />
        <script
          type="application/ld+json"
          // Basic structured data so crawlers & AI have clearer context.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Ishita Srivastava",
              url: siteConfig.url,
              description: siteConfig.description,
              sameAs: [siteConfig.substackUrl],
            }),
          }}
        />
      </head>
      <body className="h-dvh">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SystemSettingsProvider>
            {children}
          </SystemSettingsProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
