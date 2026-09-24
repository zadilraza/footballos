# FootballOS delivery workflow

The project owner requests that completed changes be committed and pushed to the existing GitHub repository, then deployed through the connected Vercel project (footballos.vercel.app). Run appropriate checks before pushing, preserve unrelated work, and never commit credentials or environment files. Verify Vercel deployment status where access permits; report blockers instead of claiming an unverified deployment is live. Do not force-push.

## Budget preference

The owner does not want to spend money on this project right now. Keep Social Pulse on external match search links and manually curated public posts. Do not enable paid APIs, subscriptions, or automatic social fetching without a new explicit request.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
