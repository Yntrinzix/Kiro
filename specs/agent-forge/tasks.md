---
status: review
---

# Agent Forge — Task Breakdown

## Phase 1: Project Scaffold & Foundation

### Task 1.1: Initialize Next.js 15 project with Bun
- **Description:** `bun create next-app` with App Router, TypeScript, Tailwind 4. Configure path aliases. Remove boilerplate.
- **Files:** `package.json`, `bun.lockb`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- **Depends on:** nothing
- **AC:** `bun run dev` starts; `bun run build` succeeds; blank dark page renders.

### Task 1.2: Install 3D and animation dependencies
- **Description:** Add R3F, drei, postprocessing, three, maath, framer-motion, jotai. Pin exact versions.
- **Files:** `package.json`, `bun.lockb`
- **Depends on:** 1.1
- **AC:** All packages resolve; build succeeds; types found.

### Task 1.3: Design tokens & global styles
- **Description:** CSS custom properties from design palette. Tailwind theme extension. Font imports (Playfair Display, JetBrains Mono) via `next/font/google`.
- **Files:** `app/globals.css`, `tailwind.config.ts`, `app/layout.tsx`, `lib/fonts.ts`
- **Depends on:** 1.1
- **AC:** Correct background color, fonts load, Tailwind utilities work.

### Task 1.4: App layout with persistent Canvas shell
- **Description:** Root layout with full-viewport `<Canvas>` (dynamic import, ssr: false) + DOM overlay container. Jotai provider at layout level.
- **Files:** `app/layout.tsx`, `components/canvas/Scene.tsx`, `components/canvas/index.tsx`, `lib/store.ts`
- **Depends on:** 1.2, 1.3
- **AC:** Canvas mounts once; route changes don't remount it.

---

## Phase 2: Loading Experience

### Task 2.1: Loading screen component
- **Description:** Full-screen overlay: insignia SVG, progress bar (2px, --primary), "CHAPTER READY" text, fade-out. Skip button after 8s.
- **Files:** `components/loading/LoadingScreen.tsx`, `components/loading/Insignia.tsx`, `components/loading/ProgressBar.tsx`, `lib/store.ts`
- **Depends on:** 1.4
- **AC:** Loading screen renders; progress bar animates; skip button at 8s; fades out at 100%.

### Task 2.2: Asset loading integration
- **Description:** Wire `useProgress` from drei to loading atom. Handle WebGL unavailable fallback.
- **Files:** `components/canvas/Scene.tsx`, `components/loading/LoadingScreen.tsx`, `lib/hooks/useWebGLSupport.ts`
- **Depends on:** 2.1
- **AC:** Bar reflects real load progress; graceful fallback without WebGL.

---

## Phase 3: 3D Constellation Scene

### Task 3.1: Starfield background
- **Description:** Particle starfield (2000 points), slow rotation, depth layering.
- **Files:** `components/canvas/Starfield.tsx`, `components/canvas/Scene.tsx`
- **Depends on:** 1.4
- **AC:** Stars render; slow rotation; 60fps.

### Task 3.2: Agent node meshes
- **Description:** IcosahedronGeometry nodes, emissive material, sized by rank, Float drift. Static data file for positions.
- **Files:** `components/canvas/AgentNode.tsx`, `components/canvas/Constellation.tsx`, `content/agents.ts`
- **Depends on:** 3.1
- **AC:** 10 glowing nodes visible, floating, arranged in constellation.

### Task 3.3: Connection lines
- **Description:** Lines between related agents, --primary-dim color, energy pulse animation.
- **Files:** `components/canvas/ConnectionLine.tsx`, `components/canvas/Constellation.tsx`
- **Depends on:** 3.2
- **AC:** Lines connect nodes; pulse animation visible.

### Task 3.4: Node hover & click interactions
- **Description:** Hover: scale 1.3, amber shift, label. Click: set activeNodeAtom. OrbitControls with constrained drag.
- **Files:** `components/canvas/AgentNode.tsx`, `components/canvas/Constellation.tsx`, `lib/store.ts`
- **Depends on:** 3.2
- **AC:** Hover shows feedback + label; click sets state; constellation draggable.

### Task 3.5: Post-processing
- **Description:** Bloom (threshold 0.8, intensity 0.6) + Vignette. Verify 60fps.
- **Files:** `components/canvas/Effects.tsx`, `components/canvas/Scene.tsx`
- **Depends on:** 3.3
- **AC:** Nodes glow; vignette visible; FPS ≥ 55.

---

## Phase 4: Navigation & Page Transitions

### Task 4.1: Route-driven camera system
- **Description:** Camera controller reads currentRouteAtom, lerps to target via damp3. Camera targets per route.
- **Files:** `components/canvas/CameraController.tsx`, `lib/store.ts`, `components/canvas/Scene.tsx`
- **Depends on:** 3.4
- **AC:** Changing route atom causes smooth camera lerp (~800ms).

### Task 4.2: Route sync with App Router
- **Description:** Sync usePathname() to currentRouteAtom. Browser back/forward works.
- **Files:** `components/navigation/RouteSync.tsx`, `app/layout.tsx`
- **Depends on:** 4.1
- **AC:** Navigation + history updates camera; URL always correct.

### Task 4.3: DOM page transitions
- **Description:** AnimatePresence + motion.div wrapper. Exit: opacity 0, y: -10 (300ms). Enter: opacity 1, y: 0 (500ms, stagger 80ms).
- **Files:** `components/navigation/PageTransition.tsx`, `app/template.tsx`
- **Depends on:** 4.2
- **AC:** Smooth fade between pages; canvas stable underneath.

### Task 4.4: Navigation UI
- **Description:** Minimal nav: logo top-left, links top-right. Monospace, uppercase. Mobile: hamburger or bottom nav.
- **Files:** `components/navigation/Nav.tsx`, `components/navigation/MobileNav.tsx`, `app/layout.tsx`
- **Depends on:** 4.3
- **AC:** Nav triggers smooth transitions; mobile nav usable with 44px targets.

---

## Phase 5: Landing Page

### Task 5.1: Hero section
- **Description:** Headline, subtitle, one-liner, two CTAs. Staggered word reveal animation.
- **Files:** `app/page.tsx`, `components/landing/Hero.tsx`, `components/landing/CTAButton.tsx`
- **Depends on:** 4.3
- **AC:** Hero text animates in; CTAs clickable; "Meet The Chapter" navigates smoothly.

### Task 5.2: Chapter teaser scroll section
- **Description:** Scroll-triggered section: "10 agents..." text + 3 featured agent names + CTA.
- **Files:** `components/landing/ChapterTeaser.tsx`, `app/page.tsx`
- **Depends on:** 5.1
- **AC:** Content reveals on scroll; CTA links to roster.

### Task 5.3: Scroll-driven camera push
- **Description:** Landing page scroll pushes camera forward (z: 50→45). Subtle depth effect.
- **Files:** `components/canvas/CameraController.tsx`, `lib/store.ts`
- **Depends on:** 5.2, 4.1
- **AC:** Gentle zoom on scroll; resets on navigate away.

---

## Phase 6: Roster Page

### Task 6.1: Roster page layout & agent cards
- **Description:** `/roster` with all 10 agents as styled cards. Staggered entrance.
- **Files:** `app/roster/page.tsx`, `components/roster/AgentCard.tsx`, `components/roster/RosterPanel.tsx`
- **Depends on:** 4.3, 3.2
- **AC:** All agents displayed; cards animate in; click updates activeNodeAtom.

### Task 6.2: Agent detail expansion
- **Description:** Click card → detail view + camera lerps to node. Escape closes.
- **Files:** `components/roster/AgentDetail.tsx`, `components/roster/RosterPanel.tsx`, `components/canvas/CameraController.tsx`
- **Depends on:** 6.1, 4.1
- **AC:** Detail shows + camera moves; closing returns camera.

### Task 6.3: Constellation labels on roster
- **Description:** Text labels next to nodes (drei Html), billboard, dim non-hovered. Only on /roster.
- **Files:** `components/canvas/NodeLabel.tsx`, `components/canvas/Constellation.tsx`
- **Depends on:** 6.1, 3.4
- **AC:** Labels visible on roster; hidden on other routes; readable.

---

## Phase 7: Mobile & Polish

### Task 7.1: Mobile 3D fallback
- **Description:** < 768px: 500 particles, no post-processing, no drag, auto-rotate, tap only.
- **Files:** `components/canvas/Scene.tsx`, `components/canvas/Starfield.tsx`, `components/canvas/Effects.tsx`, `lib/hooks/useIsMobile.ts`
- **Depends on:** 3.5, 3.4
- **AC:** Mobile: fewer particles, no bloom, tap works, FPS ≥ 30.

### Task 7.2: Responsive DOM layouts
- **Description:** All DOM content responsive. Cards stack. Hero scales. Touch targets ≥ 44px. No overflow at 375px.
- **Files:** Various component files
- **Depends on:** 5.1, 6.1, 4.4
- **AC:** No horizontal scroll at 375px; all targets ≥ 44px; text readable.

### Task 7.3: Accessibility pass
- **Description:** aria-labels, keyboard nav, skip-to-content, focus-visible, prefers-reduced-motion.
- **Files:** Various component files, `app/globals.css`, `app/layout.tsx`
- **Depends on:** 7.2
- **AC:** Lighthouse a11y ≥ 90; keyboard nav works; reduced-motion disables animations.

### Task 7.4: SEO & meta tags
- **Description:** Metadata exports, OG image, semantic landmarks.
- **Files:** `app/layout.tsx`, `app/page.tsx`, `app/roster/page.tsx`, `public/og-image.png`
- **Depends on:** 5.1, 6.1
- **AC:** Social preview works; Lighthouse SEO ≥ 90.

### Task 7.5: Performance audit
- **Description:** Lighthouse audit. Optimize bundle, fonts, lazy-load post-processing.
- **Files:** Various as needed
- **Depends on:** 7.3, 7.4
- **AC:** Lighthouse perf ≥ 80; FCP < 1.5s; LCP < 2.5s desktop.

---

## Phase 8: Deployment

### Task 8.1: Vercel deployment
- **Description:** Connect repo, verify build + preview deploys. Add env var placeholders.
- **Files:** `vercel.json` (if needed), `.env.example`
- **Depends on:** 7.5
- **AC:** Push to main deploys successfully; preview deploys on PRs.

### Task 8.2: P2 placeholder — Arena
- **Description:** Stub `/arena` route with "Coming Soon" themed page. Disabled CTA on landing.
- **Files:** `app/arena/page.tsx`, `components/landing/Hero.tsx`
- **Depends on:** 5.1
- **AC:** `/arena` renders placeholder; no broken links.
