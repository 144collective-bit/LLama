# LLama

Site for LLama ($LLAMA), a community meme coin on PulseChain.

| URL | Page |
| --- | --- |
| `/` | LLamaswap.pro swap (the opening page; `/swap` also works) |
| `/token` | The $LLAMA landing page: hero, lore, tokenomics, socials, roadmap |
| `/buy` | How to Buy |

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS 3**: every `fontFamily` key resolves to Space Mono
- **Framer Motion** for entrance, scroll and hover animation
- **wagmi + viem** for PulseX contract calls, **Reown AppKit** for wallet connection

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
| `src/pages/SwapPage.tsx` | The LLamaswap.pro swap at `/` |
| `src/swap/` | Swap network config, token list, router checks, quotes, execution, picker, settings |
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

## The swap

The swap page trades for real, straight from the visitor's own wallet
through PulseX's contracts. The site never holds funds.

- **Quotes** are live `getAmountsOut` calls to both PulseX routers (V1 and
  V2), direct and via WPLS; the best is used (`src/swap/quote.ts`).
- **Before anything is quoted,** each router is checked on-chain: it must be a
  contract, report the configured factory and wrap the configured WPLS
  (`src/swap/router.ts`). A router that fails is dropped; if both fail, swaps
  are blocked and the page says why.
- **Every transaction is simulated first** (`src/swap/execute.ts`). If the
  simulation fails (price moved past slippage, wrong function, anything)
  nothing is sent.
- **Approvals are for the exact amount**, never unlimited.
- The gas limit is set to the estimate plus 50%, so a swap can't run out of
  gas. Unused gas is never charged.
- Trades with price impact of 15% or more are refused.

### Wallets (Reown AppKit)

"Connect wallet" opens Reown AppKit (`src/swap/wagmi.ts`): browser extensions
are detected automatically (Rabby, MetaMask, Internet Money, Trust, …), and
WalletConnect covers phones: a QR code on desktop, one-tap links into wallet
apps on mobile. MetaMask and Trust are pinned at the top. Email/social
logins, AppKit's own swap/on-ramp/send screens and analytics are switched off.

- **Project ID:** `b630de806fe35c2ba6e6a52d321e0130` (public by design),
  overridable with `VITE_REOWN_PROJECT_ID`; set it to an empty string to fall
  back to browser-extension wallets only.
- **Allowed domains:** WalletConnect only works on domains listed for the
  project at https://dashboard.reown.com (llamaswap.pro, www.llamaswap.pro,
  the Vercel address).
- **Pin more wallets:** add their WalletConnect directory IDs to
  `FEATURED_WALLETS` in `src/swap/wagmi.ts`.
- The wallet code is heavy (~520 KB compressed), so the swap page loads it as
  its own chunk; the token and How to Buy pages never download it.
- `.npmrc` sets `legacy-peer-deps`: optional add-ons of wagmi pull in
  libraries whose peer versions clash; nothing we use is affected.

### Going live: verify, then switch on

Swaps are **off** until `ADDRESSES_VERIFIED` in `src/swap/network.ts` is set
to `true`. Before flipping it, check every address on
https://scan.pulsechain.com:

| What | Where | Address |
| --- | --- | --- |
| PulseX V2 router | `network.ts` | `0x165C3410fC91EF562C50559f7d2289fEbed552d9` |
| PulseX V2 factory | `network.ts` | `0x29eA7545DEf87022BAdc76323F373EA1e707C523` |
| PulseX V1 router | `network.ts` | `0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02` |
| PulseX V1 factory | `network.ts` | `0x1715a3E4A142d8b698131108995174F37aEBA10D` |
| WPLS | `network.ts` | `0xA1077a294dDE1B09bB078844df40758a5D0f9a27` |
| PLSX | `tokens.ts` | `0x95B303987A60C71504D99Aa1b13B4DA07b0790ab` |
| HEX | `tokens.ts` | `0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39` |
| INC | `tokens.ts` | `0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d` |
| DAI (from Ethereum) | `tokens.ts` | `0xefD766cCb38EaF1dfd701853BFCe31359239F305` |
| USDC (from Ethereum) | `tokens.ts` | `0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07` |

Then make one **small** swap yourself before telling anyone.

$LLAMA appears in the token list as "Not live yet" until `live` is `true` in
`src/token.ts` (with the real contract address).

### Token logos

`public/tokens/` holds logos from the Piteas PulseChain token list
(https://github.com/piteasio/app-tokens, `token-logo/<address>.png`); PLS uses
the WPLS image, which is the PulseChain mark.
Each logo belongs to its project and is used only to identify the token. To
add one, drop the image in `public/tokens/` and set `logo` on the token in
`src/swap/tokens.ts`; a token without one shows a coloured initial.

### Testing on a testnet or local chain

`VITE_SWAP_NETWORK` replaces the whole network config with JSON of the same
shape as `PULSECHAIN_MAINNET` in `network.ts` (chain id, RPC, WPLS, routers,
token addresses, `swapsEnabled`). Leave it unset for the real site.

## Notes

- `vercel.json` rewrites every path to `index.html` so `/token` and `/buy`
  load on a refresh or direct link.

- The hero video never plays. Horizontal mouse movement moves its playhead by
  the same fraction of its length (× 0.8). Seeks are chained through the
  `seeked` event, so only one is in flight and each lands on the latest target.
  Touch devices have no mouse movement, so on phones the hero shows the first frame.
- Full-height sections use `h-screen` with `supports-[height:100dvh]:h-[100dvh]`.
  A bare `h-[100dvh]` would lose to `h-screen`, which Tailwind emits later.
