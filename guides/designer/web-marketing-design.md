---
inclusion: manual
lastVerified:
lastUsedInTask:
---

# Website & Marketing Design

Use this guide when designing websites, portfolios, landing pages, or marketing sites — NOT applications.

## Core Principle

The goal is emotional impact and conversion, not task completion. Every decision serves: "Does this make someone stop scrolling and feel something?"

## Typography as Personality

- The typeface IS the brand. Choose one with genuine character.
- Scale dramatically: hero headlines at `clamp(4rem, 10vw, 11rem)` or bigger
- Tight tracking on large headlines (`letter-spacing: -0.03em`)
- Generous leading on body (`1.7-1.9`)
- Typographic hierarchy must be obvious without colour
- Pair a display face (serif or distinctive sans) with a neutral body face

## Colour as Mood

- Start with ONE dominant hue + one neutral + one accent that creates tension
- Dark-mode-first for editorial/immersive/technical content
- Light-mode-first for natural/product-led/human content
- Colour must create atmosphere, not just decorate
- Strong directions: warm off-white + near-black + vivid accent; deep green + cream + copper; electric yellow + black brutalism

## Layout as Storytelling

- Think in planes, not boxes
- Break the grid intentionally at least once per section
- Overlap elements. Layer content over imagery. Let text bleed into space.
- Asymmetry creates tension. Centred layouts must earn their symmetry.
- Generous whitespace is a design element, not emptiness
- Full-viewport sections create rhythm and pacing

## Motion as Atmosphere

- Every animation serves: entrance (focus), feedback (response), transition (continuity), or atmosphere (presence)
- Custom easing: `cubic-bezier(0.16, 1, 0.3, 1)` for snappy reveals, `cubic-bezier(0.87, 0, 0.13, 1)` for considered transitions
- Stagger entrances for choreography
- Scroll-linked reveals (lift a curtain, don't bounce randomly)
- Respect `prefers-reduced-motion` always

## Hero Section

The hero is the brand. Must answer: who, what, why care — in under 3 seconds.
- Full-viewport or deliberately broken (85vh to imply more below)
- The headline is the largest element. No competition.
- One CTA. Not two. One.
- Movement earns attention (subtle parallax, text entrance)

## States (Minimal)

Websites need fewer states than apps:
| State | Required |
|-------|----------|
| Default (loaded) | Yes — this is 90% of the design |
| Loading | Yes — skeleton or progressive reveal |
| Error | Only for forms/interactive sections |
| Empty | Only if user-generated content exists |

## Performance

Beautiful and fast are not in conflict:
- `font-display: swap` on all web fonts, preload critical font
- `<picture>` with WebP/AVIF sources, `loading="lazy"` below fold
- Animations via `transform` and `opacity` only (no layout/paint triggers)
- Avoid heavy JS animation libraries when CSS achieves the same

## Anti-Patterns (Never Do These)

- Gradient hero + centred headline + subtitle + two buttons (template look)
- Feature grid of 3/6 icons with grey descriptions
- Testimonial carousel with star ratings
- `box-shadow: 0 4px 20px rgba(0,0,0,0.1)` on every card
- Purple/indigo gradient on white as "modern"
- Rounded pill buttons everywhere
- Hamburger menu on desktop
- Animations on every scroll event (nausea + performance)

## Output Format

Produce:
1. **Design rationale** (3-5 sentences): aesthetic direction, typeface decision, colour logic, key spatial/motion device
2. **UX section in design.md** with screens, interactions, responsive behaviour
3. **What to refine next**: 1-2 suggestions for what a human designer would polish

## Reference Standard

Study what Awwwards SOTD winners do with the first viewport — that's where character is established or lost.
