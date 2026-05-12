---
status: approved
approvedBy: Archangel
approvedDate: 2026-05-09
---

# Agent Forge — Requirements

## Overview

Personal portfolio site demonstrating AI agent engineering through an immersive 3D web experience. Space marine themed, interactive, page-based with smooth transitions.

## Target Audience

- Hiring managers / tech leads evaluating engineering capability
- Fellow developers interested in AI agent systems
- Awwwards / design community (stretch goal)

## MVP Scope (v1)

### In Scope

| Feature | Route | Priority |
|---------|-------|----------|
| Landing page with 3D constellation hero | `/` | P0 |
| Persistent 3D canvas across routes | Global | P0 |
| Smooth page transitions (camera lerp + DOM fade) | Global | P0 |
| Loading experience (insignia + progress bar) | Global | P0 |
| Roster page (agent profiles + network visualization) | `/roster` | P1 |
| Mobile fallback (reduced 3D, tap interactions) | Global | P1 |
| "Roast My Stack" interactive (Mortivex) | `/` or `/arena` | P2 |
| "Ask Stratex" interactive (architecture sketch) | `/` or `/arena` | P2 |

### Out of Scope (v1)

- Agent Arena (full multi-agent debate) — future
- Build Your Own Squad wizard — future
- The Graveyard page — future
- Decision Journal page — future
- Vox-Caster (voice output) — parked
- Evolution Feed (requires live data source) — future unless mocked
- CMS / dynamic content — static content for v1
- Authentication — none needed
- Analytics — add post-launch

## User Stories

### US-1: First Impression (Landing Hero)
**As a** visitor landing on the site
**I want to** see an immersive 3D constellation with smooth animation
**So that** I immediately understand this person builds sophisticated systems

**Acceptance Criteria:**
- 3D canvas renders within 3 seconds on mid-range laptop
- Stars and agent nodes visible, slowly drifting
- Hero text (name, subtitle, one-liner) appears after brief delay
- Two CTAs visible: "Meet The Chapter" and one other
- Constellation is draggable (desktop) or auto-rotates (mobile)

### US-2: Navigation
**As a** visitor
**I want to** navigate between pages with smooth camera transitions
**So that** the experience feels like one continuous space

**Acceptance Criteria:**
- Clicking a nav link or CTA triggers camera movement (no hard cut)
- DOM content fades out/in during transition
- 3D canvas never unmounts or flickers
- Browser back/forward works correctly
- URL updates on navigation

### US-3: Agent Roster
**As a** visitor
**I want to** see all agents with their roles, ranks, and relationships
**So that** I understand the system's architecture

**Acceptance Criteria:**
- All 10 agents displayed with name, rank, and description
- Visual network showing connections between agents
- Hover/click reveals more detail
- Responsive on mobile (cards or list fallback)

### US-4: Loading Experience
**As a** visitor on first load
**I want to** see a branded loading screen while 3D assets prepare
**So that** I don't see a blank page or broken layout

**Acceptance Criteria:**
- Chapter insignia appears immediately (inline SVG, no load)
- Progress bar fills proportional to actual asset loading
- "CHAPTER READY" text appears when complete
- Transition to main scene is smooth (fade)
- If load exceeds 8 seconds, "SKIP" button appears

### US-5: Mobile Experience
**As a** mobile visitor
**I want to** see a functional version of the site
**So that** I'm not excluded from the experience

**Acceptance Criteria:**
- Site is usable on iPhone 13+ and modern Android
- 3D is simplified (fewer particles, no post-processing, no drag)
- All text content is readable and accessible
- Touch targets are minimum 44x44px
- No horizontal scroll or layout overflow

### US-6: Roast My Stack (P2)
**As a** visitor
**I want to** select my tech stack and get a humorous roast from Mortivex
**So that** I'm entertained and see the AI agent personality in action

**Acceptance Criteria:**
- 4 dropdowns (Framework, Backend, Database, Hosting)
- Submit triggers LLM response (streamed)
- Response appears character-by-character
- Response is in-character (Mortivex voice)
- Rate limited (prevent abuse)

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s (desktop), < 3.5s (mobile) |
| Time to Interactive | < 3s (desktop), < 4s (mobile) |
| Target FPS | 60 (desktop), 30 (mobile) |
| Bundle size (JS, gzipped) | < 300KB initial |
| Total page weight | < 5MB (desktop), < 2MB (mobile) |
| Accessibility | WCAG AA (text contrast, keyboard nav, screen reader labels) |
| Browser support | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| SEO | Basic meta tags, OG images, semantic HTML for content |
| Hosting | Vercel (free tier sufficient for personal site) |

## Technical Constraints

- No backend server — static site + serverless functions (Vercel) for LLM calls
- LLM API key stored in Vercel env vars, never exposed client-side
- All 3D rendering client-side (no SSR for canvas)
- Content is static markdown/TSX — no CMS for v1
- Fonts: Google Fonts (Playfair Display, JetBrains Mono) — preloaded

## Definition of Done (per feature)

- Works on desktop Chrome + mobile Safari
- No console errors
- Lighthouse performance score > 80
- Accessible (keyboard navigable, contrast passes)
- Committed with conventional commit message
- Deployed to Vercel preview
