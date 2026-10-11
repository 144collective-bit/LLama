# LLama

Site for LLama ($LLAMA), a community meme coin on PulseChain.

| URL | Page |
| --- | --- |
| `/` | LLamaswap.pro swap preview (the opening page; `/swap` also works) |
| `/token` | The $LLAMA landing page: hero, lore, tokenomics, socials, roadmap |
| `/buy` | How to Buy |

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
| `src/router.ts` | Minimal pushState routing; `ROUTES` lists the page URLs |
| `src/pages/BuyPage.tsx` | How to Buy: contract card, four steps, network settings |
| `src/pages/SwapPage.tsx` | LLamaswap.pro swap preview at `/` (not connected) |
| `src/swap/` | Swap token list, quote function, token picker, settings popover |
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

The X and Telegram links (footer and the Join The Herd section) point at `@PulseLLama`.

## Connecting the swap

The swap page is a working interface with no wallet or chain behind it. To go live:

1. **Quotes:** replace the body of `getQuote` in `src/swap/quote.ts` with a
   router call (e.g. `getAmountsOut`) and real USD prices. The page only
   depends on its signature, and it currently returns made-up numbers.
2. **Tokens:** fill the empty addresses in `src/swap/tokens.ts` and add
   real logos in `src/swap/TokenLogo.tsx`.
3. **Wallet:** the button only shows a "preview" notice. Wire it to a
   wallet library (e.g. wagmi + viem) to connect, show balances, approve and
   swap.
4. Remove the "Preview · not connected" badge and the placeholder note.

## Notes

- `vercel.json` rewrites every path to `index.html` so `/token` and `/buy`
  load on a refresh or direct link.

- The hero video never plays. Horizontal mouse movement moves its playhead by
  the same fraction of its length (× 0.8). Seeks are chained through the
  `seeked` event, so only one is in flight and each lands on the latest target.
  Touch devices have no mouse movement, so on phones the hero shows the first frame.
- Full-height sections use `h-screen` with `supports-[height:100dvh]:h-[100dvh]`.
  A bare `h-[100dvh]` would lose to `h-screen`, which Tailwind emits later.
