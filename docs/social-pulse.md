# Social Pulse

Every match row, live card, and Match Center has a Social Pulse button. It opens an accessible modal drawer, with All, X, Instagram, and TikTok filters. The drawer loads data only when opened. It never invents posts, activity counts, or engagement.

## No paid social APIs

Social Pulse uses manually selected posts and external match searches. The endpoint reads only the bundled data file: it makes no X, Instagram, TikTok, or football API requests. No social API credentials or subscriptions are required, and setting an X token does not enable automatic fetching. Hosting and the existing football data service remain separate from this feature.

The owner wants to avoid spending money on this project. Do not enable paid social integrations unless explicitly requested later.

## Match-specific Instagram, TikTok, and curated X posts

Add reviewed public post metadata to `src/data/social-posts.json`, then build and deploy. The file is initially empty; no fabricated posts are shipped. Each record has:

- `fixtureId`: the exact API-Football numeric fixture ID
- `platform`: `x`, `instagram`, or `tiktok`
- `url`: the original HTTPS post URL
- `author`: display name / handle
- `text`: accurate post excerpt or caption
- `publishedAt`: ISO 8601 timestamp

Verify the post actually concerns that fixture (including its date), not just one of the teams. Supported URLs are X `/username/status/id`, Instagram `/p/shortcode/` or `/reel/shortcode/`, and TikTok `/@username/video/id`. Invalid records are excluded. Posts are sorted newest first and deduplicated by URL. Instagram and TikTok embeds load only when the visitor selects “Load post”; the original link remains available if a platform blocks embedding or requires login. Removed/private posts may stop displaying.

All three platforms use curated posts. To add content, collect the public post URL and FootballOS match URL, verify the caption and timestamp, and add the record above. There is no admin form yet. Do not add a subscription or automatic paid discovery service.

Official TikTok embed reference: https://developers.tiktok.com/doc/embed-player

## Fallbacks and verification

When no posts exist, visitors see an honest empty state and date/team-scoped external searches. Instagram discovery explicitly opens a Google site search. External search results are not a verified feed.

Check desktop and mobile drawer opening, platform filters, closing with Escape/backdrop/close button, focus returning to the trigger, scrolling, source outage/retry, invalid fixture IDs (HTTP 400), and isolation between fixtures. `npm run lint` and `npm run build` validate integration.
