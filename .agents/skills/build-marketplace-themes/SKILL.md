---
name: build-marketplace-themes
description: Create, batch-build, retrofit, validate, register, and release original SuparPOS marketplace themes. Use when adding one or more themes from the approved 100-theme catalog, standardizing Product Modal/cart responsive behavior across themes, preparing marketplace listing metadata, or opening only completed themes for sale.
---

# Build Marketplace Themes

Build commercially distinct SuparPOS themes without duplicating business logic or copyrighted characters. Treat the current `MinimalEarth.tsx` implementation as the behavioral and responsive reference while preserving each theme's visual identity.

## Required references

- Read [references/theme-catalog.md](references/theme-catalog.md) when selecting, naming, sequencing, or implementing catalog themes. It contains all 100 approved concepts.
- Read and update [references/theme-progress.md](references/theme-progress.md) when starting or finishing a catalog batch. Treat it as the visible source of truth for per-theme progress, and stop after the current 10-theme batch.
- Read [references/release-checklist.md](references/release-checklist.md) before registering a theme, editing marketplace data, changing `is_active`, or declaring a theme complete.

## Establish the current baseline

Before editing:

1. Inspect `app/[slug]/[brandId]/table/[tableId]/page.tsx` for the authoritative component imports and `theme_mode` switch cases.
2. Inspect the current working-tree version of `components/themes/MinimalEarth.tsx`. Do not rely on remembered line numbers or stale copied classes.
3. Inspect `hooks/useShopLogic.ts` to understand the existing `state`, `actions`, and `helpers` contract. Reuse it; do not fork pricing, cart, checkout, discount, topping, or order logic into a theme.
4. Inspect `git status` and preserve unrelated user changes.
5. Identify whether the request covers a new theme, a retrofit, listing metadata, or release status. Do not broaden the operation implicitly.

## Choose the implementation shape

For a small retrofit of an existing theme, make the smallest safe edit in that theme.

For a large set of new themes, prefer shared structural components and thin visual presets over 100 copied monoliths. Reuse shared Product Modal, option selector, cart sheet, navigation, and responsive shell behavior while supplying per-theme tokens, decorative components, and layout variants. Do not perform a repository-wide architecture migration unless the user's request includes it.

Every catalog theme must still have:

- A stable PascalCase component filename.
- A unique lowercase `theme_mode` from the catalog.
- A distinct visual system, not merely a color swap.
- Original assets and naming suitable for commercial use.
- A marketplace cover and mobile/iPad gallery plan.

## Preserve the behavioral contract

Keep these behaviors consistent with the current `MinimalEarth.tsx` reference:

- Product variants: normal, special, and jumbo when provided.
- Single- and multiple-choice options.
- Required-option validation.
- Topping prices and option price display.
- Notes, quantity, add-to-cart, and order-now actions.
- State reset when a new product is opened.
- Scrollable modal content with a non-overlapping action footer.
- Cart rendering, checkout behavior, discounts, and price calculation.

For an option choice:

- Render its image only when `choice.image_url` or `choice.image_name` is present.
- Do not render an empty square, placeholder, or plus icon when no image exists.
- Keep a no-image row approximately the same height as the normal/special/jumbo selector.
- Preserve the theme's radio/checkbox treatment, name, price, and selected state.

## Responsive contract

Mirror the current reference behavior rather than blindly copying class strings. Preserve each theme's colors, type, textures, borders, shadows, animation, icons, and decorative composition.

Validate these ranges:

- Mobile below 768 px: preserve the existing mobile identity and bottom-sheet behavior.
- Tablet/iPad from 768 through 1279 px: use the expanded tablet layout and centered modal behavior established by the reference.
- Desktop at 1280 px and above: restore the intended desktop layout. Use `xl:` rather than `lg:` for desktop restoration so 1024 px iPads remain in the tablet range.

The modal must:

- Fit inside the viewport without horizontal overflow.
- Use `flex flex-col` or an equivalent bounded layout.
- Give the content region `flex-1` and vertical scrolling.
- Keep the action footer as a non-overlapping flex sibling, normally `shrink-0`.
- Keep the close control visible and operable.
- Handle long descriptions, many options, and mixed image/no-image choices.

Test at minimum:

- 390 x 844
- 768 x 1024
- 820 x 1180
- 1024 x 768
- 1024 x 1366
- 1440 x 900

## Maintain visual originality

Give every theme at least three distinguishing traits across typography, composition, surface treatment, motion, illustration, navigation, or product-card shape. Do not satisfy the catalog by changing only colors.

Do not use third-party character names, logos, franchise likenesses, traced artwork, or unlicensed fonts. Treat catalog names as product candidates and perform trademark clearance before public commercial launch. Prefer CSS, original SVG, licensed fonts, and original generated assets.

## Work in batches

For multi-theme requests:

1. Resolve the requested catalog entries exactly by ID, filename, or `theme_mode`.
2. Work in batches of at most 10 themes.
3. Inspect each theme's JSX rather than applying an unchecked mass replacement.
4. After every batch, inspect the diff and run a targeted TypeScript check.
5. Fix all errors caused by the batch before continuing.
6. Continue automatically only when the user asked for the whole approved set.
7. Record skipped or blocked themes; never silently omit one.

Do not claim completion from an implementation plan. Completion requires actual file diffs, verification results, and a final inventory.

## Verify implementation

For every theme, exercise:

- A product without options.
- Normal/special/jumbo variants.
- A single-choice group.
- A multiple-choice group.
- Choices with images.
- Choices without images.
- Choices with added prices.
- Enough choices to require scrolling.
- Cart and action-footer behavior.

Run the repository's relevant TypeScript, lint, and build commands. Separate pre-existing failures from failures introduced by the theme work. Do not automatically rewrite unrelated legacy lint findings.

## Register and release

Derive routing from `page.tsx`; never guess the mapping from a filename. Add or update only the exact component import and `theme_mode` case required by the requested theme.

Keep a new or incomplete marketplace theme inactive. Change `marketplace_themes.is_active` only when the user explicitly authorized release and the theme passed the release checklist. Use the authenticated admin workflow at `/admin/marketplace-themes`; never expose or use a service-role key to bypass access controls.

When authorized to open completed themes during a batch:

- Activate only themes that passed code and visual checks.
- Leave failed, skipped, and unfinished themes inactive.
- Never select all inactive themes globally.
- Verify the active filter after each batch.
- Remember that a localhost admin page may still write to the configured production Supabase project.

## Final report

Report:

- Requested, completed, skipped, and failed counts.
- Component filename and `theme_mode` for every requested theme.
- Files changed outside `components/themes`, with a reason for each.
- TypeScript, lint, build, and viewport results.
- Marketplace registration result.
- Final `is_active` status when release was requested.
- Confirmation that no commit or push occurred unless the user explicitly asked for it.
