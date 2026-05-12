---
sync: draft
notionPageId:
lastLocalEdit: 2026-05-08T16:51:00+12:00
lastPublished:
---

# Agent Forge — Personal Portfolio Site

## What Is It
Personal website showcasing AI agent engineering — interactive, opinionated, space marine themed. Not a CV — a demonstration of systems-level AI engineering through interactive experiences.

## Location
`C:\Projects\Experimental\agent-forge`

## Status
Design phase. Design direction doc complete (pending approval). No code yet.

## Design Direction (Approved Picks)
- **Animation:** A2 — Cinematic scroll-driven camera, choreographed reveals
- **Typography:** B3 — Editorial/Contrast. Playfair Display (serif headlines) + JetBrains Mono (mono body)
- **3D Complexity:** C2 — Hybrid. Persistent 3D canvas + DOM sections
- **Interaction:** D3 — Exploratory. Drag nodes, click for details, choose your path
- **Tone:** E1 — Military/Commanding. Formal, ranked, lore-heavy
- **Inspiration:** Atmos atmosphere + Space Trash Signs particles (smoother/softer stars)
- **Navigation:** Page-based with smooth camera transitions (persistent canvas, never unmounts)

## Architecture Decision: Page-Based with Persistent 3D
- Each section is its own route (`/`, `/roster`, `/arena`, `/graveyard`, `/decisions`)
- 3D canvas persists across routes — camera lerps between positions on navigate (800ms, damped)
- DOM transitions via framer-motion AnimatePresence
- Landing page (`/`) still scrolls internally for hero → teaser → interactive sections
- Route state drives camera target via Jotai atom

## Tech Stack (Decided)
- Next.js 15 / React 19 / TypeScript
- Tailwind 4
- Vercel AI SDK (streaming LLM responses)
- Bun
- React Three Fiber + Drei (3D)
- Reagraph (agent network visualization)
- Deployed on Vercel

## The Chapter (Agent Roster — Themed Names)
| Agent | Chapter Name | Rank |
|-------|-------------|------|
| Orchestrator | Archon Theron | Second Chapter Master |
| Architect | Varro Stratex | Strategos |
| Dark Architect | Draven Mortivex | Adversarius |
| Frontend | Kael Artificer | Artifex |
| Backend | Tharion Ferrak | Artifex |
| Protobuf | Corvax Nexum | Artifex |
| QA | Severan Vigilus | Censor |
| Tester | Raxus Malleon | Censor |
| GitHub Ops | Vektus Celer | Operarius |
| Ticket Triage | Decrus Portax | Operarius |

## Planned Sections
1. **The Roster** — Agent profiles + visual workflow diagram
2. **Agent Arena** — Visitors paste code/design, agents respond in parallel (real-time debate)
3. **Roast My Architecture** — @dark-architect tears apart submitted designs
4. **Build Your Own Squad** — Interactive wizard → recommended agent team → download config
5. **The Graveyard** — Failed approaches, killed designs, lessons learned
6. **Decision Journal** — Public engineering decisions showing agent conversations

## Landing Page Design
- Full-screen 3D starry canvas (R3F), agent nodes as constellation
- Scroll-driven camera movement into the constellation
- Evolution feed (proof the system is alive)
- Interactive teasers: "Roast My Stack" + "Ask Stratex"
- Dark background (#0a0a0f), electric blue/amber accents

## Future Feature: Vox-Caster
Helmet-filtered TTS on agent responses (Web Audio API bandpass + distortion + reverb). Parked until core site built.

## Next Steps
- Scaffold Next.js project
- Build landing page (3D constellation + scroll sections)
- Roster page with Reagraph agent network
