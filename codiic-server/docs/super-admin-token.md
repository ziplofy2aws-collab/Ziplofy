# SUPER_ADMIN_TOKEN — production configuration

`SUPER_ADMIN_TOKEN` is an opaque bearer token that authenticates requests as the
built-in `super-admin` principal (see `src/middlewares/auth.middleware.ts` and
`src/middlewares/socket-auth.middleware.ts`). The app reads it lazily at request
time via `getSuperAdminToken()` in `src/constants/index.ts`, so the dotenv file
just needs to be loaded before traffic arrives — no code rebuild is required to
rotate it (only a process restart).

When the variable is unset or blank, super-admin token auth is **disabled** —
every request falls through to normal JWT verification, and the app logs a
warning at startup. It is intentionally **not** a required env var so that the
service can boot without it.

## Generate a secure token

```bash
openssl rand -hex 32        # 64-char random hex — use this
# or: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Do **not** reuse JWTs, passwords, or any previously committed/expired token —
it is compared by equality, so it only needs to be long and unguessable.

## Configure on EC2 (`3.26.59.116` — codiic-server)

```bash
ssh -i ~/.ssh/codiic-server-ec2 ubuntu@3.26.59.116

# append to the existing file — do NOT overwrite it
echo 'SUPER_ADMIN_TOKEN=<paste-generated-token>' \
  | sudo -u ubuntu tee -a /home/ubuntu/Ziplofy/codiic-server/.env.production

pm2 restart codiic-server --update-env
```

Verify it's picked up (existence only — never print the value):

```bash
pm2 logs codiic-server --lines 20 | grep -i 'SUPER_ADMIN_TOKEN'
# absence of the "⚠️ SUPER_ADMIN_TOKEN is not set" warning = configured
```

## Rules

- Never commit `.env.production` or the token value (both `.env.*` files are
  gitignored — keep them that way).
- Never log the token value. The existing `console.log` lines in the middleware
  only log `Yes`/`No` for token presence — keep it that way.
- No weak default: the code deliberately has no fallback token.
- Rotate by replacing the value in `.env.production` and restarting PM2.
