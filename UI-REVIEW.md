# SnapLink — UI Review

**Audited:** 2026-03-31
**Baseline:** Abstract 6-pillar standards (no UI-SPEC.md present)
**Screenshots:** Not captured (dev server on port 3000 returned 307 redirect — auth wall, no visual capture possible)
**Scope:** Dashboard layout, Links, Analytics, Settings, Landing page, Login page, shared modals

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Visual Hierarchy & Layout | 3/4 | Strong bento grid, but persistent dummy skeleton row always renders |
| 2. Color & Contrast | 3/4 | Coherent dark palette; ACTIVE badge color (#fe81a4 on #5a0027) is legible but semantically confusing |
| 3. Typography | 3/4 | Clean scale, but 9 distinct size steps used and `font-black` is overused in headings |
| 4. Component Consistency | 2/4 | Mixed inline-style vs Tailwind approach across files; 53 arbitrary spacing values; border-radius is inconsistent |
| 5. Motion & Feedback | 2/4 | Loading skeletons exist but no toast system; destructive confirm() dialogs; CTR column permanently shows "—" |
| 6. Mobile & Responsiveness | 1/4 | Dashboard sidebar has zero mobile handling — no toggle, no drawer, no bottom nav |

**Overall: 14/24**

---

## Top 3 Priority Fixes

1. **Dashboard has no mobile layout** — On any viewport under ~900px the 220px sidebar permanently occupies left space, the main area overflows, and there is no way to dismiss or collapse the sidebar. A user on a phone or small tablet cannot use the product. Fix: add a hamburger toggle that slides the sidebar off-canvas at `md:` breakpoint, or replace with a bottom nav for mobile.

2. **No toast notification system — all feedback is via browser `confirm()` or silent** — Delete, purge, and API key regeneration use `window.confirm()` (a browser-chrome modal that cannot be styled or localized). Successful actions like copy and link creation are confirmed only through icon swap, with no app-level feedback. Fix: install a lightweight toast library (e.g. `sonner`) and replace all `confirm()` calls with a styled inline confirmation UI, while adding success toasts for create, copy, and delete.

3. **Permanent dead "CTR" column in dashboard link rows** — `DashboardClient.tsx` line 296–297 renders a "CTR" column header with a hard-coded `"—"` value on every row, forever. This exposes an unfinished metric and erodes data credibility. Fix: either remove the CTR column until the metric is implemented, or replace it with a real computed value from the analytics API.

---

## Detailed Findings

### Pillar 1: Visual Hierarchy & Layout (3/4)

**What is working:**
- The bento grid on the dashboard overview (`DashboardClient.tsx` line 160) with a 2-col "Total Engagement" span is a strong focal point. The hero stat in 7xl (`text-7xl tracking-[-3.6px]`) is visually dominant and intentional.
- Consistent page padding of `p-8` with `max-w-[1100px]` across all four dashboard pages creates a comfortable reading column.
- The analytics page correctly uses `col-span-2` for the bar chart and a narrower right panel, matching typical dashboard content hierarchy.
- The sidebar active-item indicator (left 4px border `bg-[#bd9dff]`) is a clean, low-noise way to signal navigation state.
- Section headers use a two-line pattern (large heading + subdued body copy) consistently throughout.

**Issues:**

- **Permanent static skeleton row** (`DashboardClient.tsx` line 334–349): A full-opacity-40 skeleton placeholder row is rendered unconditionally below the real link list, even when data has loaded. It is not part of the loading skeleton (which correctly animates at lines 256–262). This ghost row will confuse users into thinking there is a broken entry, or that one more link exists. It appears to be a design artifact left in by mistake.

- **Dashboard page padding is not contained** (`DashboardClient.tsx` line 142): The `max-w-[1100px]` container has no `mx-auto`, so on very wide monitors (>1440px) the content left-aligns to the sidebar edge instead of centering. Every other page has the same issue.

- **Header search bar is wide even when unused** (`DashboardLayout.tsx` line 116): The `w-64` search input in the top header is always visible and always wide. On narrow inner viewports it creates visual clutter in the header when the underlying content is already stressed.

- **Settings column imbalance**: `SettingsClient.tsx` line 88 uses `grid-cols-3` with `col-span-2` for the main content and 1 col for the plan/help sidebar. On medium-width screens this sidebar column becomes very narrow (~280px) while the plan card uses `text-4xl` numerals, causing potential text overflow.

---

### Pillar 2: Color & Contrast (3/4)

**What is working:**
- The design token system in `globals.css` (lines 9–59) is thorough and well-named. The surface scale (`#0e0e10` → `#131315` → `#19191c` → `#1f1f22` → `#2c2c2f`) creates clear elevation depth.
- Accent color `#bd9dff` is used consistently for interactive elements, active states, and data highlights.
- The purple gradient (`linear-gradient(133deg, rgb(189,157,255), rgb(138,76,252))`) is applied uniformly to all primary CTAs.
- A light mode override system exists in `globals.css` (lines 63–129), demonstrating forward-thinking theme support.
- The danger zone in Settings uses a red border (`border-[rgba(255,80,80,0.15)]`) and red heading to visually separate it from safe sections — good pattern.

**Issues:**

- **ACTIVE badge is pink, not green** (`DashboardClient.tsx` line 20 / `LinksClient.tsx` line 13): `STATUS_STYLES.ACTIVE = "bg-[#fe81a4] text-[#5a0027]"` — pink (#fe81a4) is the color of the tertiary/decorative elements in this palette, not a success indicator. Globally understood convention maps green = active/live. A user scanning status badges will not immediately read "ACTIVE" from pink, especially when `EXPIRED` is red. This is a semantic color mismatch.

- **Accent used 58 times** (grep result): `#bd9dff` appears 58 times across TSX files. While most usages are appropriate (CTAs, active states, links), some are decorative (avatar ring colors in `DashboardClient.tsx` line 27, referrer bar fills). The sheer density reduces its ability to draw attention to primary actions.

- **301 hardcoded hex colors** vs only 15 CSS variable references: The design token system in `globals.css` is largely unused in components. Nearly all components bypass it with raw hex values. This means light mode overrides must use fragile CSS attribute-value selectors (`[style*="background:#0e0e10"]`) rather than variables, and any palette change requires touching 300+ sites. This is a maintainability risk, not a visible UX defect today.

- **Analytics "Share Analytics" button color** (`AnalyticsClient.tsx` line 261): Uses `text-[#3c0089]` on the purple gradient. Dark purple text on a purple background has low contrast — estimated ~2.5:1, below WCAG AA (4.5:1 for small text). The main CTA buttons across dashboard use `text-black` (good contrast), but this one diverges.

---

### Pillar 3: Typography (3/4)

**What is working:**
- Three-weight system dominates: `font-medium` (body), `font-bold` (subheadings, labels), `font-black` (display numbers). This creates clear reading hierarchy within a single section.
- Uppercase micro-labels with `tracking-[1.2px]` on stat card labels (`DashboardClient.tsx` line 164) are a well-executed pattern that adds visual structure without extra elements.
- The hero stat number (`text-7xl tracking-[-3.6px]`) and page title (`text-5xl tracking-[-2.4px]`) have deliberate negative tracking that looks intentional and polished.
- `font-mono` is correctly applied to slugs in `EditLinkModal.tsx` line 55 and the API key in `SettingsClient.tsx` line 181.

**Issues:**

- **9 active font-size steps** in the TSX layer: `text-[10px]`, `text-xs` (12px), `text-sm` (14px), `text-base` (16px), `text-lg`, `text-xl`, `text-2xl`, custom `text-5xl`, `text-7xl`. Using 9 steps (including two arbitrary sizes at `text-[10px]` and `text-[11px]` via inline styles) makes the scale feel uncontrolled. Best practice is 4–6 defined steps. The `text-[10px]` pattern appears in status badges, pagination labels, and micro-labels — it should be normalized to `text-xs`.

- **`font-black` overused on page headings**: All four dashboard page headings ("Overview", "All Links", "Analytics", "Workspace Settings") use `font-black text-5xl`. This maximally-heavy weight creates a heavy editorial feel that may not match the product's functional SaaS context. `font-bold` or `font-semibold` at this size would be less aggressive.

- **Landing page uses a second display font**: `app/page.tsx` lines 130, 307 apply the `.display-font` class (Georgia/serif fallback) to the hero headline and stats. The rest of the product uses the sans-serif system font. This creates a split typographic identity between the landing page and the authenticated dashboard.

- **Mixed Vietnamese / English strings**: Landing page (`app/page.tsx`) and login page (`app/login/page.tsx`) are entirely Vietnamese, while all dashboard UI ("Overview", "All Links", "Analytics", "Create New Link", "Delete this link?") is English. `EditLinkModal.tsx` line 38 has `"Lỗi cập nhật"` as an error string inside an otherwise English modal. `LinkCard.tsx` line 100 has `"Xoá link này?"` as a confirm dialog. This is inconsistent and will confuse non-Vietnamese users who reach the dashboard from an English-language flow.

---

### Pillar 4: Component Consistency (2/4)

**What is working:**
- Link row cards share identical structure and Tailwind classes across `DashboardClient.tsx`, `LinksClient.tsx`, and `LinkCard.tsx` — the pattern is reusable even if not formally extracted.
- Both Create and Edit modals share the same backdrop (`bg-black/80 backdrop-blur-sm`), decorative blur blobs, and button layout.
- The purple gradient CTA button is applied consistently via `style={{ backgroundImage: "linear-gradient(...)" }}` across 7+ instances.
- Pagination component is visually identical between DashboardClient and LinksClient.

**Issues:**

- **Dual styling methodology**: Dashboard files use Tailwind utility classes exclusively. Landing page (`app/page.tsx`) and login page (`app/login/page.tsx`) use almost entirely inline `style={{}}` objects (39 instances on the landing page, 58 across dashboard TSX files). This makes global style changes difficult, prevents Tailwind's purge optimization from working on landing-page styles, and makes the codebase harder to onboard to. The two styling systems appear to reflect two separate development phases that were never unified.

- **53 arbitrary spacing values** (`[value]` syntax): Includes sizes like `py-[18px]`, `py-[14px]`, `tracking-[-2.4px]`, `tracking-[-3.6px]`, `w-[220px]`, `max-w-[1100px]`. While some (like negative letter-spacing) have no Tailwind equivalent, arbitrary pixel padding values (`py-[18px]`) indicate the spacing scale is not being respected. The Tailwind default 4px base scale (`py-4` = 16px, `py-5` = 20px) covers most needs.

- **Border radius uses 5 distinct values**: `rounded-lg` (59 uses), `rounded-xl` (20), `rounded-full` (15), `rounded-2xl` (9), `rounded-3xl` (3), `rounded-sm` (1). The mix of `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), and `rounded-3xl` (24px) in adjacent components creates visual discord. CreateLinkModal uses `rounded-3xl` for the container; EditLinkModal uses `rounded-2xl`; standard cards use `rounded-lg`. There is no documented rule for when each applies.

- **Close button icon sizes differ between modals**: CreateLinkModal (`CreateLinkModal.tsx` line 93) uses `<X size={14} />` in a `w-10 h-10` button. EditLinkModal (`EditLinkModal.tsx` line 57) uses `<X size={14} />` in a `w-8 h-8` button. The icon is the same but the hit area differs by 8px per side.

- **Primary CTA text color inconsistency**: Most gradient CTAs use `text-black` or `text-[#3c0089]` as label color. `DashboardClient.tsx` line 151 uses `text-black`. `LinksClient.tsx` line 138 uses `text-black`. `AnalyticsClient.tsx` line 261 uses `text-[#3c0089]`. `CreateLinkModal.tsx` line 234 uses `text-[#3c0089]`. Neither is inherently wrong but both appear in equivalent buttons.

---

### Pillar 5: Motion & Feedback (2/4)

**What is working:**
- Loading skeleton rows in both DashboardClient and LinksClient use `animate-pulse opacity-40` with placeholder bar shapes — clear and functional.
- The QR code modal shows a spinner while the QR data URL loads, and replaces it with the actual image — correct progressive disclosure.
- Copy button transitions from `<Copy>` icon to `<Check>` icon with accent color for 2 seconds — clear, non-intrusive confirmation.
- The `globals.css` defines `fadeUp`, `fadeIn`, `scaleIn`, `slideInLeft` animations with `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like) timing — polished and appropriate for a SaaS product.
- Hover states on link rows (`hover:border-[rgba(189,157,255,0.15)]`) and nav items provide immediate feedback.
- The `RefreshCw` icon in Settings uses `animate-spin` while regenerating the API key — correct in-context loading indicator.

**Issues:**

- **No toast notification system**: Successful link creation, deletion, and copy operations have no app-level feedback beyond icon micro-states. Failures use either `alert()` (Settings, `SettingsClient.tsx` line 47: `alert("Failed to regenerate key")`) or inline error text. The `alert()` call is an OS-native dialog that breaks the visual experience entirely. There is no `<Toaster>` component anywhere in the codebase (grep confirmed zero toast library usage).

- **Destructive actions use `window.confirm()`** at 4 locations:
  - `LinksClient.tsx` line 91: "Delete this link?" (English)
  - `LinkCard.tsx` line 100: "Xoá link này?" (Vietnamese)
  - `SettingsClient.tsx` line 41: API key regeneration warning
  - `SettingsClient.tsx` line 70: Purge all links warning

  Browser-native `confirm()` cannot be styled, does not match the product's dark aesthetic, and on some browsers (especially mobile) has been de-emphasized or removed. These should be replaced with inline confirmation dialogs or a modal with a typed confirmation for destructive operations.

- **Permanent "CTR — " placeholder** (`DashboardClient.tsx` lines 295–298): The CTR metric column is rendered on every link row with a hard-coded em dash. This is not a loading state (no loading condition) and not labeled as "coming soon". It occupies visual space and creates the impression of broken data.

- **No page-level transition between dashboard routes**: Navigating between "Overview", "All Links", "Analytics", and "Settings" is an instant hard swap with no animation. The `globals.css` animation utilities exist but are not applied at the route level. Even a simple `animate-fade-in` on the main content area would make navigation feel more polished.

- **Analytics "Share Analytics" copies a URL that doesn't actually work**: `AnalyticsClient.tsx` line 256 copies `/dashboard/analytics?slug={slug}` to clipboard. However, visiting that URL would simply open the analytics page — the `slug` query param is read nowhere in `AnalyticsClient.tsx`. The "Share" button creates false confidence that a shareable link exists.

---

### Pillar 6: Mobile & Responsiveness (1/4)

**What is working:**
- Landing page (`app/page.tsx`) has a responsive shorten-row (`flex-direction: column` on `max-width: 600px` in `globals.css` line 322), mobile-friendly CTA layout, and `clamp()` font sizing on the hero title.
- Login page centers its card vertically and constrains it with `maxWidth: "400px"` — works well at any viewport.
- `LinksClient.tsx` line 226 hides the "Created" date column on small screens (`hidden sm:block`).
- Analytics page uses `flex-wrap` on the header action row (line 197).

**Issues:**

- **Dashboard sidebar is completely non-responsive** (`DashboardLayout.tsx` line 50): The sidebar is `w-[220px] shrink-0` with no breakpoint to hide or collapse it. There is no hamburger button, no drawer, no overlay, no bottom navigation. On a 375px phone the sidebar takes up 60% of the viewport width and the main content area gets ~155px. This is the most severe usability defect in the product — the entire authenticated experience is unusable on mobile.

- **Only 3 responsive breakpoint usages** across all dashboard TSX files (grep result): `sm:block` on the Created date column in LinksClient, `flex-wrap` in AnalyticsClient header, and the CSS `@media (min-width: 768px)` in `globals.css`. In a full dashboard with bento grids, stat cards, and chart panels, this is critically under-specified.

- **Analytics `grid-cols-4` stat cards** (`AnalyticsClient.tsx` line 278): The four stat cards are in a 4-column grid with no responsive fallback. On a tablet at 768px each card is ~170px wide — workable but tight. On a phone the grid overflows.

- **Analytics `grid-cols-3` chart layout** (`AnalyticsClient.tsx` line 327): The bar chart (col-span-2) and referrers panel (1 col) have no breakpoint to stack. On narrow viewports the bar chart will be ~450px and the referrers panel ~220px, which clips the chart labels.

- **Settings `grid-cols-3`** (`SettingsClient.tsx` line 88): No responsive fallback. The plan card sidebar will become extremely narrow on smaller screens.

- **Touch target sizes**: Icon-only action buttons in link rows (`p-1` class, approximately 24×24px effective area including padding from line 302 in `DashboardClient.tsx`) are below the recommended 44×44px minimum touch target size. The Bell and HelpCircle icons in the header (`DashboardLayout.tsx` lines 126–131) have no padding at all.

- **Header icon buttons missing `aria-label`** (`DashboardLayout.tsx` lines 126–131): The Bell notification button and the header HelpCircle button have no `aria-label` attribute. They render as icon-only buttons with no screen-reader description. The sidebar has `title` attributes on inline SVG paths but not on the interactive buttons themselves.

---

## Files Audited

- `app/globals.css`
- `app/page.tsx` (landing page)
- `app/login/page.tsx`
- `app/dashboard/DashboardLayout.tsx`
- `app/dashboard/DashboardClient.tsx`
- `app/dashboard/links/LinksClient.tsx`
- `app/dashboard/analytics/AnalyticsClient.tsx`
- `app/dashboard/settings/SettingsClient.tsx`
- `app/dashboard/components/CreateLinkModal.tsx`
- `app/dashboard/components/EditLinkModal.tsx`
- `app/dashboard/components/LinkCard.tsx` (referenced in scans)
- `app/layout.tsx` (referenced in metadata scan)

---

## Prioritized UX Improvements

Sorted by user impact (highest first):

### Critical

1. **Add mobile dashboard layout** — Implement a collapsible sidebar with hamburger toggle at `md:` breakpoint. On mobile (`< 768px`), hide the sidebar by default and show it as an off-canvas drawer triggered by a Menu icon in the header. Alternatively, replace with a sticky bottom navigation bar for mobile. Affects 100% of mobile users.

2. **Replace all `window.confirm()` and `alert()` calls with in-product UI** — 4 locations use browser-native dialogs. Build a reusable `<ConfirmDialog>` component and a toast system. Minimal: install `sonner`, add `<Toaster>` to the root layout, and replace each `confirm()` / `alert()` call. Affects all destructive user flows.

3. **Remove or implement the CTR column** — `DashboardClient.tsx` lines 295–298. Either delete the column and its header, or wire it to real data. A permanently broken metric undermines data trust.

### High Impact

4. **Add responsive grid breakpoints to Analytics and Settings** — `grid-cols-4`, `grid-cols-3`, `col-span-2` in `AnalyticsClient.tsx` and `grid-cols-3` in `SettingsClient.tsx` need `sm:grid-cols-1` or `sm:grid-cols-2` fallbacks.

5. **Fix the ACTIVE badge color** — Change `STATUS_STYLES.ACTIVE` from `bg-[#fe81a4] text-[#5a0027]` (pink) to a green variant (e.g., `bg-[#a8e6cf] text-[#1b4332]`) to match universal active/live convention. Update in both `DashboardClient.tsx` line 20 and `LinksClient.tsx` line 13.

6. **Fix the Share Analytics button** — Either implement slug-aware deep-linking in `AnalyticsClient.tsx` (read the `?slug` param on mount and pre-select that link) or remove the share button. As-is, it copies a non-functional URL.

### Medium Impact

7. **Unify styling methodology** — Migrate landing page and login page from inline `style={{}}` objects to Tailwind classes. This enables consistent theming, reduces bundle size (Tailwind can purge unused classes), and makes the codebase consistent. Priority order: login page (small file), then landing page.

8. **Add `aria-label` to icon-only buttons in the header and link rows** — `DashboardLayout.tsx` Bell button (line 126), HelpCircle button (line 130), and all four action icons in link rows need `aria-label` attributes. This is a WCAG 2.1 Level A requirement.

9. **Normalize border-radius to two values** — Choose `rounded-lg` (8px) for inline elements/inputs/badges and `rounded-xl` (12px) for cards and modals. Remove uses of `rounded-2xl`, `rounded-3xl` from most cards (keep `rounded-3xl` only for the CreateLinkModal which is intentionally larger/softer). Update `EditLinkModal.tsx` to match `CreateLinkModal.tsx`.

10. **Remove the persistent static skeleton row from DashboardClient** — `DashboardClient.tsx` lines 334–349. Delete the hardcoded `opacity-40` skeleton `<div>` that renders unconditionally below real link rows. It serves no purpose after data has loaded.

### Low Impact / Polish

11. **Increase icon button touch targets** — Wrap action icons in link rows with `p-2` instead of `p-1` to bring effective touch area closer to 32–36px. In the header, add `p-2` to the Bell and HelpCircle buttons (`DashboardLayout.tsx` lines 126–131).

12. **Normalize language** — Decide on a single product language for UI strings. If targeting a global audience, use English throughout (dashboard is already English). Translate the landing page hero, login page, and error strings in `EditLinkModal.tsx` and `LinkCard.tsx` to English. Or explicitly keep the product bilingual and document the boundary.

13. **Consolidate font-size scale** — Replace all `text-[10px]` and `text-[11px]` instances with `text-xs` (12px). The visual difference at 10–12px is negligible but the consistency gain is significant. Update status badge sizes across `DashboardClient.tsx`, `LinksClient.tsx`, and `AnalyticsClient.tsx`.

14. **Reduce accent color saturation in non-interactive contexts** — Review the 58 uses of `#bd9dff`. Decorative elements (referrer bar fills, avatar ring tints) could use lower-opacity variants (`rgba(189,157,255,0.3)`) to preserve the accent's scarcity value for true interactive targets.
