# Personalization To-Do: Alana’s site → Yours

Repo is already in the workspace (downloaded as zip). Follow the phases below.

---

## Phase 1: What to keep? (answer these first)

Reply with your choices so we only strip/change what you don’t want.

### Identity & branding
- [ ] **Site config** (`config/site.ts`): name, title, URL → replace with yours.
- [ ] **Lock screen** (`components/desktop/lock-screen.tsx`): photo + “Alana Goyal” → your photo + name.
- [ ] **Apple menu** (“Log Out Alana Goyal…”): replace with your name.
- [ ] **Status menus** (“alana's iphone”): replace with your device name(s).
- [ ] **Settings – About / Personal** (“Alana Goyal”, “Alana's MacBook Air”, “Alana's iPhone”, Twitter `alanaagoyal`, etc.): replace with your name, devices, social.
- [ ] **Settings – WiFi / Bluetooth** (device names like “alana's iphone”, “Alana's Magic Keyboard”): replace with your device names or generic placeholders.
- [ ] **Meta/SEO** (`app/layout.tsx`, notes pages, `app/api/og/route.tsx`, `app/(desktop)/notes/api/og/route.tsx`): “Alana Goyal” / “alana goyal” → your name.
- [ ] **LICENSE.md**: “Alana Goyal” → your name (year optional).

### Username / paths (used in Finder, iTerm, desktop, preview)
- [ ] **GitHub username**: `lib/github.ts` → your GitHub (for repos in Finder/iTerm).
- [ ] **Unix username** (e.g. `alanagoyal`): used in:
  - `components/apps/finder/finder-app.tsx` (USERNAME)
  - `components/apps/iterm/terminal.tsx` (USERNAME, HOSTNAME, HOME_DIR, PROJECTS_DIR, virtual filesystem)
  - `components/apps/iterm/nav.tsx` (prompt: `alanagoyal@Alanas-MacBook-Air`)
  - `components/desktop/desktop.tsx` (HOME_DIR)
  - `lib/preview-utils.ts` (HOME_DIR, GitHub raw URL)
  - `lib/sidebar-persistence.ts` (comment only)
- [ ] **Hostname** (e.g. “Alanas-MacBook-Air”): in iTerm only → your machine name or placeholder.

### Package / project
- [ ] **package.json** & **package-lock.json**: `"name": "alanagoyal"` → your project name (e.g. `ishita-personal-website`).
- [ ] **supabase/config.toml**: `project_id = "alanagoyal"` → your Supabase project id or leave as placeholder.
- [ ] **README.md**: repo URL, alanagoyal.com links, clone instructions → your repo + domain (or “TBD”).

### Data & content
- [ ] **Messages – AI contacts** (`data/messages/initial-contacts.ts`): long list of personas (Einstein, Ankur Goyal, Ben Horowitz, etc.).  
  **Keep all / keep subset / replace with your own list / start empty (placeholders only)?**
- [ ] **Messages – initial conversations** (`data/messages/initial-conversations.ts`): pre-filled threads (e.g. Guillermo Rauch, Paul Copplestone).  
  **Keep as inspiration / strip to 1–2 placeholder threads / empty (no initial threads)?**
- [ ] **Calendar – sample events** (`components/apps/calendar/utils.ts`): exercise, focus time, “busy”, dinner, “date night” (SF restaurants), event locations.  
  **Keep structure, change text/locations / generic placeholders / remove samples?**
- [ ] **Calendar – date night restaurants** (same file): SF list.  
  **Replace with your city/list / remove / generic placeholder?**
- [ ] **Documents** (`public/documents/`): “Base Case Capital I–III Form D.pdf” (Alana’s).  
  **Remove and use your own docs / remove and leave empty / keep as placeholder filenames?**
- [ ] **Photos** (`public/`): no Alana-specific photo assets in repo except `public/headshot.jpg` (lock screen / Settings).  
  **Replace headshot with yours; keep rest as-is.**

### Assets
- [ ] **public/headshot.jpg**: replace with your photo (lock screen + Settings).
- [ ] **Wallpapers** (`public/desktop/versions/*.jpg`): macOS-style wallpapers. Keep or swap later?

---

## Phase 2: Strip to placeholders (after you answer Phase 1)

We’ll do this in code:

1. **Identity & config**
   - `config/site.ts`: e.g. `name: "Your Name", title: "Your Name", url: "https://yourdomain.com"`.
   - All “Alana Goyal” / “alana goyal” / “alanagoyal” in UI and meta → placeholders or your name.
   - Lock screen, Apple menu, Settings panels: your name + placeholder image path.

2. **Username / paths**
   - One constant (e.g. in `config/site.ts` or `lib/constants.ts`): `GITHUB_USERNAME`, `UNIX_USERNAME`, `HOSTNAME`, `HOME_DIR`.
   - Replace every use of `alanagoyal` / `Alanas-MacBook-Air` / `/Users/alanagoyal` with these.

3. **Package / project**
   - `package.json` name; `README.md` and `LICENSE.md`; `supabase/config.toml` project_id; `.env.example` comments if needed.

4. **Data**
   - **Messages**: either empty `initial-conversations.ts` (+ optionally trim `initial-contacts.ts` to a few or empty) or 1–2 placeholder threads.
   - **Calendar**: either keep structure and replace “date night”/SF with generic text or a small placeholder list.
   - **Documents**: remove the 3 Form D PDFs; optionally add a single placeholder file or leave folder empty.

5. **Assets**
   - Replace `public/headshot.jpg` with a placeholder image or remove reference until you add yours.

After Phase 2, the site should run with no Alana-specific content and clear placeholders for your data.

---

## Phase 3: Fill in your data

Once Phase 2 is done:

- Add your name, domain, social links, device names everywhere we used placeholders.
- Add your headshot.
- Add your Messages contacts and (optional) starter conversations.
- Add your calendar events/locations (or keep placeholders).
- Add your documents under `public/documents/` (or keep empty).
- Create your Supabase project and point `supabase/config.toml` + `.env` to it.
- Deploy and point your domain.

---

## Quick reference: files to touch

| Area              | Files |
|-------------------|--------|
| Site config       | `config/site.ts` |
| Lock screen       | `components/desktop/lock-screen.tsx` |
| Apple menu        | `components/desktop/apple-menu.tsx` |
| Status menus      | `components/desktop/status-menus.tsx` |
| Meta/OG           | `app/layout.tsx`, `app/api/og/route.tsx`, `app/(desktop)/notes/page.tsx`, `app/(desktop)/notes/[slug]/page.tsx`, `app/(desktop)/notes/api/og/route.tsx` |
| Settings          | `components/apps/settings/sidebar.tsx`, `panels/about.tsx`, `panels/personal-info.tsx`, `panels/wifi.tsx`, `panels/bluetooth.tsx` |
| GitHub / paths    | `lib/github.ts`, `lib/preview-utils.ts`, `lib/sidebar-persistence.ts`, `components/desktop/desktop.tsx`, `components/apps/finder/finder-app.tsx`, `components/apps/iterm/terminal.tsx`, `components/apps/iterm/nav.tsx` |
| Messages data     | `data/messages/initial-contacts.ts`, `data/messages/initial-conversations.ts` |
| Calendar samples  | `components/apps/calendar/utils.ts` |
| Package/README    | `package.json`, `package-lock.json`, `README.md`, `LICENSE.md`, `supabase/config.toml`, `.env.example` |
| Assets            | `public/headshot.jpg`, `public/documents/*` |

---

Reply with your Phase 1 choices (e.g. “keep Messages contacts, empty conversations”, “replace calendar with generic placeholders”, “remove Form D docs”), and we’ll do Phase 2 next.
