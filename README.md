# LLama

Site for LLama ($LLAMA), a community meme coin on PulseChain: a landing page
plus a How to Buy page at `/buy`.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS 3**: every `fontFamily` key resolves to Space Mono
- **Framer Motion** for entrance, scroll and hover animation

## Getting started

```bash
npm install
npm run dev      # dev server on http://localhost:5180
npm run build    # type-check + production build
npm run preview  # serve the production build on http://localhost:5181
```

## Structure

| Path | Purpose |
| --- | --- |
| `src/token.ts` | **Coin details: contract address, tax, socials, PulseChain settings** |
| `src/App.tsx` | Entrance timer, page switch and section order |
| `src/router.ts` | Minimal pushState routing for `/` and `/buy` |
| `src/pages/BuyPage.tsx` | How to Buy: contract card, four steps, network settings |
| `src/videos.ts` | CloudFront URLs for the five background videos |
| `src/components/Navbar.tsx` | Fixed navbar: expanding menu pill, desktop and mobile variants |
| `src/components/ScrambleIn.tsx` | Left-to-right scramble reveal used by the hero headings |
| `src/components/ScrambleText.tsx` | Hover scramble for nav links and the Buy button |
| `src/components/SquashHamburger.tsx` | Three-bar hamburger that springs into an X |
| `src/components/Logo.tsx` | Four-fold rotational SVG mark |
| `src/sections/Hero.tsx` | Mouse-scrubbed hero video and headline |
| `src/sections/Cinematic.tsx` | Scroll-driven 3D text over video |
| `src/sections/*.tsx` | Tokenomics, How to Buy steps, Roadmap, Footer |

## Before launch

Everything factual about the coin lives in `src/token.ts`. The contract address
there is a **placeholder**: while `live` is `false` the Buy page labels it as
one, disables its copy button, and PulseX and the explorer are linked without
it. At launch, paste the real address and set `live: true`.

The X and Telegram buttons in the footer point at `@PulsechainLLama`.

## Notes

- `vercel.json` rewrites every path to `index.html` so `/buy` loads on a
  refresh or direct link.

- The hero video never plays. Horizontal mouse movement moves its playhead by
  the same fraction of its length (× 0.8). Seeks are chained through the
  `seeked` event, so only one is in flight and each lands on the latest target.
  Touch devices have no mouse movement, so on phones the hero shows the first frame.
- Full-height sections use `h-screen` with `supports-[height:100dvh]:h-[100dvh]`.
  A bare `h-[100dvh]` would lose to `h-screen`, which Tailwind emits later.
