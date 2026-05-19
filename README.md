# Social Media Dashboard

Automated reporting + dashboard to replace the team's tracking spreadsheet. Pulls
performance data from Facebook, Instagram, TikTok and YouTube on a schedule, stores
it in Postgres, and serves:

- **Overview dashboard** — reach/views by platform, top/bottom posts
- **Campaign comparison** — every campaign ranked by views, drill-down per campaign
- **Reports** — auto-generated weekly + monthly digests with recommendations
- **Alerts** — top performers, underperformers, low-engagement flags

## Quickstart

```bash
npm install
cp .env.example .env
# fill in DATABASE_URL (local Postgres, Neon, Supabase, or Vercel Postgres)

npm run db:push      # apply schema
npm run db:seed      # load the spreadsheet snapshot into the DB
npm run dev          # http://localhost:3000
```

## Pulling live data

Fill the platform credentials in `.env`:

| Platform  | Vars |
|-----------|------|
| Facebook  | `META_ACCESS_TOKEN`, `META_FACEBOOK_PAGE_ID` |
| Instagram | `META_ACCESS_TOKEN`, `META_INSTAGRAM_BUSINESS_ID` |
| TikTok    | `TIKTOK_ACCESS_TOKEN`, `TIKTOK_BUSINESS_ID` |
| YouTube   | `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID` |

Run ingestion once:

```bash
npm run ingest
```

Or hit the cron endpoint:

```bash
curl -X POST -H "x-ingest-secret: $INGEST_SECRET" https://<host>/api/ingest
```

When deployed to Vercel, `vercel.json` already schedules:

- Ingest every 6 hours
- Weekly report every Monday 1pm UTC
- Monthly report on the 1st at 1pm UTC

## How the data maps to the spreadsheet

| Sheet column            | DB field                |
|-------------------------|-------------------------|
| Campaign Name           | `Campaign.name`         |
| Purpose                 | `Campaign.purpose` / `Post.postType` |
| Landing Page            | `Campaign.landingPage` / `Post.ctaLink` |
| Assets                  | `Campaign.assets`       |
| Audience                | `Campaign.audience`     |
| Caption / Headline / CTA| `Post.caption`, `Post.headline`, `Post.cta` |
| Reach / Viewers         | `Post.reach` / `Post.viewers` (latest) + `MetricSnapshot` (history) |
| Engagement: good/regular/bad | `Post.performance` enum |

## Tuning alerts and performance classification

- Thresholds for "top / bottom / low engagement" alerts live in
  `src/lib/alerts.ts` (`p90`, `p10`, `er < 0.3` rule).
- The classifier that maps raw reach/views into `bad / regular / good / excellent`
  lives in `src/lib/scoring.ts` (`classifyPerformance`).

Adjust those once you have a few weeks of API data — the seed defaults were
calibrated against the spreadsheet snapshot.

## Project layout

```
prisma/
  schema.prisma         # Postgres schema (Campaign, Post, MetricSnapshot, Alert, Report)
  seed.ts               # Spreadsheet snapshot
src/
  app/                  # Next.js App Router pages + API routes
  components/           # UI: Card, Charts (Recharts)
  lib/
    db.ts               # Prisma client
    scoring.ts          # engagement + performance classifier
    analytics.ts        # platform totals, campaign summaries, top/bottom
    alerts.ts           # percentile-based alert generator
    reports.ts          # weekly/monthly report builder
    ingest/             # Meta, TikTok, YouTube API ingestion
scripts/
  ingest.ts             # one-shot ingestion runner
```
