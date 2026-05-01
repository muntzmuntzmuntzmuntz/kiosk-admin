# kiosk-admin

Internal/test admin dashboard for kiosk activation codes. This app is built with Next.js and Prisma and stores activation codes in Postgres.

## Important

This app is not production-safe yet.

- Login is client-side only.
- Credentials are hardcoded in the frontend.
- API routes do not enforce server-side authentication.

Use this deployment only for internal testing on a private URL with limited access.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Set `DATABASE_URL` in `.env`.

3. Apply migrations and generate the Prisma client:

```bash
npx prisma generate
npx prisma migrate deploy
```

4. Start the app:

```bash
npm run dev
```

## Render deployment

This repo includes a `render.yaml` blueprint for a Render web service plus a managed Postgres database.

### What Render will create

- Web service: `kiosk-admin`
- Postgres database: `kiosk-admin-db`

### Build and start commands

- Build: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
- Start: `npm run start`

### Deploy steps

1. Push this repository to GitHub.
2. In Render, create a new Blueprint deployment from that repository.
3. Confirm the blueprint picks up `render.yaml` from the repository root.
4. Let Render create the web service and Postgres instance.
5. Open the deployed URL after the first successful build.

### Environment

`DATABASE_URL` is wired from the Render Postgres database automatically by the blueprint.

Render runs Prisma migrations with the service's `preDeployCommand` before each deploy.

## Current test login

- Username: `admin`
- Password: `admin`

These credentials are hardcoded in the current test build and should be replaced before any real deployment.
