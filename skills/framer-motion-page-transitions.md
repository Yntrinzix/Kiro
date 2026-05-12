---
inclusion: manual
lastVerified: 2026-05-08
lastUsedInTask:
---

# Motion — Page Transitions in Next.js App Router

Package: `motion/react` (v12+). All imports from `"motion/react"`.

## AnimatePresence Modes

```tsx
// mode="wait" — exit completes before enter (use for page transitions)
// mode="sync" — simultaneous enter/exit (default)
// mode="popLayout" — exiting element pops out of flow
<AnimatePresence mode="wait" initial={false}>
  <motion.div key={pathname}>{children}</motion.div>
</AnimatePresence>
```

## Next.js App Router — template.tsx

```tsx
"use client"
import { AnimatePresence, motion } from "motion/react"
import { usePathname } from "next/navigation"

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

> Use `template.tsx` not `layout.tsx` — templates re-mount on navigation, triggering key changes.

## Shared Element Transitions (layoutId)

```tsx
// List page                              // Detail page
<motion.div layoutId={`card-${id}`} />    <motion.div layoutId={`card-${id}`} />
```

Motion auto-animates between matching `layoutId` elements across routes.

## Staggered Children

```tsx
import { stagger } from "motion/react"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { delayChildren: stagger(0.08) } },
}
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map((i) => <motion.li key={i.id} variants={item} />)}
</motion.ul>
```

## Scroll-Triggered (useInView / whileInView)

```tsx
// Hook approach
const ref = useRef(null)
const isInView = useInView(ref, { once: true, margin: "-100px" })
<motion.div ref={ref} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} />

// Declarative approach
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true, margin: "-100px" }}
/>
```

## Easing Reference

| Preset | Use |
|--------|-----|
| `"easeIn"` | Exit animations |
| `"easeOut"` | Enter animations |
| `"easeInOut"` | General |
| `"circOut"` | Snappy enter |
| `"backOut"` | Overshoot |
| `[0.4, 0, 0.2, 1]` | Material standard |
| `[0.22, 1, 0.36, 1]` | Apple smooth |

## Performance

- **GPU-only props**: `opacity`, `x`, `y`, `scale`, `rotate` (all use `transform`)
- Avoid animating `width`/`height`/`top`/`left` — use `layout` prop instead
- `will-change: "transform"` on frequently-animated elements
- Keep exit animations ≤250ms to avoid blocking navigation
- Motion layout animations use `transform: scale()` internally — zero layout thrash
