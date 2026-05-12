---
status: approved
approvedBy: Archangel
approvedDate: 2026-05-08
---

# Agent Forge — Design Direction

## 1. Design Direction Summary

Agent Forge is a dark-void cinematic experience where the user descends into a living constellation of AI agents. The camera drifts through space like a command bridge viewport — slow, deliberate, weighted — revealing ranked operatives as glowing nodes connected by doctrine-light. Typography is confrontational: oversized serif headlines carved from silence, monospace body text that reads like encrypted transmissions. Every interaction feels like issuing an order to the Chapter — click a node, receive a briefing. The tone is military formality meets cosmic awe: Atmos's scroll-driven atmosphere married to Space Trash Signs' particle density, but softer — stars that breathe rather than scatter.

## 2. Typography

| Role | Font | Weight |
|------|------|--------|
| Headlines (Display) | Playfair Display | 700, 900 |
| Body / UI | JetBrains Mono | 400, 500 |
| Accent / Labels | JetBrains Mono | 300 italic |

| Element | Size | Tracking | Transform |
|---------|------|----------|-----------|
| Hero headline | `clamp(4rem, 12vw, 11rem)` | `-0.04em` | uppercase |
| Section headline | `clamp(2.5rem, 6vw, 5rem)` | `-0.03em` | uppercase |
| Agent rank/title | `1rem` | `0.15em` | uppercase |
| Body text | `1rem` | `0.02em` | none |
| CTA buttons | `0.875rem` | `0.12em` | uppercase |

## 3. Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--void` | `#06060b` | Page background |
| `--void-surface` | `#0c0c14` | Card backgrounds |
| `--void-elevated` | `#12121f` | Hover states |
| `--primary` | `#4fc3f7` | Agent nodes idle, links |
| `--primary-dim` | `#1a3a5c` | Connection lines, borders |
| `--primary-glow` | `#80d8ff` | Bloom glow |
| `--secondary` | `#ffb300` | CTAs, hover, active nodes |
| `--secondary-glow` | `#ffe082` | Amber bloom |
| `--accent` | `#ff3d3d` | Mortivex, destructive |
| `--text-primary` | `#e8e8ec` | Headlines |
| `--text-secondary` | `#7a7a90` | Body text |
| `--text-tertiary` | `#4a4a5c` | Captions |

## 4. Navigation & Page Transitions

### Architecture: Page-Based with Persistent 3D Canvas

The 3D canvas (stars, constellation) persists across routes — it's NOT unmounted on navigation. Only the camera position, visible nodes, and DOM overlay change. This creates the illusion of moving through one continuous space.

### Routes

| Route | Camera Position | 3D Scene State | DOM Content |
|-------|----------------|----------------|-------------|
| `/` (Landing) | `(0, 0, 50)` | Full constellation, all nodes visible, slow drift | Hero text, CTAs |
| `/roster` | `(0, 0, 20)` | Constellation zoomed in, nodes spread wider, labels visible | Agent profiles panel |
| `/arena` | `(8, 0, 30)` | Camera offset right, Mortivex + Stratex nodes prominent | Arena input/output UI |
| `/graveyard` | `(0, -5, 40)` | Camera below, dim nodes, particles drift downward | Failed designs list |
| `/decisions` | `(-5, 2, 35)` | Camera offset left, connection lines highlighted | Decision journal entries |

### Transition Mechanics

| Trigger | Duration | Camera | 3D | DOM |
|---------|----------|--------|-----|-----|
| Route change | 800ms | Lerps to new position via `damp3(lambda: 4)` | Nodes reposition/rescale smoothly | Current page fades out (300ms) → new page fades in (500ms, staggered) |

### Transition Sequence (on navigate)

1. **0ms:** DOM content begins `opacity 1→0` + `translateY 0→-10px` (300ms, ease-out-quad)
2. **200ms:** Camera begins lerping to new route's position (800ms, damp)
3. **200ms:** 3D nodes begin transitioning (scale, position, opacity changes)
4. **500ms:** New DOM content begins `opacity 0→1` + `translateY 10px→0` (500ms, ease-out-expo, staggered per element 80ms)
5. **800ms:** Camera arrives, transitions complete

### Implementation Pattern

- Persistent `<Canvas>` in layout (never unmounts)
- Route state drives camera target + node visibility via Jotai atom
- DOM transitions via `framer-motion` `AnimatePresence` + `motion.div`
- Camera uses `useFrame` + `damp3` to follow target (never teleports)

### Within-Page Scrolling

Individual pages can still scroll for their own content (roster list, decision entries), but navigation between sections is route-based, not scroll-based. The landing page (`/`) uses scroll for its own hero → teaser → interactive sections.

## 5. Constellation Design

- Nodes: `IcosahedronGeometry` (detail 1), sized by rank (0.3-0.6 radius)
- Connections: `TubeGeometry` with energy pulse animation (UV offset, 3s loop)
- Layout: manually placed on sphere (radius 6), Archon at center
- Idle: slow rotation + Float, emissive 0.6
- Hover: scale 1.3, amber shift, emissive 1.2, label appears
- Active: scale 1.5, camera lerps to node (800ms), others dim
- Drag: node follows pointer, springs back on release (1200ms, damp3 lambda:3)

## 6. Motion Language

| Action | Duration | Easing |
|--------|----------|--------|
| Text word reveal | 80ms stagger | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Section headline | 600ms | ease-out-expo |
| Node hover | 300ms | ease-out-quad |
| Node click → camera | 800ms | ease-in-out-quint |
| Card entrance | 600ms | ease-out-expo |
| Scroll camera | continuous | damp(lambda: 4) |

## 7. Performance Budget

- Total triangles: < 5,000 (well under 50k target)
- Post-processing: Bloom + Vignette + Noise (max 3)
- Target: 60fps desktop, 30fps mobile
- Initial bundle: < 300KB gzipped
- Total page weight: < 5MB desktop, < 2MB mobile

## 8. Mobile Strategy

- < 768px: 500 particles, no post-processing, no drag, tap for nodes
- Static auto-rotating constellation
- Stacked cards, per-line fade (not per-word)
- CSS glow instead of bloom

## 9. Loading Experience

- Chapter insignia (SVG) → thin loading bar (2px, `--primary`) → "CHAPTER READY" → fade to scene
- Progressive: fonts first, React shell, then Three.js dynamic import, then post-processing
- Fallback: if WebGL unavailable, CSS constellation + DOM content
- Skip button after 8s

## 10. Key Dependencies

```
@react-three/fiber ^8.x
@react-three/drei ^9.x
@react-three/postprocessing ^2.x
three ^0.160.x
maath ^0.10.x
framer-motion ^11.x
```
