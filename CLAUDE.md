# CLAUDE.md

Guidance for Claude (or any AI assistant) working on the Premier Wellness Telehealth website. Read this before making changes.

---

## Project at a glance

- **Practice:** Premier Wellness Telehealth, LLC
- **Founder:** Lissette Moody, DNP, APRN-C
- **Model:** Solo-provider, cash-pay telehealth practice for adult/geriatric patients
- **States served:** **Florida, Arizona, Washington** (FL, AZ, WA). The original business plan said FL/VA — that is **outdated**. All marketing materials and the website use FL/AZ/WA. Do not reintroduce Virginia unless the user explicitly asks.
- **EMR:** SimplePractice (per the founder's startup guide)
- **Hours:** Tuesday – Thursday, 9:00 AM – 5:00 PM (other hours by appointment)
- **Contact:** premierwellnesstelehealthllc@gmail.com (to be replaced with a custom-domain email)

---

## CRITICAL: HIPAA boundary — do not cross it

**This website must not collect any Protected Health Information (PHI).** Ever. Anywhere.

The architecture is deliberate: the static marketing site is HIPAA-out-of-scope, and SimplePractice handles all patient-facing flows under their BAA. The moment the site collects a symptom, condition, intake answer, or appointment reason, it pulls the practice into HIPAA scope and requires HIPAA-compliant hosting, BAAs, audit logging, encryption, and breach response.

**Do NOT add to the site:**
- Patient intake forms
- "Describe your symptoms" or "reason for visit" fields
- Health-history questionnaires
- File uploads (insurance cards, lab results, photos)
- Chat widgets that ask about conditions
- Anything that stores or transmits patient health data

**OK to have:**
- A simple contact form that only collects name + generic email/phone + "I'd like to learn more" (no health detail)
- "Book Appointment" buttons that link OUT to SimplePractice's booking page
- A newsletter signup (marketing email only)

**If the user asks to add an intake form, payment, or symptom checker, push back.** Recommend doing it inside SimplePractice instead, where the BAA covers it. Only proceed if the user understands they are taking on HIPAA scope and has a hosting + BAA plan.

---

## Architecture (don't change without discussion)

```
Patient → Marketing site (static HTML) → "Book" button → SimplePractice
                                                          ├─ Booking
                                                          ├─ Intake forms
                                                          ├─ Payments (Stripe)
                                                          ├─ HIPAA video
                                                          ├─ Documentation
                                                          └─ Secure messaging
```

- **Static site only.** No backend, no database, no API routes. If a contributor proposes Next.js/server components/etc., default to "no" unless there's a real reason.
- **Single-file HTML** is the current state (`index.html`). Splitting into separate `.html`/`.css`/`.js` files is fine if the site grows beyond ~1500 lines. Don't introduce a build step (React, Vite, etc.) unless requested — the value of "open it in a browser and it works" is worth preserving for a non-technical owner.
- **Hosting:** Anything that serves static files works (Netlify, Vercel, Cloudflare Pages, GitHub Pages, or just dragging into Wix/Squarespace as embedded HTML). No HIPAA-compliant hosting needed *as long as the boundary above is respected*.

---

## Brand system

### Colors (CSS variables defined in `:root`)

| Token              | Hex       | Use                                          |
|--------------------|-----------|----------------------------------------------|
| `--navy`           | `#1F3A5F` | Primary text, headlines, nav                 |
| `--navy-deep`      | `#122845` | Footer, dark backgrounds, deepest accents    |
| `--navy-soft`      | `#2B4E7A` | Gradient pairs with `--navy`                 |
| `--gold`           | `#B08D3E` | CTAs, accents, italic emphasis words         |
| `--gold-soft`      | `#C9A95C` | Gold-on-dark text, decorative borders        |
| `--cream`          | `#FAF6EB` | Section backgrounds (services, about, FAQ)   |
| `--cream-warm`     | `#F3EEDF` | Card/icon backgrounds, callout boxes         |
| `--sage`           | `#8AA89A` | Available but use sparingly                  |
| `--ink`            | `#1A2330` | Body copy                                    |
| `--muted`          | `#5A6878` | Secondary copy, sub-text                     |
| `--line`           | `#E6DFCB` | Borders, dividers                            |

**Never introduce:** purple, pink, teal, or any rainbow/SaaS-style accent. Don't drift toward generic "wellness pastels." Stay navy + gold + cream.

### Typography

- **Display (serif):** Cormorant Garamond — used for all headlines, prices, founder name, logo wordmark
- **Body (sans):** Manrope — used for everything else
- **Italic gold accent words** in headlines are a signature pattern. Use sparingly: one italic word per headline, in `--gold`. Examples: "Telehealth care that *fits* your life", "Services & *transparent* pricing", "The Premier *difference*"
- **No Inter, Roboto, Arial.** Those make it look generic.

### Voice and copy rules

- **Warm, professional, plainspoken.** Not corporate, not clinical, not chirpy.
- **No medical claims or guarantees.** "Personalized care plans" ✓ — "cure your diabetes" ✗
- **Patient-centered language:** "we" and "you", not "our patients" in third person
- **Tagline:** "Compassionate Care. Personalized for You." (matches the logo)
- **Em dashes for asides** (—), not hyphens (-). Avoid the AI-tell of opening sentences with "In today's world..."
- When listing states, always: **Florida, Arizona, and Washington** (or FL, AZ, WA in compact contexts)

### The wave motif

The brand has a navy + gold wave that appears in the logo and at the bottom of the hero. It's a brand signature — use it as a section divider where appropriate, but don't overuse it (one or two waves per page max).

---

## Content: sources of truth

When asked to add or update content, these are the canonical sources:

| Topic                       | Source                                          |
|----------------------------|--------------------------------------------------|
| Service prices              | Wix mockup image: $95 / $85 / $85 / $65 / $125  |
| Membership tiers            | `PWTLLC_Membership.pdf` — Basic $35, Enhanced $49 |
| Hours                       | Google Business listing: Tue–Thu 9–5            |
| States served               | Marketing materials: FL, AZ, WA                  |
| Services offered            | Wix mockup + startup guide                       |
| Founder bio                 | Original business plan, Section 3                |
| FAQ answers                 | Composite of business plan + startup guide       |

**If a request conflicts with these sources** (e.g., "add Virginia to the states list"), confirm with the user before changing — it might be an oversight or it might be a real update.

---

## File structure

Currently:
```
index.html      # Single-file site with embedded CSS, JS, and base64 logo
```

If the project grows, prefer:
```
index.html
assets/
  logo.png
  styles.css
  scripts.js
  favicon.ico
```

**Don't:** add `package.json`, `node_modules`, or a build pipeline unless the user explicitly asks for it.

---

## Common tasks playbook

### Update a service price
1. Find the `.service-card` block in `index.html`
2. Change the `<div class="service-price">$95<small>/visit</small></div>` value
3. Update the FAQ if pricing language changes elsewhere

### Connect the real booking link
The current `openBook()` function shows a placeholder modal. To connect SimplePractice:
1. Get the SimplePractice booking widget URL from the practice's SimplePractice account
2. Either:
   - **Easy:** replace every `onclick="openBook()"` with `onclick="window.open('https://booking.simplepractice.com/...', '_blank')"`
   - **Better:** put the URL in a single JS constant at the top of `<script>` and rewrite `openBook()` to redirect there
3. Remove the modal markup (`#bookModal`) once unused

### Add a new section
- Use the existing `section { padding: 100px 0 }` rhythm
- Alternate backgrounds: `#fff`, `var(--cream)`, `#fff`, `var(--cream)`...
- Start with the eyebrow → section-title → section-sub pattern
- Use one italic gold accent word in the section title

### Add a new FAQ
Add a `<details class="faq-item">` inside `.faq-list`. Keep answers short — 1–3 sentences. Re-read the HIPAA boundary before drafting any answer that touches conditions or treatment.

### Update the states served
Three places to change:
1. The `.announce` bar at the top
2. The "What states do you serve?" FAQ
3. The footer "Serving FL, AZ, WA" line
4. The hero `<meta name="description">`

### Mobile considerations
- Breakpoints already in CSS: `980px` (tablet) and `560px` (phone)
- Test any new section at both breakpoints
- Service grid collapses 5 → 2 → 1 columns; "How It Works" steps collapse 4 → 2; plans go 2 → 1

---

## Things NOT to do

- ❌ Add patient intake or symptom collection (HIPAA — see top of file)
- ❌ Add Virginia to the service-area list without confirming
- ❌ Introduce purple/pink/teal accents
- ❌ Use Inter, Roboto, or system-default fonts
- ❌ Add testimonials, reviews, or before/after content with patient identifiers (HIPAA + healthcare-marketing rules)
- ❌ Make specific medical claims ("treats X", "cures Y")
- ❌ Introduce a build step (Vite/Next/etc.) without explicit ask
- ❌ Add tracking pixels (Meta, TikTok, etc.) without checking HIPAA — Google Analytics is OK only if configured to strip PHI and no PHI is on the page (which there isn't — keep it that way)
- ❌ Replace the brand logo or wordmark
- ❌ Use emojis in the design or copy (the brand voice is warm but not casual-emoji-warm)

---

## Pre-launch checklist (for the human owner)

These are the website-launch items still open:

- [ ] Buy domain (suggest: `premierwellnesstelehealth.com`)
- [ ] Set up Google Workspace email on the domain
- [ ] Replace the `mailto:` gmail address everywhere in `index.html`
- [ ] Get SimplePractice booking URL and connect it (see playbook above)
- [ ] Replace the `#` links for Privacy Policy, Terms, HIPAA Notice with real pages (templates exist — get a healthcare attorney to review)
- [ ] Add a real favicon (currently none)
- [ ] Add Open Graph image (for link previews on social)
- [ ] Test on iPhone Safari, Android Chrome, desktop Safari/Chrome/Firefox
- [ ] Set up the website on a real host
- [ ] Submit to Google Search Console; link to Google Business Profile
- [ ] One round of accessibility review (color contrast on gold-on-cream, alt text on icons)

---

## Open questions / decisions to make

- **Do we want a contact form?** A non-PHI form (name + email + free-text "what can we help with") is fine, but requires a form-handling service (Formspree, Basin, Netlify Forms). Currently we use a `mailto:` and a modal. Decide based on the owner's comfort with email.
- **Newsletter signup?** Could drive patient retention but requires a marketing-email tool (Mailchimp, ConvertKit). Defer until practice is established.
- **Blog/education content?** The business plan mentions educational content as a marketing strategy. Adding a `/blog` section is a real lift; consider only after launch.
- **Spanish version?** The founder is bilingual (the email and Florida market suggest this would help). Not in scope for v1, but worth flagging.
- **Insurance credentialing future state:** If/when the practice adds insurance, the "cash-pay" language across the site needs a sweep.

---

## How to talk to the owner about scope

The practice owner is a Nurse Practitioner, not a developer. When responding to requests:

- Translate technical decisions into business outcomes ("this means patients can book in two clicks" not "this triggers a synchronous redirect")
- Flag HIPAA implications **before** doing the work, not after
- If a request would require a backend or HIPAA scope, propose the SimplePractice alternative first
- Estimate effort in plain time terms ("15 minutes" / "an afternoon" / "this is a bigger project")
- Default to small, reversible changes

---

*Last updated: project handoff. Update this file when major decisions change.*
