# CMS authentication worker

Sveltia CMS signs in through GitHub. GitHub's OAuth needs a server-side step
to exchange the login code for a token, so a small Cloudflare Worker performs
that exchange. It is the piece that lets the practice owner click "Sign in
with GitHub" instead of pasting an access token.

We deploy the upstream `sveltia-cms-auth` worker rather than vendoring a copy.
It is maintained alongside the CMS, and auth code is not something to
hand-transcribe.

**Why not Netlify Identity:** Netlify deprecated Git Gateway ("new Git Gateway
configurations are not recommended"), and Sveltia does not support that
backend at all. GitHub's client-side PKCE flow, which would remove the need
for a worker entirely, is on hold.

## One-time setup

### 1. Deploy the worker

    git clone https://github.com/sveltia/sveltia-cms-auth.git
    cd sveltia-cms-auth
    npx wrangler login
    npx wrangler deploy

Note the URL it prints, e.g. `https://sveltia-cms-auth.<account>.workers.dev`.

### 2. Register a GitHub OAuth app

<https://github.com/settings/developers> → **New OAuth App**

| Field | Value |
|---|---|
| Application name | Premier Wellness Telehealth CMS |
| Homepage URL | `https://amoody8.github.io/premier-wellness-telehealth` |
| Authorization callback URL | `<WORKER_URL>/callback` |

Copy the **Client ID**, then generate a **Client Secret**.

### 3. Give the worker its credentials

    npx wrangler secret put GITHUB_CLIENT_ID
    npx wrangler secret put GITHUB_CLIENT_SECRET
    npx wrangler secret put ALLOWED_DOMAINS   # amoody8.github.io

`ALLOWED_DOMAINS` restricts which sites may use this worker to sign in. Set it.

### 4. Point the CMS at the worker

In `src/admin/config.yml`, set `backend.base_url` to the worker URL. It is
currently a placeholder:

    base_url: https://pwt-cms-auth.REPLACE-ME.workers.dev

### 5. Grant the owner access

Create a GitHub account for her, then invite it to this repository with
**Write** permission: Settings → Collaborators → Add people. Store the
credentials in her password manager.

## Checking it works

Open `/admin/` on the live site, click **Sign in with GitHub**, approve the app
once, then change something small and save. The change should appear as a
commit on `main` and go live after the build finishes (about a minute).

## Cost

Cloudflare's free Workers tier covers this comfortably — the worker only runs
during a sign-in, a few times a month.
