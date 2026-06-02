Data-access Node service (MySQL + GraphQL codegen)

Setup:

1. Copy `.env.example` to `.env` and set `DATABASE_URL` or the DB env vars from `.htaccess`:
	- `DB_SERVER`
	- `DB_USERNAME`
	- `DB_PASSWORD`
	- `DB_NAME`
	The server will also try to read `../.htaccess` if these env vars are missing.
2. Install dependencies:

```bash
npm install --filter ./data-access-minimal...
```

Run dev server:

```bash
npm --filter data-access-minimal dev
```

GraphQL sandbox runs at http://localhost:7071/graphql by default.

Generate types:

```bash
npm --filter data-access-minimal gen
```