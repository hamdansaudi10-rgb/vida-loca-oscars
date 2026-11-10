# VIDA LOCA OSCARS — Setup Guide (for beginners)

You will do 4 things: (1) create a Supabase database, (2) put the code on GitHub, (3) deploy on Vercel, (4) share the link. Everything is free. Takes ~20 minutes.

## Step 1 — Create the database (Supabase)
1. Go to https://supabase.com and click **Start your project**. Sign up (GitHub or email).
2. Click **New project**. Name: `vida-loca-oscars`. Choose a database password (save it anywhere) and the region closest to your voters. Click **Create new project** and wait ~2 minutes.
3. In the left menu click **SQL Editor** → **New query**.
4. Open the file `supabase/schema.sql` from this folder, copy ALL of it, paste it in the editor, click **Run**. You should see "Success".
5. Get your two secret values: click the **gear icon (Project Settings)** → **API** (may appear as "API Keys" / "Data API").
   - **Project URL** (looks like `https://abcd1234.supabase.co`) → copy it. This is `SUPABASE_URL`.
   - **service_role** key (click **Reveal**; in the newer layout it's the *secret* key) → copy it. This is `SUPABASE_SERVICE_ROLE_KEY`.
   - Keep the service_role key private. Never post it or put it in the code.

## Step 2 — Put the code on GitHub
1. Go to https://github.com and sign up. Click **+** (top right) → **New repository**. Name: `vida-loca-oscars`. Leave it Private or Public. Click **Create repository**.
2. Click **uploading an existing file**. Unzip this project on your computer, then drag in everything INSIDE the folder (the `app`, `lib`, `supabase` folders and the files `package.json`, `next.config.js`, `.gitignore`, etc.). Click **Commit changes**.
   - Tip: `.env.example` is safe to upload. Never upload a file with your real keys.

## Step 3 — Deploy (Vercel)
1. Go to https://vercel.com → **Sign Up** → **Continue with GitHub**.
2. Click **Add New… → Project**, find `vida-loca-oscars`, click **Import**.
3. Open **Environment Variables** and add two:
   - Name `SUPABASE_URL` → paste your Project URL → **Add**
   - Name `SUPABASE_SERVICE_ROLE_KEY` → paste your service_role key → **Add**
4. Click **Deploy**. After ~1 minute you get a public URL like `https://vida-loca-oscars.vercel.app`. That is your shareable link.

## Step 4 — Test
Open the link, choose a nominee in all 46 categories, press **SUBMIT MY VOTES**, confirm. You should land on the results. In Supabase → **Table Editor** you'll see rows in `submissions` and `votes`.

## Troubleshooting
- "Could not save your votes": the two environment variables are missing or wrong. In Vercel → Settings → Environment Variables fix them, then Deployments → ⋯ → Redeploy.
- Results show an error: make sure you ran the whole `schema.sql`.

## Optional: run locally
Install Node.js 18+, copy `.env.example` to `.env.local`, fill it in, then run `npm install` and `npm run dev` → http://localhost:3000

## How it works / security
- The browser only talks to `/api/vote` and `/api/results` (server code on Vercel).
- Only the server holds the service_role key. Tables have Row Level Security on with no public policies, so nobody can read, edit, or delete votes from the browser.
- Each submission is saved as a new `submissions` row plus 46 `votes` rows. Nothing is ever overwritten.
- Categories and nominees live in `lib/categories.js` (IDs like `c1`, `c1n1`); the database stores those IDs, timestamps and submissions.
- No limits on voting by design (no login, no duplicate prevention).
