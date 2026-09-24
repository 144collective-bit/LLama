# SynapseX

Single-page landing site for SynapseX, a neural-AI interface.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS 3**: every `fontFamily` key resolves to Space Mono
- **Framer Motion** for entrance, scroll and hover animation

## Getting started

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build
npm run preview  # serve the production build
```

## Structure

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Entrance timer and section order |
| `src/videos.ts` | CloudFront URLs for the five background videos |
| `src/components/Navbar.tsx` | Fixed navbar: expanding menu pill, desktop and mobile variants |
| `src/components/ScrambleIn.tsx` | Left-to-right scramble reveal used by the hero headings |
| `src/components/ScrambleText.tsx` | Hover scramble for nav links and the Download button |
| `src/components/SquashHamburger.tsx` | Three-bar hamburger that springs into an X |
| `src/components/SynapseXLogo.tsx` | Four-fold rotational SVG mark |
| `src/sections/Hero.tsx` | Mouse-scrubbed hero video and headline |
| `src/sections/Cinematic.tsx` | Scroll-driven 3D text over video |
| `src/sections/*.tsx` | Metrics, Technology, Architecture, Footer |

## Notes

- The hero video never plays. Horizontal mouse movement moves its playhead by
  the same fraction of its length (× 0.8). Seeks are chained through the
  `seeked` event, so only one is in flight and each lands on the latest target.
  Touch devices have no mouse movement, so on phones the hero shows the first frame.
- Full-height sections use `h-screen` with `supports-[height:100dvh]:h-[100dvh]`.
  A bare `h-[100dvh]` would lose to `h-screen`, which Tailwind emits later.
