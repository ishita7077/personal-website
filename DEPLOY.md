# Deploy ishitasrivastava.xyz to Vercel

Follow these steps in order. Do them in Terminal (or Cursor’s terminal) and on the GitHub + Vercel websites.

---

## Step 1: Open Terminal in your project

- In Cursor: **Terminal → New Terminal** (or `` Ctrl+` ``).
- Make sure you’re in the project folder. If not, run:
  ```bash
  cd /Users/ishita/Documents/ishita-personal-website
  ```

---

## Step 2: Load Node (if you use nvm)

If you use nvm, run once in this terminal:

```bash
source ~/.zshrc
```

(You need `node` and `npm` for the next step.)

---

## Step 3: Install dependencies and check the build

Run:

```bash
npm install
npm run build
```

- If both finish without errors, the project is ready to deploy.
- If something fails, fix the error before going to Step 4.

---

## Step 4: Create the repo on GitHub (in the browser)

1. Go to **https://github.com** and sign in.
2. Click the **+** (top right) → **New repository**.
3. Fill in:
   - **Repository name:** `ishita-personal-website` (or any name you like).
   - **Visibility:** Public or Private.
   - Do **not** check “Add a README” or “Add .gitignore” (your folder already has them).
4. Click **Create repository**.
5. On the new repo page you’ll see a section **“…or push an existing repository from the command line”**. Leave that tab open; you’ll use it in Step 6.

---

## Step 5: Turn your folder into a Git repo and commit (in Terminal)

In the same terminal, in `/Users/ishita/Documents/ishita-personal-website`, run these one by one:

```bash
git init
git add -A
git status
```

- You should see a list of files to be committed.

Then:

```bash
git commit -m "Initial commit: Ishita personal OS"
```

- You should see “X files changed” and “create mode …” for many files.

---

## Step 6: Connect to GitHub and push (in Terminal)

1. On GitHub, in your new repo, copy the **HTTPS** URL. It looks like:
   - `https://github.com/YOUR_USERNAME/ishita-personal-website.git`
   - Replace `YOUR_USERNAME` with your actual GitHub username.

2. In Terminal, run (paste your URL in place of the example):

```bash
git remote add origin https://github.com/YOUR_USERNAME/ishita-personal-website.git
```

3. Rename the branch to `main` (if needed) and push:

```bash
git branch -M main
git push -u origin main
```

4. When asked for credentials:
   - Use your **GitHub username** and a **Personal Access Token** (not your GitHub password).
   - To create a token: GitHub → **Settings → Developer settings → Personal access tokens → Generate new token**. Give it “repo” scope, copy it, and paste it when the terminal asks for a password.

5. After `git push` succeeds, refresh your repo on GitHub. You should see all your project files there.

---

## Step 7: Deploy on Vercel (in the browser)

1. Go to **https://vercel.com** and sign in (e.g. **Continue with GitHub**).
2. Click **Add New… → Project**.
3. Find **ishita-personal-website** in the list and click **Import**.
4. On “Configure Project”:
   - Leave **Root Directory** as is.
   - Leave **Build and Output Settings** as is (Vercel will detect Next.js).
   - **Environment Variables:** you can skip for now (add Supabase / GitHub later if you want).
5. Click **Deploy**.
6. Wait for the build (1–3 minutes). When it’s done, you’ll see a link like:
   - `https://ishita-personal-website-xxxx.vercel.app`
   - Click it to confirm the site works.

---

## Step 8: Add your domain ishitasrivastava.xyz (in Vercel)

1. In Vercel, open your project **ishita-personal-website**.
2. Go to **Settings → Domains**.
3. Click **Add** and type: `ishitasrivastava.xyz`.
4. Click **Add** again. Vercel will show DNS instructions.

---

## Step 9: Point your domain to Vercel (at your domain registrar)

1. Log in where you bought **ishitasrivastava.xyz** (e.g. Namecheap, GoDaddy, Cloudflare).
2. Open **DNS** or **Manage DNS** for that domain.
3. Do what Vercel says. Usually one of:
   - **Option A:** Change **Nameservers** to the ones Vercel gives you, **or**
   - **Option B:** Add an **A** record: name `@`, value `76.76.21.21`, **and** a **CNAME**: name `www`, value `cname.vercel-dns.com`.
4. Save. Wait 5–30 minutes. In Vercel → **Settings → Domains**, the domain should get a green check.

---

## Step 10: Open your site

In the browser go to:

**https://ishitasrivastava.xyz**

You should see your personal OS. If you use `www`, add **www.ishitasrivastava.xyz** as a domain in Vercel (Step 8) and add the CNAME for `www` in Step 9.

---

## Quick reference

| Where        | What to do |
|-------------|------------|
| Terminal    | `cd` to project, `source ~/.zshrc`, `npm install`, `npm run build`, then `git init`, `git add -A`, `git commit`, `git remote add origin ...`, `git push` |
| GitHub web  | New repo (no README), copy repo URL, create Personal Access Token if needed |
| Vercel web  | Import repo → Deploy → Settings → Domains → Add ishitasrivastava.xyz |
| Domain site | Set DNS (nameservers or A + CNAME) as Vercel shows |

If any step fails, note the exact error message and the step number; that’s enough to debug the next bit.
