# Social Pulse

Every match row, live card, and Match Center has a Social Pulse button. It opens an accessible modal drawer, with All, X, Instagram, and TikTok filters. The drawer loads data only when opened. It never invents posts, activity counts, or engagement.

## Automatic X posts

Set `X_BEARER_TOKEN` as a server-side environment variable locally and in Vercel, then redeploy. Never prefix it with NEXT_PUBLIC or commit its value. The X project must have recent-search access and sufficient usage credits. The server searches both team names, excludes reposts, and limits results to 12 hours before kickoff through 24 hours after. Recent search only covers approximately the last seven days; older fixtures use curated posts and external search. Exact team-name matching favors relevance but can miss nicknames and hashtags; keyword searches cannot guarantee every result discusses the fixture. Results are cached for five minutes. An unavailable X source does not hide curated posts.

Official reference: https://docs.x.com/x-api/posts/search/introduction

## Match-specific Instagram, TikTok, and curated X posts

Add reviewed public post metadata to `src/data/social-posts.json`, then build and deploy. The file is initially empty; no fabricated posts are shipped. Each record has:

- `fixtureId`: the exact API-Football numeric fixture ID
- `platform`: `x`, `instagram`, or `tiktok`
- `url`: the original HTTPS post URL
- `author`: display name / handle
- `text`: accurate post excerpt or caption
- `publishedAt`: ISO 8601 timestamp

Verify the post actually concerns that fixture (including its date), not just one of the teams. Supported URLs are X `/username/status/id`, Instagram `/p/shortcode/` or `/reel/shortcode/`, and TikTok `/@username/video/id`. Invalid records are excluded. Posts are sorted newest first and deduplicated by URL. Instagram and TikTok embeds load only when the visitor selects “Load post”; the original link remains available if a platform blocks embedding or requires login. Removed/private posts may stop displaying.

This is a curated source for Instagram and TikTok, not an automatic discovery integration. To automate discovery, connect a licensed feed provider and map reviewed results to the same fixture-keyed schema. Do not scrape private content or substitute a generic team timeline.

Official TikTok embed reference: https://developers.tiktok.com/doc/embed-player

## Fallbacks and verification

When no posts exist, visitors see an honest empty state and date/team-scoped external searches. Instagram discovery explicitly opens a Google site search. External search results are not a verified feed.

Check desktop and mobile drawer opening, platform filters, closing with Escape/backdrop/close button, focus returning to the trigger, scrolling, source outage/retry, invalid fixture IDs (HTTP 400), and isolation between fixtures. `npm run lint` and `npm run build` validate integration.
