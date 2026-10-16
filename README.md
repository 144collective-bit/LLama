# LLama

Site for LLama ($LLAMA), a community meme coin on PulseChain.

The site is a single page: the LLamaswap.pro exchange at `/`. Any other path
(including the old `/token`, `/buy` and `/swap` links) lands on it.

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
| `src/App.tsx` | Entrance timer, navbar, the swap page and footer |
| `src/router.ts` | `ROUTES`: the one page, `/` |
| `src/pages/SwapPage.tsx` | The LLamaswap.pro swap at `/` |
| `src/swap/` | Swap network config, token list, router checks, quotes, execution, picker, settings |
| `src/videos.ts` | CloudFront URL of the footer video |
| `src/components/Navbar.tsx` | Fixed navbar: logo and wallet button, desktop and mobile variants |
| `src/components/Logo.tsx` | Four-fold rotational SVG mark |
| `src/sections/Footer.tsx` | Footer: video, short description, PulseX/explorer/bridge links, disclaimer |

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
apps on mobile. The menu lists MetaMask, Trust Wallet, OKX Wallet and
Internet Money, plus any wallet already installed in the visitor's browser
(e.g. Rabby); AppKit's "All wallets" list and its generic desktop
"WalletConnect · QR code" row are hidden (the listed wallets still show
their own QR code). Email/social logins,
AppKit's own swap/on-ramp/send screens and analytics are switched off.

- **Project ID:** `b630de806fe35c2ba6e6a52d321e0130` (public by design),
  overridable with `VITE_REOWN_PROJECT_ID`; set it to an empty string to fall
  back to browser-extension wallets only.
- **Allowed domains:** WalletConnect only works on domains listed for the
  project at https://dashboard.reown.com (llamaswap.pro, www.llamaswap.pro).
- **Change the listed wallets:** edit the WalletConnect directory IDs in
  `FEATURED_WALLETS` in `src/swap/wagmi.ts`. AppKit shows at most four.
- The wallet code is heavy (~520 KB compressed), so the swap page loads it as
  its own chunk, loaded after the navbar and footer.
- `.npmrc` sets `legacy-peer-deps`: optional add-ons of wagmi pull in
  libraries whose peer versions clash; nothing we use is affected.

### Going live: verify, then switch on

Swaps are **on**: `ADDRESSES_VERIFIED` in `src/swap/network.ts` was set to
`true` on 2026-10-11 after the owner checked the router and factory addresses
on https://scan.pulsechain.com and the token addresses matched the Piteas list.
If any address changes, set it back to `false` and re-check:

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

The picker lists every token on the Piteas PulseChain token list
(https://github.com/piteasio/app-tokens). `src/swap/tokenlist.json` is a
checked snapshot of it (addresses checksummed, no duplicates), and
`public/tokens/<address>.webp` holds each token's logo resized to 64 px; PLS
uses the WPLS image, which is the PulseChain mark. Each logo belongs to its
project and is used only to identify the token; a token without one shows a
coloured initial. The main tokens (WPLS, PLSX, HEX, INC, DAI, USDC) are listed
first and matched by address, because copies with the same symbols exist.

Visitors can trade any other token by pasting its contract address: the
picker reads its symbol, name and decimals from the chain and shows a warning
before it can be used. Imported tokens are remembered in that browser only.

Swaps are routed directly or through WPLS, PLSX, HEX or DAI (and WPLS + PLSX
together), across both PulseX routers, and the best payout wins.

### Testing on a testnet or local chain

`VITE_SWAP_NETWORK` replaces the whole network config with JSON of the same
shape as `PULSECHAIN_MAINNET` in `network.ts` (chain id, RPC, WPLS, routers,
token addresses, `swapsEnabled`). Leave it unset for the real site.

## Security

- **Swaps** are simulated before the wallet is asked to sign, approvals are
  for the exact amount (never unlimited), the receiver is always the
  connected wallet, slippage is capped at 50% (warning from 5%), trades over
  15% price impact are blocked, and a swap is only sent for the quote shown
  on screen. The PulseX routers are checked on-chain before any quote.
- **Imported tokens** need an explicit confirmation, with an extra warning
  when one copies a listed token's symbol or uses look-alike characters.
- **Headers** (`public/.htaccess`): a Content-Security-Policy allowing scripts
  only from this site and network calls only to the PulseChain RPC and
  WalletConnect/Reown; the page can't be framed (clickjacking); HSTS,
  nosniff, a strict referrer policy and a restrictive Permissions-Policy.
  If you add a new external service (RPC, API, video host), add it to the
  policy or the browser will block it.
- **No third-party code or styles at runtime:** fonts and icons are bundled.
  Coinbase/Base Account connectors are off (they send analytics to Coinbase).
- **Build:** the GitHub Action is pinned to exact action commits and installs
  dependencies with `--ignore-scripts`. `npm audit --omit=dev` is clean; the
  remaining advisories are in build tools (Vite, Tailwind) only.

## Notes

- `public/.htaccess` sends every path to `index.html`, so old or mistyped links
  still open the exchange (Hostinger runs LiteSpeed, which reads it). The site has to be built
  (`npm run build`); the host serves the contents of `dist/`, not the source.
- Hostinger deploys from the `hostinger` branch, which holds only the built
  site. `.github/workflows/hostinger.yml` rebuilds it on every push to `main`
  (Actions tab → "Build for Hostinger"); then redeploy in hPanel → Git.
  Never edit the `hostinger` branch by hand.

