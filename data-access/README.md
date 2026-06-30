Data-access Node service (MongoDB + GraphQL codegen)

Setup:

1. Setup `.env.local` with DB env vars from MongoDB:
	- `MONGODB_URI`
	- `DB_USERNAME`
	- `DB_PASSWORD`
	- `DB_NAME`
    - `DB_HOST` 
	The server will also try to read `../.htaccess` if these env vars are missing.

2. Install dependencies:

```bash
npm i
```

Run dev server:

```bash
vercel dev
```

GraphQL sandbox runs at http://localhost:7071/graphql by default.

Generate types:

```bash
npm gen
```
