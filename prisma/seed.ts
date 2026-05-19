import { PrismaClient } from "@prisma/client";
import type { Platform, PostType, Performance } from "../src/lib/scoring";

const prisma = new PrismaClient();

type Row = {
  campaign: string;
  purpose?: string;
  landingPage?: string;
  assets?: string;
  audience?: string;
  caption?: string;
  headline?: string;
  cta?: string;
  ctaLink?: string;
  platform: Platform;
  postType?: PostType;
  reach?: number;
  viewers?: number;
  performance?: Performance;
  publishedAt?: string;
  notes?: string;
};

// Distilled from the team's spreadsheet snapshot (May 2026 export).
// Numbers preserved as provided; obvious typos (e.g. "2.865") left as-is in notes.
const rows: Row[] = [
  // checklist / book sales
  { campaign: "checklist / book sales", platform: "facebook", purpose: "book a meeting", landingPage: "https://eventhawk.myadacademy.com/tbc24", reach: 552, viewers: 817, performance: "regular" },
  { campaign: "checklist / book sales", platform: "instagram", purpose: "book a meeting", landingPage: "https://eventhawk.myadacademy.com/tbc25" },
  { campaign: "checklist / book sales", platform: "youtube", purpose: "book a meeting", landingPage: "https://eventhawk.myadacademy.com/tbc26" },

  // Just promoting our packages (run 1)
  { campaign: "Just promoting our packages", platform: "facebook", purpose: "book a meeting", landingPage: "http://eventhawk360.com/meetingsm", reach: 1309, viewers: 1847, performance: "good" },
  { campaign: "Just promoting our packages", platform: "instagram", purpose: "book a meeting", landingPage: "http://eventhawk360.com/meetingsm" },
  { campaign: "Just promoting our packages", platform: "youtube", purpose: "engagement", landingPage: "http://eventhawk360.com/meetingsm" },

  // 30% discount
  { campaign: "30% discount", platform: "facebook", purpose: "book a meeting / approach the discount", cta: "Get your discount", reach: 4390, viewers: 3757, performance: "good" },
  { campaign: "30% discount", platform: "instagram", purpose: "book a meeting / approach the discount", cta: "Get your discount" },
  { campaign: "30% discount", platform: "youtube", purpose: "book a meeting / approach the discount", cta: "Get your discount" },

  // Webinar campaign (paid ad)
  { campaign: "webinar campaign (paid)", platform: "facebook", postType: "ad", purpose: "book a meeting", reach: 20304, viewers: 22183, performance: "excellent", notes: "paid ad" },
  { campaign: "webinar campaign (paid)", platform: "instagram", postType: "ad", purpose: "book a meeting", reach: 20304, viewers: 22183, performance: "excellent", notes: "paid ad" },
  { campaign: "webinar campaign (paid)", platform: "youtube", postType: "ad", purpose: "book a meeting" },

  // Take off / Pro (early run)
  { campaign: "Take off / Pro (Jan)", platform: "facebook", purpose: "book a meeting", reach: 427, viewers: 585, performance: "regular", publishedAt: "2026-01-19" },
  { campaign: "Take off / Pro (Jan)", platform: "instagram", purpose: "book a meeting", publishedAt: "2026-01-19" },
  { campaign: "Take off / Pro (Jan)", platform: "youtube", purpose: "book a meeting", publishedAt: "2026-01-19" },

  // School letter (funnel)
  { campaign: "school letter", platform: "facebook", purpose: "funnel", reach: 5132, viewers: 6818, performance: "excellent", notes: "paid ad" },
  { campaign: "school letter", platform: "instagram", purpose: "funnel" },
  { campaign: "school letter", platform: "youtube", purpose: "funnel" },

  // Take off / Pro (Feb) with landing page
  { campaign: "Take off / Pro (Feb)", platform: "facebook", purpose: "book a meeting", landingPage: "https://eventhawk.myadacademy.com/meeting-sm", ctaLink: "https://eventhawk.myadacademy.com/meeting-sm", reach: 434, viewers: 1670, performance: "good", notes: "regular/good" },
  { campaign: "Take off / Pro (Feb)", platform: "instagram", purpose: "book a meeting", landingPage: "https://eventhawk.myadacademy.com/meeting-sm", ctaLink: "https://eventhawk.myadacademy.com/meeting-sm", reach: 688, viewers: 807, performance: "good" },
  { campaign: "Take off / Pro (Feb)", platform: "youtube", purpose: "book a meeting", landingPage: "https://eventhawk.myadacademy.com/meeting-sm", ctaLink: "https://eventhawk.myadacademy.com/meeting-sm" },

  // Super Bowl (Pay Per Booking)
  { campaign: "Super Bowl 2026", platform: "facebook", purpose: "get a discount and book a meeting", landingPage: "https://eventhawk.myadacademy.com/ppb26", ctaLink: "https://eventhawk.myadacademy.com/ppb26", assets: "Pay Per Booking Campaign", cta: "Get your discount", reach: 3133, viewers: 7543, performance: "good", publishedAt: "2026-01-30", notes: "very good for 3 posts" },
  { campaign: "Super Bowl 2026", platform: "instagram", purpose: "get a discount and book a meeting", landingPage: "https://eventhawk.myadacademy.com/ppb26", ctaLink: "https://eventhawk.myadacademy.com/ppb26", assets: "Pay Per Booking Campaign", cta: "Get your discount", reach: 224, viewers: 674, performance: "bad", publishedAt: "2026-01-30" },
  { campaign: "Super Bowl 2026", platform: "youtube", purpose: "get a discount and book a meeting", landingPage: "https://eventhawk.myadacademy.com/ppb26", ctaLink: "https://eventhawk.myadacademy.com/ppb26", assets: "Pay Per Booking Campaign", cta: "Get your discount", publishedAt: "2026-01-30" },

  // Take off / Pro (long run, 14 posts)
  { campaign: "Take off / Pro (Jan 19-29)", platform: "facebook", purpose: "bookings", ctaLink: "http://eventhawk360.com/meetingsm", reach: 2151, viewers: 4459, performance: "excellent", notes: "across ~14 posts" },
  { campaign: "Take off / Pro (Jan 19-29)", platform: "instagram", purpose: "bookings", ctaLink: "http://eventhawk360.com/meetingsm", viewers: 2998, performance: "good", notes: "across ~14 posts" },
  { campaign: "Take off / Pro (Jan 19-29)", platform: "youtube", purpose: "bookings", ctaLink: "http://eventhawk360.com/meetingsm", notes: "across ~14 posts" },

  // Party Rental Growth Stats
  { campaign: "Party Rental Growth Stats", platform: "facebook", purpose: "engagement", assets: "Campaign 2025 Party Rental Growth Stats", cta: "COMMENT STATS + INFLATABLES + STATE", ctaLink: "http://eventhawk360.com/meetingsm", reach: 360, viewers: 2711, performance: "excellent", publishedAt: "2026-01-12" },
  { campaign: "Party Rental Growth Stats", platform: "instagram", purpose: "engagement", assets: "Campaign 2025 Party Rental Growth Stats", cta: "COMMENT STATS + INFLATABLES + STATE", ctaLink: "http://eventhawk360.com/meetingsm", reach: 161, viewers: 653, performance: "good", publishedAt: "2026-01-12" },
  { campaign: "Party Rental Growth Stats", platform: "tiktok", purpose: "engagement", assets: "Campaign 2025 Party Rental Growth Stats", cta: "COMMENT STATS + INFLATABLES + STATE", ctaLink: "http://eventhawk360.com/meetingsm", viewers: 399, performance: "regular", publishedAt: "2026-01-12" },
  { campaign: "Party Rental Growth Stats", platform: "youtube", purpose: "engagement", assets: "Campaign 2025 Party Rental Growth Stats", cta: "COMMENT STATS + INFLATABLES + STATE", ctaLink: "http://eventhawk360.com/meetingsm", viewers: 334, performance: "regular", publishedAt: "2026-01-12" },

  // Webinar campaign (Dec 31 organic)
  { campaign: "Webinar campaign (100K)", platform: "facebook", purpose: "reserve your spot", landingPage: "https://eventhawk.myadacademy.com/100k-webinar", ctaLink: "https://eventhawk.myadacademy.com/100k-webinar", assets: "Working File", cta: "Comment '100K' to reserve your spot", reach: 1573, viewers: 2855, performance: "good", publishedAt: "2025-12-31" },
  { campaign: "Webinar campaign (100K)", platform: "instagram", purpose: "reserve your spot", landingPage: "https://eventhawk.myadacademy.com/100k-webinar", ctaLink: "https://eventhawk.myadacademy.com/100k-webinar", assets: "Working File", cta: "Comment '100K' to reserve your spot", reach: 100, viewers: 189, performance: "regular", publishedAt: "2025-12-31" },
  { campaign: "Webinar campaign (100K)", platform: "tiktok", purpose: "reserve your spot", landingPage: "https://eventhawk.myadacademy.com/100k-webinar", ctaLink: "https://eventhawk.myadacademy.com/100k-webinar", assets: "Working File", cta: "Comment '100K' to reserve your spot", viewers: 178, performance: "good", publishedAt: "2025-12-31", notes: "static post" },
  { campaign: "Webinar campaign (100K)", platform: "youtube", purpose: "reserve your spot", landingPage: "https://eventhawk.myadacademy.com/100k-webinar", ctaLink: "https://eventhawk.myadacademy.com/100k-webinar", assets: "Working File", cta: "Comment '100K' to reserve your spot", viewers: 463, performance: "good", publishedAt: "2025-12-31", notes: "static post" },

  // NY Campaign
  { campaign: "NY Campaign 2026", platform: "facebook", purpose: "bookings", landingPage: "https://eventhawk.myadacademy.com/ny26", assets: "Year End Promo Creative", reach: 1312, viewers: 973, performance: "good", publishedAt: "2025-12-25" },
  { campaign: "NY Campaign 2026", platform: "instagram", purpose: "bookings", landingPage: "https://eventhawk.myadacademy.com/ny26", assets: "Year End Promo Creative", reach: 184, viewers: 2865, performance: "good", publishedAt: "2025-12-25", notes: "viewers raw '2.865' from sheet" },
  { campaign: "NY Campaign 2026", platform: "tiktok", purpose: "bookings", landingPage: "https://eventhawk.myadacademy.com/ny26", assets: "Year End Promo Creative", viewers: 283, performance: "regular", publishedAt: "2025-12-25" },
  { campaign: "NY Campaign 2026", platform: "youtube", purpose: "bookings", landingPage: "https://eventhawk.myadacademy.com/ny26", assets: "Year End Promo Creative", viewers: 167, performance: "good", publishedAt: "2025-12-25" },

  // Christmas campaign
  { campaign: "Christmas Campaign 2025", platform: "facebook", purpose: "bookings", landingPage: "https://eventhawk.myadacademy.com/xmas-promo", ctaLink: "https://eventhawk.myadacademy.com/xmas-promo", assets: "Christmas Promo Creatives", reach: 720, viewers: 1173, performance: "good", publishedAt: "2025-12-17" },
  { campaign: "Christmas Campaign 2025", platform: "instagram", purpose: "bookings", landingPage: "https://eventhawk.myadacademy.com/xmas-promo", ctaLink: "https://eventhawk.myadacademy.com/xmas-promo", assets: "Christmas Promo Creatives", reach: 504, viewers: 573, performance: "good", publishedAt: "2025-12-17" },
  { campaign: "Christmas Campaign 2025", platform: "tiktok", purpose: "bookings", landingPage: "https://eventhawk.myadacademy.com/xmas-promo", ctaLink: "https://eventhawk.myadacademy.com/xmas-promo", assets: "Christmas Promo Creatives", viewers: 398, performance: "good", publishedAt: "2025-12-17", notes: "static post" },
  { campaign: "Christmas Campaign 2025", platform: "youtube", purpose: "bookings", landingPage: "https://eventhawk.myadacademy.com/xmas-promo", ctaLink: "https://eventhawk.myadacademy.com/xmas-promo", assets: "Christmas Promo Creatives", viewers: 786, performance: "excellent", publishedAt: "2025-12-17", notes: "rated 100/100" },

  // Podcast 6M
  { campaign: "Podcast 6M", platform: "facebook", purpose: "get more listeners for the podcast", landingPage: "https://eventhawk.myadacademy.com/6m-podcast", caption: "CONFESSIONS OF A $6 MILLION PARTY RENTAL BUSINESS OWNER", cta: "Click to listen", ctaLink: "https://eventhawk.myadacademy.com/6m-podcast" },
  { campaign: "Podcast 6M", platform: "instagram", purpose: "get more listeners for the podcast", landingPage: "https://eventhawk.myadacademy.com/6m-podcast", caption: "CONFESSIONS OF A $6 MILLION PARTY RENTAL BUSINESS OWNER", cta: "Click to listen", ctaLink: "https://eventhawk.myadacademy.com/6m-podcast" },
  { campaign: "Podcast 6M", platform: "tiktok", purpose: "get more listeners for the podcast", landingPage: "https://eventhawk.myadacademy.com/6m-podcast", caption: "CONFESSIONS OF A $6 MILLION PARTY RENTAL BUSINESS OWNER", cta: "Click to listen", ctaLink: "https://eventhawk.myadacademy.com/6m-podcast" },
  { campaign: "Podcast 6M", platform: "youtube", purpose: "get more listeners for the podcast", landingPage: "https://eventhawk.myadacademy.com/6m-podcast", caption: "CONFESSIONS OF A $6 MILLION PARTY RENTAL BUSINESS OWNER", cta: "Click to listen", ctaLink: "https://eventhawk.myadacademy.com/6m-podcast" },

  // Boss Con 2026
  { campaign: "Boss Con 2026", platform: "facebook", purpose: "get more tickets", landingPage: "https://eventhawk.myadacademy.com/bosscon26-ma" },
  { campaign: "Boss Con 2026", platform: "tiktok", purpose: "get more tickets", landingPage: "https://eventhawk.myadacademy.com/bosscon26-ma" },
  { campaign: "Boss Con 2026", platform: "youtube", purpose: "get more tickets", landingPage: "https://eventhawk.myadacademy.com/bosscon26-ma" },
  { campaign: "Boss Con 2026", platform: "instagram", purpose: "get more tickets", landingPage: "https://eventhawk.myadacademy.com/bosscon26-ma" },

  // Black Friday 2025
  { campaign: "Black Friday 2025", platform: "tiktok", purpose: "bookings", landingPage: "https://eventhawk.myadacademy.com/bf24_e", cta: "comment black friday", ctaLink: "https://eventhawk.myadacademy.com/bf24_e" },
  { campaign: "Black Friday 2025", platform: "facebook", purpose: "bookings", landingPage: "https://eventhawk.myadacademy.com/bf24_e", cta: "comment black friday", ctaLink: "https://eventhawk.myadacademy.com/bf24_e", notes: "5 posts in total" },
  { campaign: "Black Friday 2025", platform: "youtube", purpose: "bookings", landingPage: "https://eventhawk.myadacademy.com/bf24_e", cta: "comment black friday", ctaLink: "https://eventhawk.myadacademy.com/bf24_e" },
  { campaign: "Black Friday 2025", platform: "instagram", purpose: "bookings", landingPage: "https://eventhawk.myadacademy.com/bf24_e", cta: "comment black friday", ctaLink: "https://eventhawk.myadacademy.com/bf24_e" },

  // SEO Audit (cross-platform)
  { campaign: "SEO Audit", platform: "facebook", purpose: "bookings", assets: "static post", headline: "Want to boost your website's visibility and rank higher on Google?", reach: 462, publishedAt: "2025-11-06" },
  { campaign: "SEO Audit", platform: "instagram", purpose: "bookings", assets: "static post", publishedAt: "2025-11-06" },
  { campaign: "SEO Audit", platform: "tiktok", purpose: "bookings", assets: "static post", publishedAt: "2025-11-06" },
  { campaign: "SEO Audit", platform: "youtube", purpose: "bookings", assets: "static post", publishedAt: "2025-11-06" },

  // IAAPA 2025
  { campaign: "IAAPA Expo 2025", platform: "facebook", purpose: "bookings", headline: "Ready to level up your party rental business at IAAPA Expo 2025?", cta: "COMMENT TICKETS and we'll send you info", publishedAt: "2025-11-11" },
  { campaign: "IAAPA Expo 2025", platform: "instagram", purpose: "bookings", publishedAt: "2025-11-11" },
  { campaign: "IAAPA Expo 2025", platform: "tiktok", purpose: "bookings", publishedAt: "2025-11-11" },
  { campaign: "IAAPA Expo 2025", platform: "youtube", purpose: "bookings", publishedAt: "2025-11-11" },
];

async function main() {
  console.log(`Seeding ${rows.length} posts across campaigns...`);

  // Wipe existing seed-driven rows for idempotency.
  await prisma.alert.deleteMany();
  await prisma.metricSnapshot.deleteMany();
  await prisma.post.deleteMany();
  await prisma.campaign.deleteMany();

  for (const row of rows) {
    const campaign = await prisma.campaign.upsert({
      where: { name: row.campaign },
      create: {
        name: row.campaign,
        purpose: row.purpose,
        audience: row.audience ?? "Party Rental Business Owners",
        landingPage: row.landingPage,
        assets: row.assets,
      },
      update: {
        purpose: row.purpose ?? undefined,
        landingPage: row.landingPage ?? undefined,
        assets: row.assets ?? undefined,
      },
    });

    const post = await prisma.post.create({
      data: {
        campaignId: campaign.id,
        platform: row.platform,
        postType: row.postType ?? "post",
        caption: row.caption,
        headline: row.headline,
        cta: row.cta,
        ctaLink: row.ctaLink,
        reach: row.reach,
        viewers: row.viewers,
        performance: row.performance,
        publishedAt: row.publishedAt ? new Date(row.publishedAt) : undefined,
        notes: row.notes,
      },
    });

    // Snapshot the initial metrics so trend lines have a starting point.
    if (row.reach != null || row.viewers != null) {
      await prisma.metricSnapshot.create({
        data: {
          postId: post.id,
          reach: row.reach,
          viewers: row.viewers,
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
