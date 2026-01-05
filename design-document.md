# FF14 Static Hub — Design Document

**Version:** 1.0  
**Last Updated:** January 5, 2026  
**Status:** Phase 1 Complete, Phase 2+ Pending

---

## 1. Project Overview

### 1.1 Purpose

A web application for managing Final Fantasy XIV raid statics (8-player groups). The app provides tools for tracking gear progression, scheduling raids, managing rosters, and planning loot distribution.

### 1.2 Target Users

- FF14 raid static leaders and members
- Groups of 8 players coordinating endgame content

---

## 2. Technology Stack

### 2.1 Backend

| Component | Technology            |
| --------- | --------------------- |
| Runtime   | Bun                   |
| Framework | Elysia                |
| ORM       | Drizzle               |
| Database  | SQLite (bun:sqlite)   |
| Auth      | Lucia + Discord OAuth |

### 2.2 Frontend

| Component  | Technology                     |
| ---------- | ------------------------------ |
| Framework  | Angular v21+                   |
| API Client | Eden (type-safe Elysia client) |
| Styling    | SCSS                           |

### 2.3 Monorepo Structure

```
ff14-static-hub/
├── package.json          # Workspace root
├── tsconfig.base.json    # Shared TS config
└── packages/
    ├── server/           # Elysia API, Drizzle, SQLite
    ├── web/              # Angular app with Eden client
    └── shared/           # Shared types (if needed)
```

---

## 3. Architecture Guidelines

### 3.1 Core Principles

1. **Routes orchestrate, don't implement** — Handle HTTP concerns only, delegate to services
2. **External APIs get their own module** — Isolated, reusable, mockable
3. **Entity operations get a service** — One service per domain concept
4. **Services are composable** — Higher-level services can call lower-level ones
5. **No repository layer (for now)** — Services call Drizzle directly

### 3.2 Server Structure

```
packages/server/src/
├── core/
│   ├── auth/
│   │   ├── index.ts           # Routes (Elysia instance)
│   │   ├── auth.service.ts    # AuthService
│   │   ├── auth.model.ts      # Validation schemas
│   │   └── auth.middleware.ts # Auth guards
│   ├── user/
│   │   └── user.service.ts    # UserService (CRUD)
│   ├── session/
│   │   └── session.service.ts # SessionService
│   └── static/
│       ├── index.ts           # Routes
│       ├── static.service.ts  # StaticService (CRUD, membership)
│       ├── static.model.ts    # Validation schemas
│       └── static.middleware.ts
├── features/
│   ├── gear/                  # Gear tracking (Phase 3)
│   ├── loot/                  # Loot planning (Phase 4)
│   └── schedule/              # Calendar/events (Phase 5)
├── lib/
│   ├── discord-oauth.ts       # Discord OAuth wrapper
│   ├── lucia.ts               # Lucia configuration
│   ├── errors.ts              # Custom error classes
│   └── db.ts                  # Drizzle instance
└── app.ts                     # Main Elysia app
```

### 3.3 Layer Responsibilities

#### Routes (`index.ts`)

- HTTP concerns only: status codes, cookies, headers, redirects
- Request validation via model schemas
- Destructure only needed context: `({ body, cookie, user }) => ...`
- Call services with plain data, return responses

#### Services (`*.service.ts`)

- Business logic and orchestration
- Can call other services
- Call database directly via Drizzle
- Static classes with static methods
- No HTTP awareness — data in, data out

#### External API Modules (`lib/`)

- Isolated wrappers for third-party APIs
- No business logic
- Easy to mock for testing

#### Models (`*.model.ts`)

- Validation schemas using `Elysia.t`
- Request body, params, query, response typing

### 3.4 Error Handling

| Pattern       | Behavior                                                     |
| ------------- | ------------------------------------------------------------ |
| Queries       | Return `null` — caller decides if "not found" is an error    |
| Mutations     | Throw on failure — insert/update should return data or throw |
| Custom Errors | Classes with `status` property for HTTP mapping              |

**Error Classes:** `NotFoundError (404)`, `ConflictError (409)`, `DatabaseError (500)`, `UnauthorizedError (401)`, `ForbiddenError (403)`

---

## 4. Frontend Guidelines (Angular)

### 4.1 TypeScript Best Practices

- Use strict type checking
- Prefer type inference when obvious
- Avoid `any` type; use `unknown` when uncertain

### 4.2 Angular Best Practices

- Always use standalone components (default in Angular v20+)
- Do NOT set `standalone: true` inside decorators
- Use signals for state management
- Implement lazy loading for feature routes
- Use `NgOptimizedImage` for static images

### 4.3 Component Guidelines

- Keep components small and single-responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush`
- Prefer Reactive forms over Template-driven
- Use `class` bindings instead of `ngClass`
- Use `style` bindings instead of `ngStyle`

### 4.4 State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Use `update` or `set` on signals, not `mutate`

### 4.5 Templates

- Use native control flow (`@if`, `@for`, `@switch`)
- Use async pipe for observables
- Keep templates simple, avoid complex logic

### 4.6 Accessibility Requirements

- Must pass all AXE checks
- Must follow WCAG AA minimums
- Proper focus management, color contrast, ARIA attributes

---

## 5. Data Model

### 5.1 Core Entities

#### Users

| Field        | Type            | Notes                |
| ------------ | --------------- | -------------------- |
| id           | text (PK)       | Generated via Lucia  |
| discord_id   | text (unique)   | Discord user ID      |
| username     | text            | Discord username     |
| display_name | text            | Discord display name |
| avatar       | text (nullable) | Discord avatar hash  |
| created_at   | integer         | Timestamp            |

#### Sessions

| Field      | Type      | Notes                |
| ---------- | --------- | -------------------- |
| id         | text (PK) | Session ID           |
| user_id    | text (FK) | References users.id  |
| expires_at | integer   | Expiration timestamp |

#### Statics

| Field      | Type      | Notes        |
| ---------- | --------- | ------------ |
| id         | text (PK) | Generated ID |
| name       | text      | Static name  |
| created_at | integer   | Timestamp    |

#### Static Members

| Field      | Type              | Notes                 |
| ---------- | ----------------- | --------------------- |
| id         | text (PK)         | Generated ID          |
| static_id  | text (FK)         | References statics.id |
| user_id    | text (FK)         | References users.id   |
| role       | text              | 'leader' or 'member'  |
| can_manage | integer (boolean) | Management permission |
| joined_at  | integer           | Timestamp             |

#### Invite Codes

| Field      | Type               | Notes                         |
| ---------- | ------------------ | ----------------------------- |
| id         | text (PK)          | Generated ID                  |
| static_id  | text (FK)          | References statics.id         |
| code       | text (unique)      | Invite code string            |
| created_by | text (FK)          | References users.id           |
| expires_at | integer (nullable) | Optional expiration           |
| max_uses   | integer (nullable) | Optional use limit            |
| uses       | integer            | Current use count (default 0) |
| created_at | integer            | Timestamp                     |

### 5.2 Future Entities (Phases 2-5)

#### Characters (Phase 2)

- lodestone_id, name, server, user_id, static_id

#### Gear Sets (Phase 3)

- character_id, static_id, source, data (JSON)

#### BiS Sets (Phase 3)

- character_id, static_id, source, data (JSON)

#### Loot Plans (Phase 4)

- static_id, tier/fight identifier, notes

#### Loot Priority (Phase 4)

- loot_plan_id, item_slot/item_id, character_id, priority_rank

#### Schedule Events (Phase 5)

- static_id, title, start_time, end_time, recurrence_rule, cancelled_dates

---

## 6. Feature Requirements

### 6.1 Phase 0: Project Setup ✅ COMPLETE

- [x] Monorepo structure with Bun workspaces
- [x] Elysia server with `/health` endpoint
- [x] Drizzle + bun:sqlite with migration setup
- [x] Angular app with Eden connected to server
- [x] `bun dev` runs both server and client

### 6.2 Phase 1: Auth & Multi-tenancy ✅ COMPLETE

#### Authentication

- [x] Discord OAuth login flow
- [x] Session management via Lucia
- [x] Auth middleware (`requireAuth`)
- [x] Current user endpoint (`/auth/me`)
- [x] Logout functionality

#### Static Management

- [x] Create static (creator becomes leader)
- [x] Get user's statics (`/statics/my-statics`)
- [x] Get static details with members (`/statics/:staticId`)

#### Membership & Permissions

- [x] Leader-only routes (`requireStaticLeader` middleware)
- [x] Add/remove members
- [x] Update member roles
- [x] Invite code system (multi-use with optional expiry)

### 6.3 Phase 2: Character Management 🔜 NEXT

#### Requirements

- [ ] Character entity with Lodestone ID, name, server
- [ ] Import character from XIVAPI (Lodestone URL or name/server search)
- [ ] User can have multiple characters
- [ ] Assign character + job to a static
- [ ] Static roster view

### 6.4 Phase 3: Gear Tracking

#### Requirements

- [ ] GearSet and BiS entities
- [ ] Import BiS from XIVGear
- [ ] Manual gear entry/edit per slot
- [ ] Gear matrix view (characters × gear slots)
- [ ] Visual indicators (done, in progress, missing)

#### Gear Matrix

- X-axis: Static characters
- Y-axis: Gear slots (weapon, head, body, hands, legs, feet, earrings, necklace, bracelets, ring)
- Cell: Current gear vs BiS status

### 6.5 Phase 4: Loot Priority / Planning

#### Requirements

- [ ] Create loot plan per tier
- [ ] Assign priority per slot/item per character
- [ ] View showing who gets what from each fight
- [ ] Mark items as obtained
- [ ] Boss drops are static/known — support planning around this

### 6.6 Phase 5: Scheduling

#### Requirements

- [ ] Calendar view (month/week)
- [ ] Create one-off raid days
- [ ] Create recurring events (e.g., every Tuesday and Thursday 8-11pm)
- [ ] Cancel specific occurrences without deleting the series

#### Future Addon

- Availability polling — members input free times, system finds optimal raid times

---

## 7. API Endpoints

### 7.1 Authentication

| Method | Endpoint                 | Description            | Auth |
| ------ | ------------------------ | ---------------------- | ---- |
| GET    | `/auth/discord`          | Initiate Discord OAuth | No   |
| GET    | `/auth/discord/callback` | OAuth callback         | No   |
| GET    | `/auth/me`               | Get current user       | Yes  |
| POST   | `/auth/logout`           | Logout                 | Yes  |

### 7.2 Statics

| Method | Endpoint                                  | Description        | Auth   |
| ------ | ----------------------------------------- | ------------------ | ------ |
| POST   | `/statics/create`                         | Create new static  | Yes    |
| GET    | `/statics/my-statics`                     | Get user's statics | Yes    |
| GET    | `/statics/:staticId`                      | Get static details | Member |
| GET    | `/statics/:staticId/members`              | Get members list   | Leader |
| POST   | `/statics/:staticId/members`              | Add member         | Leader |
| DELETE | `/statics/:staticId/members/:userId`      | Remove member      | Leader |
| PATCH  | `/statics/:staticId/members/:userId/role` | Update member role | Leader |

---

## 8. External Integrations

### 8.1 Discord OAuth

- **Purpose:** User authentication
- **Scopes:** `identify`
- **Data Retrieved:** User ID, username, display name, avatar

### 8.2 XIVAPI (Phase 2)

- **Purpose:** Character import from Lodestone
- **Features:** Search by name/server, get character details

### 8.3 XIVGear (Phase 3)

- **Purpose:** Import BiS gear sets
- **Format:** Parse XIVGear share URLs/data

---

## 9. Decision Log

| Date       | Decision                                    | Rationale                                                        |
| ---------- | ------------------------------------------- | ---------------------------------------------------------------- |
| 2025-01-04 | No repository layer                         | Drizzle is already a nice abstraction; add later if needed       |
| 2025-01-04 | Static classes for services                 | Matches Elysia best practices, simpler than DI                   |
| 2025-01-04 | Separate UserService/SessionService         | Reusable beyond auth context                                     |
| 2025-01-04 | discord-oauth.ts in lib/                    | Isolate external API, keep auth service focused on orchestration |
| 2025-01-04 | Multi-use invite codes with optional expiry | Like Discord server invites                                      |
| 2025-01-04 | DB sessions over JWT                        | Revocable, more secure                                           |

---

## 10. File Naming Conventions

### Backend

| Type       | Pattern                   | Example              |
| ---------- | ------------------------- | -------------------- |
| Routes     | `index.ts`                | `core/auth/index.ts` |
| Service    | `{feature}.service.ts`    | `user.service.ts`    |
| Model      | `{feature}.model.ts`      | `auth.model.ts`      |
| Middleware | `{feature}.middleware.ts` | `auth.middleware.ts` |
| Types      | `{feature}.types.ts`      | `static.types.ts`    |

### Export Naming

| Type          | Convention               | Example                        |
| ------------- | ------------------------ | ------------------------------ |
| Service       | `PascalCase` + `Service` | `UserService`, `StaticService` |
| External API  | `PascalCase` + purpose   | `DiscordOAuth`                 |
| Model exports | `PascalCase` + `Model`   | `AuthModel`, `StaticModel`     |
| Route exports | `camelCase` + `Routes`   | `authRoutes`, `staticRoutes`   |

---

## 11. Development Scripts

```bash
# Run both server and client
bun dev

# Run server only
bun dev:server

# Run web only
bun dev:web

# Database migrations
bun db:generate    # Generate migrations
bun db:migrate     # Apply migrations
```

---

## Appendix A: When to Add Complexity

### Add Repository Layer When:

- You need to swap databases/ORMs
- Complex queries benefit from encapsulation
- You want to mock data access in unit tests

### Add Dependency Injection When:

- You need different implementations per environment
- Testing requires extensive mocking
- Services need runtime configuration

**Current stance:** Keep it simple. Static services calling Drizzle directly.
