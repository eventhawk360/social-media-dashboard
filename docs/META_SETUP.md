# Meta (Facebook + Instagram) API setup

This guide walks through creating a Meta developer app and getting the tokens
the dashboard needs to pull Facebook Page and Instagram Business metrics.

Budget ~30–45 minutes. App Review (step 8) can take a few business days, so
start that early if you need it.

---

## Before you start — prerequisites

You need **all** of these. If any are missing, sort them out first:

1. A **Facebook Page** for your business (not a personal profile).
2. An **Instagram account** that is a **Business** or **Creator** account
   (Instagram app → Settings → Account type).
3. The Instagram account **linked to the Facebook Page**
   (Page → Settings → Linked accounts → Instagram).
4. A **Meta Business Portfolio** (formerly Business Manager) at
   <https://business.facebook.com> with the Page added to it.
5. You are an **admin** of the Page and the Business Portfolio.

---

## Step 1 — Create the Meta app

1. Go to <https://developers.facebook.com/apps> and log in.
2. Click **Create App**.
3. Use case: choose **Other** → **Next**.
4. App type: choose **Business** → **Next**.
5. Name it e.g. `EventHawk Social Dashboard`, enter your contact email, and
   select your Business Portfolio → **Create app**.
6. You'll land on the app dashboard. Note the **App ID** (top of page).
7. Go to **App settings → Basic** and copy the **App Secret** (click *Show*).
   This is `META_APP_SECRET` in your `.env`.

---

## Step 2 — Add the products

On the app dashboard, find **Add products** and add:

- **Instagram** → **Instagram Graph API** (for IG insights)
- **Webhooks** (for instant new-post notifications)

Facebook Page access is available through the Graph API by default once you
have a Page token — no extra product needed.

---

## Step 3 — Identify your Page ID and Instagram Business ID

Use the **Graph API Explorer**: <https://developers.facebook.com/tools/explorer>

1. Top-right, select your app from the **Meta App** dropdown.
2. Click **Generate Access Token** and approve the prompts. This gives a
   temporary user token — fine for these lookups.
3. In the query box run:

   ```
   me/accounts?fields=name,id,instagram_business_account
   ```

4. In the response:
   - `data[].id` for your Page is **`META_FACEBOOK_PAGE_ID`**.
   - `data[].instagram_business_account.id` is
     **`META_INSTAGRAM_BUSINESS_ID`**.

   If `instagram_business_account` is missing, your IG account isn't linked to
   the Page — fix prerequisite #3 and retry.

---

## Step 4 — Which permissions the dashboard needs

When you generate the token, request these scopes:

| Permission                     | Why |
|---------------------------------|-----|
| `pages_show_list`               | List the Pages you manage |
| `pages_read_engagement`         | Read Page posts |
| `read_insights`                 | Read Page + post insights (reach, impressions) |
| `instagram_basic`               | Read the IG account and its media |
| `instagram_manage_insights`     | Read IG media insights (reach, impressions, engagement) |
| `business_management`           | Required for System User tokens (step 6) |

---

## Step 5 — Get a token to test with (short-lived, ~1–2 hours)

Quick path to confirm everything works before doing the permanent setup:

1. In **Graph API Explorer**, with your app selected, click
   **Add permissions** and tick the six scopes from step 4.
2. Click **Generate Access Token** → approve. You now have a **user token**.
3. Exchange it for a **Page token** — run in the Explorer:

   ```
   me/accounts?fields=name,access_token
   ```

   The `access_token` next to your Page is a **Page access token**. Use it as
   `META_ACCESS_TOKEN` to smoke-test:

   ```bash
   npm run ingest
   ```

   This token expires in ~1–2 hours. For production, use step 6.

---

## Step 6 — Get a non-expiring token (System User — recommended)

For unattended polling you want a token that does **not** expire. Meta provides
this via a **System User** in the Business Portfolio.

1. Go to <https://business.facebook.com/settings>.
2. Left menu → **Users → System Users** → **Add**.
3. Name it e.g. `dashboard-bot`, role **Admin** → **Create**.
4. Select the system user → **Assign assets** → assign your **Facebook Page**
   with **Full control** (or at least *Manage* + content/insights).
5. Click **Generate new token**:
   - Select your app.
   - Token expiration: **Never**.
   - Tick the six permissions from step 4.
   - **Generate token** and copy it immediately — it is shown only once.
6. This token is your production **`META_ACCESS_TOKEN`**.

> System User tokens act as the Page itself, so they return both the Page's
> Facebook posts and the linked Instagram account's media.

If you prefer not to use a System User, the alternative is a **long-lived Page
token** (~60 days) — exchange a short-lived token via:

```
GET https://graph.facebook.com/v21.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id=APP_ID
  &client_secret=APP_SECRET
  &fb_exchange_token=SHORT_LIVED_TOKEN
```

…but you'd then have to re-run that every ~50 days. The System User token is
the lower-maintenance choice.

---

## Step 7 — Set up the webhook (instant new-post detection)

1. Deploy the dashboard so it has a public HTTPS URL (e.g. Vercel). The
   callback must be reachable from the internet — `localhost` won't work.
2. In your `.env` / Vercel env vars, set `META_WEBHOOK_VERIFY_TOKEN` to any
   random string you choose (e.g. a UUID).
3. In the app dashboard → **Webhooks**:
   - Object: **Page** → **Subscribe to this object**.
   - **Callback URL**: `https://YOUR_HOST/api/webhooks/meta`
   - **Verify token**: the same value as `META_WEBHOOK_VERIFY_TOKEN`.
   - Click **Verify and save**. Meta calls the endpoint's GET handler; it
     responds with the challenge and the subscription is confirmed.
4. Under the Page object, click **Subscribe** next to the **`feed`** field
   (fires when a post is published or edited).
5. For Instagram, repeat with object **Instagram** and subscribe to the
   **`media`** field (and `comments` if you want comment tracking).

Now when you publish a post, Meta POSTs to `/api/webhooks/meta`, which triggers
an immediate metrics poll so the post appears on `/live` within seconds.

---

## Step 8 — App Review (only if needed)

- While the app is in **Development mode**, the API works **only for users with
  a role on the app** (admins, developers, testers). If the Page and IG account
  belong to your own team and you add those people as app testers under
  **App roles → Roles**, you may not need App Review at all.
- To use the app against assets outside that group, or to take it fully live,
  submit the six permissions for **App Review** (app dashboard → **App Review →
  Permissions and Features**). Provide a screencast showing how each permission
  is used. Approval typically takes a few business days.

For a single-business internal dashboard, adding your team as testers is
usually enough — try that before submitting for review.

---

## Step 9 — Fill in `.env`

```env
META_ACCESS_TOKEN="<System User or long-lived Page token from step 6>"
META_FACEBOOK_PAGE_ID="<from step 3>"
META_INSTAGRAM_BUSINESS_ID="<from step 3>"
META_WEBHOOK_VERIFY_TOKEN="<the random string from step 7>"
META_APP_SECRET="<App Secret from step 1>"
```

On Vercel, add the same keys under **Project → Settings → Environment
Variables** (do not commit real tokens to git).

Verify it works:

```bash
npm run ingest      # should report updated counts, not "skipped"
```

Then open `/live` and publish a test post — it should appear within a minute.

---

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| `ingest` says `skipped: ... missing` | An env var is empty |
| `(#10) Application does not have permission` | Missing scope — regenerate the token with all six permissions |
| `Error validating access token: Session has expired` | Short-lived token expired — use a System User token (step 6) |
| `instagram_business_account` is null | IG account not linked to the Page, or not a Business/Creator account |
| Webhook "Verify and save" fails | Callback URL not public HTTPS, or verify token mismatch |
| IG insights return zeros | The IG account must be **Business** (Creator accounts expose fewer metrics) |
| Reach/impressions missing on old posts | Meta only returns insights for posts from roughly the last ~2 years |

---

## API version note

The ingester targets Graph API **v21.0** (`src/lib/ingest/meta.ts`, the `GRAPH`
constant). Meta deprecates versions about every ~2 years — bump that string
when you see deprecation warnings in the ingest logs.
