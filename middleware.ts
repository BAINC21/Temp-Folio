import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
```

Save with `Ctrl + S`.

**Step 2 — Push to GitHub**

Press `` Ctrl + ` `` to open the terminal in VS Code. Stop the server first with `Ctrl + C`, then run these commands one at a time:
```
git init
```
```
git add .
```
```
git commit -m "Initial commit: Folio MVP"
```
```
git branch -M main
```

Now go to [github.com/new](https://github.com/new) in your browser. Create a new repository called `folio`, set it to Private (or Public, your call), and **don't** check any boxes (no README, no .gitignore — we already have those). Click "Create repository."

GitHub will show you a page with commands. Ignore those and run this in your terminal instead (replace `YOUR_USERNAME` with your actual GitHub username):
```
git remote add origin https://github.com/YOUR_USERNAME/folio.git
```
```
git push -u origin main
```

It may ask for your GitHub credentials. If so, use your username and a Personal Access Token (not your password — GitHub requires tokens now). You can create one at github.com → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token. Check the `repo` scope and copy the token.

**Step 3 — Deploy on Vercel**

Go to [vercel.com](https://vercel.com) and sign in with your GitHub account. Then:

1. Click "Add New..." → "Project"
2. You should see your `folio` repo listed — click "Import"
3. Vercel will auto-detect it's a Next.js project
4. Before clicking Deploy, expand "Environment Variables" and add these four variables (copy the values from your `.env` file):
```
NEXT_PUBLIC_SUPABASE_URL        → your Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   → your anon key
DATABASE_URL                     → your pooled database URL
DIRECT_URL                       → your direct database URL
```

5. Click "Deploy"

Vercel will run `npm install` (which triggers `prisma generate`) and `npm run build` automatically. In about 60 seconds you'll get a live URL like `folio-abc123.vercel.app`.

**Step 4 — Every future update**

From now on, the workflow is simple. Make changes in VS Code, then:
```
git add .
git commit -m "describe what you changed"
git push