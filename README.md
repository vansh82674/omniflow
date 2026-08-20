# OmniFlow

**OmniFlow** is a developer-first document intelligence platform. Upload any document (PDF, DOCX, TXT, CSV) and OmniFlow uses Gemini AI to extract structured data — title, summary, entities, key points, document type, and more — returned as clean JSON via an async job queue.

---

## Architecture

```
Browser ──POST /api/upload──> Next.js App ──enqueue──> BullMQ (Redis)
                                                             │
                                                         Worker process
                                                             │
                                                       Gemini Flash API
                                                             │
                                                       Prisma (SQLite)
                                                             │
                              Next.js App <──poll /api/job/[id]── Browser
```

- **Frontend**: Next.js 15 App Router + Framer Motion + shadcn/ui
- **Queue**: BullMQ with Redis (exponential backoff, 5 retries)
- **AI**: Google Gemini `gemini-2.0-flash` with structured JSON output
- **Database**: SQLite via Prisma + LibSQL adapter
- **Auth**: NextAuth v5 (credentials, bcrypt hashed passwords)

---

## Prerequisites

- **Node.js** 20+
- **Redis** running locally (`redis://localhost:6379`) or set `REDIS_URL` to an Upstash URL
- **Google Gemini API key** — get one at [ai.google.dev](https://ai.google.dev)

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/vansh82674/omniflow.git
cd omniflow
npm install
npm install-scripts approve prisma @prisma/engines esbuild
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `REDIS_URL` | Redis connection string (default: `redis://localhost:6379`) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `AUTH_SECRET` | Random secret for NextAuth JWT signing |
| `DATABASE_URL` | SQLite path (default: `file:./prisma/dev.db`) |

### 3. Initialize the database

```bash
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

This creates a SQLite database and seeds a default admin user:
- **Email**: `admin@omniflow.dev`
- **Password**: `omniflow2026`

### 4. Run the app

You need **two terminals**:

**Terminal 1 — Next.js dev server:**
```bash
npm run dev
```

**Terminal 2 — BullMQ worker:**
```bash
npm run worker
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

---

## Usage

1. **Sign in** at `/login`
2. On the dashboard, **drag & drop** any document or click **"Start Deploying"**
3. Supported formats: PDF, DOCX, DOC, TXT, MD, CSV (up to 10MB)
4. Watch the **Active Pipeline** panel as your job is processed
5. Once complete, click the **→** icon on any extraction to view the structured JSON result
6. View **API Keys** at `/dashboard/api-keys` to create keys for programmatic access

---

## API

### `POST /api/upload`
Upload a document for extraction. Requires auth.

**Body**: `multipart/form-data` with `content` field (File or text string)

**Response**: `{ jobId: string, message: string }`

### `GET /api/job/[id]`
Poll extraction status. Requires auth. Only returns jobs owned by the authenticated user.

**Response**: `{ id, name, status, result, fileType, timestamp }`

### `GET /api/jobs`
List all jobs for the authenticated user.

### `GET /api/metrics`
Return aggregated stats for the authenticated user.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server with Turbopack |
| `npm run worker` | Start the BullMQ extraction worker |
| `npm run build` | Build for production |
| `npx prisma studio` | Open Prisma database GUI |
| `npx tsx prisma/seed.ts` | Re-seed the database |
