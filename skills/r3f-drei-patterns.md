---
inclusion: manual
lastVerified: 2026-05-08
lastUsedInTask:
---

# React Three Fiber & Drei Patterns

## Canvas Setup

```tsx
<Canvas
  camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}
  dpr={[1, 2]}
  gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
  shadows
  frameloop="always" // 'demand' | 'never'
>
  <Scene />
</Canvas>
```

## useFrame — Animation Loop

```tsx
function Spinner({ speed = 1 }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * speed
    // state.camera, state.clock, state.pointer available
  })
  return <mesh ref={ref}><boxGeometry /><meshStandardMaterial /></mesh>
}
// Priority >= 1 disables auto-render — you call gl.render yourself
useFrame(({ gl, scene, camera }) => gl.render(scene, camera), 1)
```

## useThree — Access State

```tsx
const camera = useThree((s) => s.camera)       // selective = no extra re-renders
const { width, height } = useThree((s) => s.viewport) // three.js units
const gl = useThree((s) => s.gl)
const invalidate = useThree((s) => s.invalidate) // request frame in 'demand' mode
```

## Scroll-Driven Camera Rig

```tsx
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'

<Canvas>
  <ScrollControls pages={3} damping={0.25}>
    <CameraRig />
    <Scroll>{/* 3D content */}</Scroll>
    <Scroll html>{/* DOM overlay */}</Scroll>
  </ScrollControls>
</Canvas>

function CameraRig() {
  const scroll = useScroll()
  useFrame(({ camera }) => {
    camera.position.z = 5 - scroll.offset * 4  // offset: 0–1
    // scroll.range(from, dist): 0–1 within segment
    // scroll.curve(from, dist): 0–1–0 bell
    // scroll.visible(from, dist): boolean
  })
  return null
}
```

## Instanced Rendering

```tsx
import { Instances, Instance } from '@react-three/drei'

function Particles({ count = 1000 }) {
  const positions = useMemo(() =>
    Array.from({ length: count }, () => [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
    ] as [number, number, number]), [count])
  return (
    <Instances limit={count}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial />
      {positions.map((pos, i) => <Instance key={i} position={pos} />)}
    </Instances>
  )
}
```

## drei Helpers

```tsx
// Float — gentle hover animation
<Float speed={1} rotationIntensity={1} floatIntensity={1} floatingRange={[-0.1, 0.1]}>
  <mesh />
</Float>

// Html — DOM in 3D space
<Html center transform distanceFactor={10}><div>Label</div></Html>

// Stars — starfield background
<Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

// Text — SDF text
<Text fontSize={1} color="white" anchorX="center" anchorY="middle">Hello</Text>

// useProgress — loading state
const { progress, active } = useProgress()

// Preload — eagerly load all useLoader assets
<Canvas><Preload all /></Canvas>
```

## Event System

```tsx
<mesh
  onClick={(e) => { e.stopPropagation(); /* click */ }}
  onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
  onPointerOut={() => { document.body.style.cursor = 'auto' }}
>
  <boxGeometry />
  <meshStandardMaterial />
</mesh>
// e.object, e.point, e.distance, e.ray, e.camera, e.delta
// stopPropagation blocks events to objects behind
```

## Performance Patterns

```tsx
// Reuse geometry/material outside component or via useMemo
const geo = useMemo(() => new THREE.SphereGeometry(1, 32, 32), [])

// Dispose on unmount
useEffect(() => () => { geo.dispose() }, [])

// Conditional rendering — unmount invisible heavy components
{visible && <HeavyModel />}

// On-demand rendering for mostly-static scenes
<Canvas frameloop="demand">

// Prevent auto-dispose on shared GLTF scenes
<primitive object={scene} dispose={null} />
```
