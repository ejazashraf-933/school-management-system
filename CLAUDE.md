# School Management System — Project Guide

> **Purpose of this file:** This is the "always remember" file for the project. Claude Code
> auto-loads `CLAUDE.md` into context, so the decisions, principles, and working style below
> persist across every session. Keep it updated whenever a decision is made or changed.

---

## 1. Why this project exists (north star)

This project has **three goals at once** — every decision should serve all three:

1. **Learn deeply.** Understand the *why* behind every concept, not just make it work. This is
   a learning project first.
2. **Build a real, market-ready product.** A genuine multi-tenant SaaS, not a toy. Quality and
   architecture matter.
3. **Be interview-ready.** After each module, Ejaz should be able to explain the underlying
   concepts cold in an interview.

## 2. Working style (how we collaborate)

- **Teach in small steps.** Announce what we'll do *before* doing it. Wait for "ok" / "next"
  before moving to the next step.
- **Explain before implementing.** Before any code change, say *what* will be implemented and
  *why*, in **simple, human-like words**. Then wait.
- **Plan → questions → ok → execute.** Ejaz asks questions if he has any; only after he says
  "ok" do we make the change.
- **Small, reviewable changes.** Keep every change little so Ejaz can review what's happening
  and understand its purpose. No large multi-file changes in one shot.
- **Ejaz runs the terminal commands.** Provide the exact commands + a plain-words explanation
  of what each does; Ejaz runs them himself and reports back. Only run a command directly after
  asking and getting explicit permission.
- **Understanding over speed.** Always explain trade-offs and the reasoning behind a choice.
- **Surface interview questions.** After each meaningful unit of work, list 2–3 interview-style
  questions that unit unlocks, so learning compounds.

## 3. Build order (locked)

1. **Backend** — API, database, auth, multi-tenancy (current focus)
2. **Web frontend** — Super Admin panel + School Admin panel (React / Next.js)
3. **Mobile app** — Student / Parent / Teacher (React Native) — last step

## 4. Tech stack (decisions)

| Layer | Choice | Status / Notes |
|---|---|---|
| Mobile | **React Native (Expo)** | ✅ Decided — NOT Flutter |
| Web | **React / Next.js** | Admin + teacher portals |
| Backend | **NestJS (TypeScript)** | ✅ Decided — chosen over FastAPI (see ADR-001) |
| Database | **PostgreSQL 15** | Relational, multi-tenant |
| ORM | **TypeORM** | ✅ Decided — chosen over Prisma (see ADR-003) |
| Cache / Queue | **Redis (+ BullMQ)** | Sessions, caching, background jobs |
| Auth | **JWT + refresh-token rotation** | RBAC now; OAuth2 later |
| File storage | **AWS S3 / Cloudflare R2** | Signed URLs only |
| Push notifications | **Firebase FCM** | Mobile push |
| Real-time | **WebSockets (NestJS Gateway)** | Chat, live bus tracking |

> **Single-language advantage:** Backend, web, and mobile are all TypeScript. Share types,
> DTOs, and validation across the whole stack.

> **Local dev note — DB port 5433:** Ejaz has a *native* PostgreSQL running on `5432`, so our
> Docker Postgres is mapped to host port **5433** (`POSTGRES_PORT=5433` in root `.env`,
> `DB_PORT=5433` in `backend/.env`) to avoid the clash. Container-internal port stays 5432.
> Local DB creds: user `sms_user`, password `12345`, db `sms_db`.

## 5. Architecture principles (never violate)

- **Multi-tenancy isolation is sacred.** Every tenant-scoped table has a `school_id`.
  **School A must NEVER see School B's data.** Enforce at *multiple* layers:
  query-level filtering **and** PostgreSQL Row-Level Security (RLS).
- **RBAC hierarchy:** Super Admin → School Admin → Teacher → Student / Parent.
  Validate the user's school + role on every request.
- **Security baseline:** bcrypt password hashing, JWT with short expiry + refresh rotation,
  signed URLs for files, rate limiting, audit logging for sensitive actions, encrypted backups.
- **White-label per school:** logo, app name, primary color, login screen, email templates,
  SMS sender ID are all per-tenant configurable.

## 6. Module priority (from the PRD)

- 🔴 **High:** User Management, Attendance, Academics (classes/subjects/timetable),
  Examinations, Fee Management, Communication
- 🟡 **Medium:** Homework, Transport
- 🟢 **Low:** Library, Inventory

## 7. User roles & access

| Role | Access | Core capabilities |
|---|---|---|
| Super Admin | Web only | Manage schools, subscriptions, billing, global settings, support |
| School Admin | Web + Mobile | Students, fees, staff, dashboards, reports |
| Teacher | Mobile + optional Web | Attendance, homework, marks, leave, parent chat |
| Student | Mobile only | Timetable, homework, results, fees, materials, transport |
| Parent | Mobile only | Multi-child view, attendance, grades, fee payment, bus tracking, chat |

---

## 8. Decision log (ADRs)

### ADR-001 — NestJS over FastAPI for the backend
**Decision:** Use NestJS (TypeScript) as the core backend framework.

**Reasoning:**
- One language (TypeScript) across backend + web + mobile → shared types, deeper learning.
- Builds on Ejaz's existing JS/React strength → faster ramp, deeper understanding.
- Opinionated structure (DI, Modules, Guards, Interceptors, Pipes, Decorators) teaches the
  exact patterns interviewers ask about.
- Strong market demand for full-stack TypeScript engineers; future-proof.

**Trade-off accepted:** Python/FastAPI is stronger for AI/ML. The PRD's AI features (Phase 4)
will be added later as a **separate Python microservice** that the NestJS API calls — so the
core backend stays NestJS.

### ADR-002 — React Native over Flutter for mobile
**Decision:** Use React Native (Expo). Reason: keeps the whole stack in TypeScript and aligns
with Ejaz's existing React Native expertise. Supersedes the PRD's Flutter recommendation.

### ADR-003 — TypeORM over Prisma for the ORM
**Decision:** Use TypeORM (`@nestjs/typeorm`) as the ORM.

**Reasoning:**
- Keeps us close to real SQL → deeper database learning (better for interviews).
- Same decorator style (`@Entity`, `@Column`) as NestJS Controllers/Services → less overhead.
- First-class, native NestJS integration with the best documentation.
- **Our #1 hard requirement — multi-tenancy via Postgres Row-Level Security — is natural in
  TypeORM** (per-request "current school" session variable) but fiddly in Prisma's pooled model.

**Trade-off accepted:** Prisma has nicer DX and is hot for greenfield startups — worth learning
later — but TypeORM is the better fit for a NestJS + multi-tenant-RLS + learning-first project.

---

## 9. Source of truth

The full product spec lives in
`School Management System - Product Requirements Document.pdf` (PRD v1.0, March 2026).
This file captures **decisions and deviations**; the PRD captures the **full feature scope**.

---

## 10. Progress log

- **2026-06-30/07-01 — Backend foundations done:** NestJS project scaffolded (`backend/`), running.
  PostgreSQL 15 via Docker (host port **5433**), TypeORM connected via `TypeOrmModule.forRootAsync`
  + `@nestjs/config`. `synchronize: true` for now (dev).
- **Swagger** enabled at `http://localhost:3000/api`; global `ValidationPipe`
  (`whitelist` + `forbidNonWhitelisted` + `transform`) on.
- **First entity + full CRUD: `School`** (`src/schools/`) — entity, module, service, controller,
  `CreateSchoolDto` / `UpdateSchoolDto` (PartialType). Endpoints: POST, GET all, GET :id, PATCH, DELETE.
  Table auto-created via synchronize.
- Ejaz inspects the DB in **DBeaver** (connection "SMS – Docker (5433)").
- **Next up (roadmap step 3→4):** add remaining PRD `School` fields (branding/plan) as needed, then
  **Users & Authentication** (register/login, bcrypt, JWT), then RBAC, then multi-tenancy enforcement.
