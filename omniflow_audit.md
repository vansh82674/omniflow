# OmniFlow — Senior PM Product Audit
**Auditor**: Senior Product Manager (AI Infrastructure SaaS)
**Date**: August 21, 2026
**Stage**: Pre-Alpha / Developer Prototype
**Overall Score**: 5.5 / 10

---

> [!NOTE]
> This audit covers architecture, product strategy, UX, engineering quality, market positioning, and go-to-market readiness. It is based on a full static scan of the codebase — no mocking, no sugar-coating.

---

## 📦 What OmniFlow Is

OmniFlow is a **document intelligence pipeline platform**. Core proposition: upload a document → AI extracts structured data (title, summary, entities) → results returned via a job queue. It includes a dashboard UI, workflow manager view, API key management, and documentation pages.

**Tech Stack:**
- Next.js 15 (App Router, Turbopack)
- NextAuth v5 (credentials)
- BullMQ + Redis (async job queue)
- Google Gemini (`gemini-3.6-flash` via `@google/genai`)
- Framer Motion + shadcn/ui + TailwindCSS v4

---

## ✅ Strengths

### 1. Solid Async Architecture Foundation
The BullMQ + Redis + separate worker process pattern is **exactly what production document pipelines need**. The worker runs outside Next.js, decoupled properly. Exponential backoff is implemented (`60s delay, 5 attempts`) which is smart for a free-tier Gemini API. This is a non-trivial architectural decision that many junior devs get wrong.

**Code evidence**: [`worker.ts`](file:///c:/Users/nexus/OneDrive/Desktop/MyProjects/omniflow/src/lib/worker.ts), [`upload/route.ts`](file:///c:/Users/nexus/OneDrive/Desktop/MyProjects/omniflow/src/app/api/upload/route.ts)

### 2. Rate Limiting Is In Place
An atomic Redis-based rate limiter is implemented (`INCR` + `EXPIRE NX`) — this is a correct sliding-window implementation, not a naive in-memory hack. It's applied on the upload endpoint (5 req/60s per IP).

**Code evidence**: [`rate-limit.ts`](file:///c:/Users/nexus/OneDrive/Desktop/MyProjects/omniflow/src/lib/rate-limit.ts)

### 3. Type-Safe Schema Layer Exists
A Zod schema (`documentExtractionSchema`) and inferred TypeScript type are defined in `schemas.ts`. This shows intent to enforce data contracts — a good engineering instinct even if it's not yet wired up everywhere.

### 4. Premium UI Shell — First Impressions Are Strong
The login page (glassmorphism, animated splash screen, grid overlay), dashboard (bento metrics, live pipeline feed with AnimatePresence, drag-and-drop overlay), and workflows page are all visually polished. The dark zinc palette, spring animations via Framer Motion, and micro-interactions are competitive with mature SaaS products (Linear, Vercel, Resend).

### 5. Structured AI Output
Gemini is called with `responseMimeType: "application/json"` and a strict schema. This is the right pattern — not parsing free-text, but enforcing structured extraction. Shows product awareness of reliability vs. raw prompting.

### 6. Auth Middleware Is Properly Scoped
[`middleware.ts`](file:///c:/Users/nexus/OneDrive/Desktop/MyProjects/omniflow/middleware.ts) protects `/dashboard/*` and correctly excludes `/api/upload` and `/api/job/*` from the matcher. The route protection pattern is correct.

---

## 🚨 Critical Weaknesses

### 🔴 CRITICAL 1: Hardcoded Password in Auth (Security Blocker)
```ts
// src/auth.ts — Line 13
if (credentials?.password === "password123" && credentials?.email) {
```
**This is a demo credential baked directly into production auth code.** There is no user database, no hashing (bcrypt/argon2), no multi-user support. If deployed as-is, anyone who reads the source (or the login error message which reveals the password!) can log in.

The error message in [`login/page.tsx`](file:///c:/Users/nexus/OneDrive/Desktop/MyProjects/omniflow/src/app/login/page.tsx) line 32 literally says:
```ts
setError("Invalid credentials. Try any email + 'password123'");
```
This is **publicly surfaced** in a production UI. A critical security and trust issue before any real user touches this.

**PM Impact**: Cannot ship to beta users. Cannot fundraise with a demo that exposes this.

---

### 🔴 CRITICAL 2: No Database — Zero Data Persistence
The entire platform stores **nothing**. There is no Postgres, no SQLite, no Prisma, no Drizzle — not even a JSON file. Every "metric" on the dashboard (2,845 processed docs, 99.8% success rate, 3 active workers) is **hardcoded static fiction**.

```tsx
// dashboard/page.tsx — Line 230-233
{ label: "Processed Documents", value: "2,845" },
{ label: "Success Rate", value: "99.8%" },
{ label: "Active Workers", value: "3" },
```

The "Recent Extractions" table injects mock rows as fallback:
```tsx
.concat([
  { id: "mock-1", name: "Q2_Financials.pdf", status: "completed" },
  { id: "mock-2", name: "Vendor_Agreement.docx", status: "completed" },
])
```

**PM Impact**: The product cannot actually demonstrate value after a session ends. No audit trail. No user history. Not multi-tenant capable. Cannot charge for usage without tracking it.

---

### 🔴 CRITICAL 3: Upload Processes Files as Plain Text Only
```ts
// upload/route.ts — Line 28
contentToProcess = await fileOrText.text();
```
Binary files (PDFs, DOCX, XLSX, images) are read as `.text()` — which returns garbled binary content that Gemini cannot meaningfully process. The primary use case of the product **does not work** for the most common document formats. Only `.txt` files would work correctly today.

**PM Impact**: Core value prop is broken for 90%+ of realistic user file uploads. A user uploading a PDF gets garbage results.

---

### 🔴 CRITICAL 4: API Routes Have No Auth Guard (IDOR Risk)
```ts
// middleware.ts — Line 16
matcher: ['/((?!api/upload|api/job|_next/static|_next/image|favicon.ico).*)'],
```
`/api/upload` and `/api/job/[id]` are **entirely unauthenticated**. Any person on the internet can:
- POST to `/api/upload` and trigger Gemini API calls (burning your API credits)
- GET `/api/job/{any_id}` and read any other user's extraction results

The rate limiter only limits 5/min per IP — trivially bypassed with a VPN.

**PM Impact**: Immediate financial risk (API cost abuse) and user data privacy violation risk.

---

### 🟠 HIGH 5: Sidebar Navigation Is Non-Functional
All sidebar buttons in the dashboard are `<button>` elements with no `href`, no `router.push`, and no `onClick` handlers that navigate anywhere. The "Workflows," "API Keys," and "Settings" sidebar buttons do nothing.

```tsx
// dashboard/page.tsx — Line 127-135
<button className="..."> <Workflow /> Workflows </button>
<button className="..."> <KeyRound /> API Keys </button>
<button className="..."> <Settings /> Settings </button>
```

The Workflows and API Keys sub-pages exist as separate routes (`/dashboard/workflows`, `/dashboard/api-keys`) but the sidebar doesn't link to them.

**PM Impact**: Users cannot navigate the product after logging in. The nav is decorative.

---

### 🟠 HIGH 6: Fake/Mocked Sub-Pages with No Real Data Layer
Three of the four dashboard sub-sections use routes that return **randomly erroring mock data**:

```ts
// api/workflows/route.ts — Line 10
if (Math.random() < 0.1) {
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
```

The Workflows and API Keys pages don't even fetch from these API routes — they use **hardcoded local arrays** that don't match what the API returns. The API is connected to nothing and the UI reads from nothing.

---

### 🟠 HIGH 7: Job Naming Is Broken
```ts
// api/job/[id]/route.ts — Line 25
name: job.data.content ? "Document Upload" : "Unknown",
```
Every single processed document is named "Document Upload" in the job API response, regardless of original filename. The queue doesn't store the filename — only the raw content string. The dashboard has to fake it with a local `name` variable passed to the queue item.

---

### 🟡 MEDIUM 8: Polling Is Inefficient and Creates Re-render Loops
```ts
// dashboard/page.tsx — Line 45-68
useEffect(() => {
  const activeJobs = queue.filter(...);
  const interval = setInterval(() => {
    activeJobs.forEach(async (job) => { ... });
  }, 2000);
  return () => clearInterval(interval);
}, [queue]); // ← depends on queue
```
The `useEffect` depends on `queue`, and the polling updates `queue`, which re-triggers the effect, cancelling and restarting the interval on every state update. This creates a reset loop — the 2-second timer restarts every time any job updates. SSE (Server-Sent Events) or WebSockets would be far more appropriate here.

---

### 🟡 MEDIUM 9: Extraction Schema Is Severely Limited
The AI extraction only pulls: `title`, `summary`, `entities[]`. For a "complete platform for AI workflows," this is very narrow. Competitors (Reducto, LlamaParse, Textract) offer table extraction, field-specific schemas per document type, confidence scores, and bounding boxes.

---

### 🟡 MEDIUM 10: No Error UX — Just `alert()`
```ts
// dashboard/page.tsx — Line 81, 97
alert("Rate limit exceeded. Please try again in a minute.");
alert("Failed to upload document.");
```
Using browser `alert()` in a premium SaaS UI is a jarring regression from the otherwise polished design. A toast notification system (Sonner, react-hot-toast) should replace these immediately.

---

### 🟡 MEDIUM 11: README Is the Default Next.js Boilerplate
The README describes how to run a generic Next.js app. There is no mention of: what OmniFlow does, how to set up Redis, how to get a Gemini API key, how to run the worker, or what the `.env` variables mean. A new developer (or investor) cannot onboard without tribal knowledge.

---

### 🟡 MEDIUM 12: Docs Page Links All Go to `#`
Every CTA on the Docs page (`/dashboard/docs`) — "Start Building", "View API Reference", "Contact Support", all section cards — link to `href="#"`. The documentation is entirely fictional content.

---

### 🟢 LOW 13: `list-models.ts` Floats in Root Directory
A script `list-models.ts` sits in the project root — it appears to be a development utility that was never cleaned up or moved to a scripts directory. Minor but signals an unorganized workspace.

---

### 🟢 LOW 14: `any` Type Suppressions
Three instances of `// eslint-disable-next-line @typescript-eslint/no-explicit-any` are used. The rate-limiter uses `any` for the Redis multi-exec result, and the queue item `result` field is typed as `any`. These should be properly typed.

---

## 📊 Scorecard

| Dimension | Score | Notes |
|---|---|---|
| **Core Functionality** | 3/10 | Works for .txt only; no persistence; mocked metrics |
| **Security** | 2/10 | Hardcoded password, unprotected API routes |
| **UI/UX Design** | 8/10 | Genuinely impressive visual polish |
| **Architecture** | 7/10 | BullMQ/Redis pattern is solid; polling needs replacing |
| **Code Quality** | 5/10 | Good patterns undermined by mocks and type suppressions |
| **Product Completeness** | 3/10 | Navigation broken; sub-pages decorative |
| **Market Readiness** | 1/10 | Cannot be shown to paying customers |
| **Documentation** | 1/10 | Default boilerplate README; all doc links broken |

---

## 🗺️ PM Recommended Roadmap

### Sprint 1 — Security & Foundation (Week 1-2) 🔴
- [ ] Replace hardcoded auth with a real user table (Prisma + Postgres or Supabase)
- [ ] Add auth guard to `/api/upload` and `/api/job/[id]` — require valid session or API key
- [ ] Store original filename in the BullMQ job payload
- [ ] Remove the password hint from the login error message

### Sprint 2 — Real Data Layer (Week 2-3) 🟠
- [ ] Add a `jobs` table (id, userId, filename, status, result, createdAt)
- [ ] Wire dashboard metrics to real aggregated queries
- [ ] Remove all hardcoded mock arrays from UI; fetch from real API endpoints
- [ ] Fix sidebar navigation to actually route between pages

### Sprint 3 — Core Value Prop Fix (Week 3-4) 🟠
- [ ] Add PDF text extraction (use `pdf-parse` or Gemini's native file API)
- [ ] Add DOCX support (`mammoth.js`)
- [ ] Replace `alert()` with a toast system (Sonner)
- [ ] Replace polling `useEffect` with SSE endpoint `/api/job/[id]/stream`

### Sprint 4 — Product Polish (Week 4-5) 🟡
- [ ] Wire API Keys CRUD to a real database (create, revoke, rotate)
- [ ] Add OAuth providers (GitHub, Google buttons already in UI — wire them up)
- [ ] Write a real README (setup guide, env vars, architecture diagram)
- [ ] Expand extraction schema (custom schemas per document type is a killer feature)

### Sprint 5 — Go-to-Market Prep (Week 5-6)
- [ ] Multi-tenant user isolation
- [ ] Usage metering (track tokens, documents per user)
- [ ] Webhook delivery system (docs page already mentions it)
- [ ] Deploy to Vercel + Redis Cloud; set up staging environment

---

## 💡 Strategic PM Take

**The danger zone**: OmniFlow has the *aesthetics* of a Series A SaaS product but the *internals* of a hackathon demo. This is a double-edged sword — it's great for generating early buzz and mockups, but it creates a false sense of progress. The gap between "looks production-ready" and "is production-ready" needs to close fast before external validation (users, investors, co-founders) reveals the seams.

**The real opportunity**: The BullMQ architecture is genuinely good. If you add a database, fix the auth, and handle real file formats, the bones of a compelling document intelligence API platform are here. The market (Reducto, LlamaParse, Unstructured.io) is real and growing. OmniFlow's positioning as a "complete AI workflow platform" needs to be either narrowed (focus on document extraction as a tight vertical) or expanded (visual workflow builder, multi-step pipelines). Right now it's neither.

**The wedge to build toward**: The API key management UI and the structured extraction schema suggest the right direction — a **developer-first document AI API** (like Stripe, but for document understanding). That's a fundable, scalable idea. The worker + queue + Gemini stack is a reasonable v1 of that infrastructure. Don't let the beautiful UI mask the fact that the API surface is the real product.
