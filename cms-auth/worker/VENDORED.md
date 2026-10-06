# Vendored: sveltia-cms-auth

Upstream: https://github.com/sveltia/sveltia-cms-auth
Commit:   95733a9 (2026-10-02)

This is the OAuth worker from the Sveltia project, copied here unmodified
except for `wrangler.toml`, where we set the worker name and restrict
`ALLOWED_DOMAINS` to this site.

Do not hand-edit `src/`. To update, re-clone upstream and re-apply the
`wrangler.toml` changes.

Deploy from this directory:

    npx wrangler deploy
