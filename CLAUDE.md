# ProgressAI website

Single-file marketing site for **ProgressAI** — AI consulting for HVAC companies. Styled to match the Clarion Framer template (https://bulky-position-212226.framer.app/).

## Files & structure

- `index.html` — English site at `/`. `fr/index.html` — French site at `/fr/`.
- `styles.css` + `app.js` — **shared** CSS and JS, linked with ABSOLUTE paths (`/styles.css`, `/app.js`) by BOTH language pages. Edit these once and both languages update. (These used to be inline in index.html; extracted in the 2026 bilingual build.)
- `thank-you.html` — form success page (English; both language forms redirect here).
- `progressai_logo_hd.png` — current logo. `progressai_logo.png`, `progressai_logo_full.png` — backups. In `fr/index.html` the logo `src` is absolute (`/progressai_logo_hd.png`) so it resolves from the `/fr/` path.

**Bilingual (real, EN-first):** English at `/` is the default with NO browser/IP auto-redirect. French at `/fr/` is a genuine translated page (Quebec French, "vous"). The EN/FR toggle (`#langToggle`) is a plain `<a>` link between the two routes, visible on both. hreflang + canonical set per page. **Any content change must be made in BOTH `index.html` and `fr/index.html`.**

## Deploy & contact form (decided)

- **One Netlify site only: `legendary-paletas-5e2fb7.netlify.app`.** Always deploy the WHOLE folder to that same site (its Deploys tab), never drag onto "add new site" — that spawns random new sites (an old `scintillating-conkies` one exists and should be deleted). `netlify.toml` sets `publish = "."` so every file (incl. `thank-you.html`, logos) ships.
- **The contact form uses FormSubmit, not Netlify Forms.** It POSTs to `https://formsubmit.co/Samuelprogressai@gmail.com`, which emails the lead and redirects to `thank-you.html` via the hidden `_next` field (absolute URL → update it if the domain changes). Hidden fields: `_subject`, `_template=table`, `_captcha=false`, `_honey` (honeypot). FormSubmit requires a one-time activation-email click on the first real submission.
- **The form is a 6-step flow** (`form.step-form`, one `fieldset.step` per question): biggest challenge, team size, software, assessment, contact details, optional note. Steps 1-4 are tap-card radios that auto-advance. Without JS all steps show as one long form. Logic lives in `app.js`; pricing buttons with `data-pick="free|full|custom"` pre-select the assessment step. Questions are the same in EN and FR; change both.
- Local preview can't POST cross-origin to FormSubmit, so a JS submit handler (in the inline script) intercepts on `localhost` and just navigates to `thank-you.html` (no email sent locally). It does nothing in production.

## Run locally

```sh
cd ~/Desktop/progressai
python3 -m http.server 3000
# then open http://localhost:3000
```

## Design system

CSS custom properties live in `:root` at the top of the `<style>` block in `index.html`. Single source of truth — change values there and they propagate.

- Background: `#FFFFFF` (`--bg`), soft alt: `#F7F6F5` (`--bg-soft`)
- Text: near-black `#0A0E14` (`--ink`), soft: `#69645E`, faint: `#A39E97`
- Accent blue: `#2D6FF0` (`--blue`), deep `#1A5BD9`, tint `#E8EFFE`
- Lines: `#EDEBE8` (`--line`), softer `#F4F2EF`
- Radii: `--radius: 20px`, `--radius-lg: 32px`. Buttons use `12px` (rectangular with soft corners).
- Fonts: **Headland One** (serif, headings) + **Geist** (sans, body) via Google Fonts.

Dark sections (stat strip, final CTA) use pure `#0A0E14` — not warm brown.

## Offer & positioning (current, Nov 2026)

ProgressAI is an **AI partner for small HVAC shops**. Consulting, not software: no custom code. Ladder: free first look, then a $500 assessment that finds the main bottleneck, then an optional monthly partnership where we rebuild one bottleneck at a time with AI (written procedures, Claude Skills the team uses, features turned on in tools they already have, training) and measure the result. HVAC-only. **Rules:** no founder photo/name/bio, no fabricated testimonials/reviews/client results, no em dashes, never "done for you" or "our solutions", no tool vendor names or their prices (field-software names in the form options are OK), no turnaround for the paid assessment (only the free look's "usually around five business days"). Name is always "ProgressAI" (no space). Service area: Quebec and Ontario.

**Pricing = 4 cards** (`.tiers`, 4 columns desktop, 2 under 980px, 1 under 560px), in order (smallest to largest): Free First Look $0 ("Start here"), Full Assessment $500 (`.tier.popular`, "Most popular" / "Le plus choisi", includes a 30-day check-in), Monthly partnership (`#partnership`, $1,000/month, $750/month first 3 months after the assessment, 3-month minimum), Custom (from ~$1,500). Prices CAD, taxes extra. FR prices use "1 000 $" format. How it works has 4 steps plus an optional 5th (`.step-optional`, full width) for the partnership.

**Config constants** live at the top of the inline `<script>`: `TALLY_FORM_URL` (still a placeholder `REPLACE_ME` — swap for the real Tally intake link; all `[data-cta="tally"]` buttons + the Process step-1 link auto-wire to it with a `?tier=` param) and `AUDIT_TURNAROUND_DAYS`.

**Language:** see "Files & structure" — real bilingual, EN at `/`, FR at `/fr/`, toggle is a link. No `data-fr` runtime swap anymore.

## Section order (do not reorder without asking)

1. Sticky transparent nav (gains `bg + shadow` on scroll via `.nav.scrolled`)
2. Hero (SPLIT layout: `.hero-split` copy left, audit-mockup visual right; stacks on mobile. No star rating.)
3. Stat strip (dark; **real numbers are in the HTML source**, count-up is progressive enhancement)
4. Services ("What we check" — audit findings, not services)
5. Missed-call before/after (`#missed-call`, inline SVGs)
6. Process (4 steps, Tally intake)
7. Who this helps
8. Why choose us
9. Sample audit preview (`#sample` — "Sample HVAC Co", main trust element)
10. Pricing (3-tier ladder + guarantee bar) → Done-for-you (`#done-for-you`)
11. FAQ (accordion)
12. Final CTA (dark, contact form to FormSubmit)
13. Footer

All "Book a Free Strategy Call" buttons link to `#book`.

## Nav layout note

The nav is `.nav-inner` flex with three children: logo, `.nav-links`, `.nav-cta-wrap`. `.nav-links` uses `margin: 0 auto 0 48px` so the menu sits 48px to the right of the logo and the CTA is pushed to the far right by the `auto` right margin. **Do not** revert to `justify-content: space-between` distribution — it creates a stretched gap between logo and menu.

Nav sizing: `.nav-inner { min-height: 88px; padding: 12px 0; overflow: visible; }`. Logo img `max-height: 60px` in nav, `28px` in footer. Hero `padding-top: calc(88px + clamp(60px, 9vw, 120px))` must stay in sync with the nav height. Mobile drawer `inset: 88px 0 0 0` likewise.

## Bilingual (FR / EN) — SUPERSEDED

> Note: the full `data-fr` bilingual system described below was **removed** in the 2026 content overhaul. The site is now English-first with a FR stub (see "Offer & positioning" above). This section is kept only as a reference for how to rebuild French later.

The site had a client-side language toggle (FR | EN) in the nav, right of the `.nav-links` inside `.nav-cta-wrap`.

- **English is the source of truth in the HTML.** French is added as a `data-fr="…"` attribute on each translatable element (and `data-fr-ph="…"` for the one textarea placeholder). The inline i18n script captures the original English into `data-en` on load, then swaps `innerHTML` on toggle. Page still renders full English with JS off.
- **`data-fr` must be PLAIN TEXT only — never HTML markup.** Netlify's HTML post-processing/minification mangles nested-quote markup inside attributes (it broke the thank-you button: `→' href='/'>…`). So when a heading/button has inline markup (arrow `<span class="arr">`, accent span, `<em>`, the `(optional)` `.opt` span), wrap each translatable text run in its own child element that carries a plain-text `data-fr`, and leave the markup elements as real siblings. Example: `<a ...><span data-fr="Réserver…">Book a Free Strategy Call</span> <span class="arr">→</span></a>`. Entities like `&#160;` are fine in `data-fr`; `<`, `>`, and quotes are not.
- `<title>` + meta description are swapped via the `META` object in the script (not data attributes).
- Stat count-ups: French formatting via `data-prefix-fr` / `data-suffix-fr` and `fr-CA` locale (e.g. `$50,000` → `50 000 $`, `40%` → `40 %`). Don't remove these.
- Choice persists to `localStorage['pai-lang']`; first visit falls back to `navigator.language`. `thank-you.html` reads the same key and translates itself.
- HVAC is translated as **CVC** (Canadian French; site is progressai.ca). When adding/changing copy, add a matching `data-fr` or the new text will only show in English.

## Animations

- IntersectionObserver scroll-reveal fade-up (staggered)
- Count-up stat numbers (triggered on intersect)
- Infinite horizontal ticker
- Hover lifts on cards, animated nav underline, arrow nudge on buttons
- All respect `prefers-reduced-motion`

## Style guardrails (from prior user feedback)

- **No cream / beige.** Off-white is `#F7F6F5` only, used sparingly.
- **No warm brown for text or dark backgrounds.** Headers stay near-black; dark sections stay `#0A0E14`.
- **Buttons stay rectangular** with `12px` radius — not pill-shaped.
- Mobile responsive; headings must never clip.
- **No "AI template" tells** (removed Nov 2026, don't reintroduce): no italic blue accent words inside headings (only the hero's last line is blue, upright), no section eyebrow labels with a dash in front (only the hero keeps an eyebrow), no "01 / LOOK" or "FOR" card labels. Heading line-height stays at 1.14+ (Headland One's descenders and ascenders collide below that). Use curly apostrophes (’) in headings.
- Two-color "ProgressAI" wordmark was tried and removed — the logo image carries the brand now, no separate text span.

## When changing the site

- Edit `index.html` directly. Keep it a single file.
- Match existing patterns rather than refactoring.
- Don't change copy, colors, fonts, or section order unless asked.
- Logo file is `progressai_logo_hd.png`. If swapping, keep the same filename or update both nav and footer `<img src>`.
