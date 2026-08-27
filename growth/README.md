# Growth automation (no paid ads)

Scripts generate **ready-to-send drafts**. They do **not** auto-DM or auto-post to LinkedIn — that risks account restriction and usually needs LinkedIn Marketing API partnership.

## Quick start

```bash
# 1. Add prospects
cp growth/targets.example.csv growth/targets.csv
# edit growth/targets.csv

# 2. Generate personalized LinkedIn + email drafts
npm run growth:outreach
# optional: npm run growth:outreach -- --limit 10

# 3. Generate this week's LinkedIn posts (3 by default)
npm run growth:linkedin
# optional: npm run growth:linkedin -- --count 3
```

Outputs land in `growth/outbox/`.

## Suggested weekly rhythm

| Day | Action |
|-----|--------|
| Mon | `growth:linkedin` + schedule posts |
| Tue–Thu | Publish 1 post/day from the pack |
| Daily | Send ≤10 outreach notes from `growth:outreach` |
| Fri | Log replies; book demos via `/request-demo` |

## Warm path values (`warm_path` column)

- `mutual_connection:Name`
- `referral:Source`
- `aegis_network`
- `newark_law`
- `prior_meeting:Event`

## Site trust config

Set your calendar URL in `assets/js/site-config.js`:

```js
bookingUrl: "https://calendly.com/YOUR_HANDLE/platform-demo"
```

Optional worker secrets for lead email notify:

```bash
wrangler secret put RESEND_API_KEY
# optional vars: FROM_EMAIL, TO_EMAIL
```
