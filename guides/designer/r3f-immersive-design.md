---
inclusion: manual
lastVerified: 2026-05-08
lastUsedInTask:
---

# React Three Fiber — Immersive Design Patterns

Skill guide for designing Awwwards-level 3D web experiences with R3F.

## Stack

| Library | Purpose |
|---------|---------|
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | Helpers: Text, Environment, Float, Stars, MeshDistortMaterial, ScrollControls, useScroll |
| `@react-three/postprocessing` | Bloom, ChromaticAberration, Vignette, DepthOfField |
| `leva` | Debug GUI for tweaking values in dev |
| `framer-motion-3d` | Animate R3F objects with Framer Motion API |
| `maath` | Math utilities (easing, dampening, geometry) |
| `lamina` | Layered shader materials (gradients, noise) |
| `reagraph` | WebGL graph visualization (agent network diagrams) |

## Scroll-Driven Scenes

The primary narrative device. Use `ScrollControls` from drei:

```
ScrollControls (pages={N}) → useScroll() → offset (0-1) → drive camera/objects
```

**Patterns:**
- Camera on a path (CatmullRomCurve3) — position + lookAt interpolated by scroll offset
- Sections that "lock" — objects animate in, hold, then scroll away
- Parallax layers — foreground moves faster than background
- Reveal on scroll — objects scale from 0, fade in, or fly in from off-screen

**Rules:**
- Never hijack scroll — use `ScrollControls` which wraps native scroll
- Dampen all scroll-driven values (`MathUtils.damp`) for smoothness
- Keep scroll sections generous (1.5-2 viewport heights minimum per "beat")

## Lighting for Mood

| Mood | Setup |
|------|-------|
| Dramatic/dark | Single directional + rim light, no ambient |
| Ethereal/space | Point lights with bloom, dark environment |
| Clean/product | HDRI environment + soft shadows |
| Cyberpunk | Colored point lights (magenta/cyan) + bloom + fog |

For Agent Forge: **Ethereal/space** — dark void, glowing nodes, bloom on accents.

## Post-Processing (Cheap Cinematic)

Apply sparingly — each effect costs GPU:
- **Bloom** — glow on emissive materials (essential for space/neon aesthetic)
- **Vignette** — darkens edges, focuses attention center
- **ChromaticAberration** — subtle RGB split on edges (cinematic, use offset < 0.003)
- **Noise** — film grain, adds texture to flat dark areas

Budget: max 3 post-processing effects simultaneously.

## Performance Rules

| Rule | Why |
|------|-----|
| Instancing for repeated geometry | 1000 stars = 1 draw call, not 1000 |
| `useFrame` with delta, not Date.now() | Frame-rate independent animation |
| Dispose textures/geometries on unmount | Memory leaks kill mobile |
| LOD (Level of Detail) for complex meshes | Swap to simpler geo at distance |
| Offscreen = invisible (`frustumCulled`) | Don't render what camera can't see |
| Compress textures (KTX2/Basis) | 4x smaller than PNG |
| Max 50k triangles visible per frame | Target for 60fps on integrated GPU |
| Avoid real-time shadows on mobile | Use baked shadows or contact shadows |

## Node/Constellation Pattern (Agent Forge Specific)

For the agent roster visualization:
- Each agent = a glowing sphere/icosahedron with emissive material
- Connections = line geometry or `THREE.TubeGeometry` along curves
- Hover = node scales up + label appears (drei `Html` component)
- Click = camera animates to node (lerp position over 60 frames)
- Idle = slow rotation + subtle float (`drei Float`)
- Particle field background (`drei Stars` or custom points)

## Text in 3D

- `drei Text` (troika-three-text) for 3D-positioned text
- `drei Html` for DOM overlays pinned to 3D positions (better for paragraphs)
- Don't put long text in 3D — use Html overlay with CSS transitions
- Hero headlines can be 3D text with emissive material + bloom

## Mobile Strategy

| Desktop | Mobile Fallback |
|---------|----------------|
| Full 3D scene | Reduced particle count, no post-processing |
| Scroll-driven camera | Simpler parallax (CSS or 2D) |
| Hover interactions | Tap interactions |
| Complex shaders | Basic materials |
| 60fps target | 30fps acceptable |

Detect with: `navigator.hardwareConcurrency < 4` or `matchMedia('(max-width: 768px)')`.

## Loading Strategy

3D assets are heavy. Plan for it:
- `drei Preload` + `useProgress` for loading screen
- Show a styled loading bar (not a spinner)
- Progressive loading: show scene with placeholder geo, swap in detailed models
- Total asset budget: < 5MB for initial load, lazy-load the rest

## Animation Easing

- `MathUtils.damp(current, target, lambda, delta)` — smooth follow
- `MathUtils.lerp(a, b, t)` — linear interpolation
- Custom easing via `maath/easing` — `easing.damp3` for Vector3

Never use `setInterval` or raw `requestAnimationFrame` — always `useFrame`.

## Color Palette (Agent Forge)

| Element | Color | Hex |
|---------|-------|-----|
| Background void | Near-black | `#0a0a0f` |
| Agent nodes (default) | Electric blue | `#4fc3f7` |
| Agent nodes (hover) | Bright amber | `#ffb300` |
| Connections | Dim blue | `#1a3a5c` |
| Text (primary) | Off-white | `#e8e8ec` |
| Text (secondary) | Mid-grey | `#8888a0` |
| Accent (CTA) | Amber | `#f59e0b` |
| Emissive glow | Match node color | — |

## Reference Patterns (Awwwards Winners)

- Scroll-driven camera path through environment (Atmos)
- Nodes that respond to cursor (repel/attract)
- Text that fades in per-character on scroll
- Sections separated by fog/depth transitions
- Loading screen as part of the experience (not a blocker)
