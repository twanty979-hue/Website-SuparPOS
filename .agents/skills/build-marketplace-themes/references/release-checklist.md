# Theme implementation and release checklist

## Contents

- [Phase gate](#phase-gate)
- [Implementation evidence](#implementation-evidence)
- [Responsive and commerce checks](#responsive-and-commerce-checks)
- [Marketplace registration](#marketplace-registration)
- [Opening for sale](#opening-for-sale)
- [Final evidence](#final-evidence)

## Phase gate

The 100-theme catalog is a parked future plan. Do not implement any catalog theme merely because this skill is loaded or the catalog exists.

Before starting catalog implementation, require an explicit user request to start one or more named/numbered catalog themes. If the repository's existing legacy themes are still undergoing responsive retrofit or review, keep the catalog parked and finish the existing-theme work first.

Planning, sequencing, estimating, or reviewing the catalog does not authorize component creation, route edits, database writes, sale activation, commits, or pushes.

## Implementation evidence

A theme is implemented only when all applicable evidence exists:

- The component or approved preset/config exists in the working tree.
- The authoritative route imports and resolves the exact `theme_mode`.
- The theme consumes the existing shop state/action/helper contract.
- No copyrighted franchise asset or unlicensed font was introduced.
- The diff contains actual implementation, not only a plan or inventory.
- TypeScript succeeds for the touched implementation or failures are proven pre-existing.

## Responsive and commerce checks

Check:

- Mobile 390 x 844.
- iPad portrait 768 x 1024 and 820 x 1180.
- iPad landscape 1024 x 768.
- iPad Pro 1024 x 1366.
- Desktop 1440 x 900.
- Product with no options.
- Normal/special/jumbo variants.
- Single and multiple choices.
- Image and no-image choices.
- Required options.
- Extra prices and discount display.
- Long option lists and scrolling.
- Add to cart, cart sheet, and order-now entry points.
- Close controls and action footer without overlap.

Do not mark a viewport as tested from static class inspection alone when browser verification is available.

## Marketplace registration

Before adding or editing a marketplace record:

1. Resolve `theme_mode` from the route and catalog.
2. Confirm the component/preset is complete.
3. Prepare original cover art and representative mobile/iPad gallery assets.
4. Prepare listing name, short description, long description, features, category, minimum plan, and prices.
5. Keep `is_active = false` during construction and review.
6. Preserve unrelated marketplace fields when updating an existing record.

Do not alter `app/admin/marketplace-themes/page.tsx` just to activate a theme. Use its existing authenticated controls.

## Opening for sale

Changing `marketplace_themes.is_active` is an external state change. Do it only when the user explicitly requested activation of completed themes.

When authorized:

1. Select only the exact completed theme or passing batch.
2. Set `is_active = true` through `/admin/marketplace-themes` with an authenticated admin session.
3. Never use a service-role key in client code or a temporary bypass script.
4. Reload the admin page and filter by `เปิดขาย`.
5. Verify each exact theme is active.
6. Verify unfinished, skipped, or failed themes remain inactive.
7. Remember that localhost may point at the production Supabase project and activation can become visible to real customers immediately.

If authentication or permissions block activation, stop the data-changing step and report the exact filename and `theme_mode` values ready for the user to activate.

## Final evidence

Provide:

| Field | Required value |
|---|---|
| Component | Exact filename or shared preset path |
| Route | Exact `theme_mode` mapping |
| Responsive | Result for every required viewport |
| Options | Image/no-image and single/multiple results |
| TypeScript | Command and exit result |
| Build | Command and exit result |
| Marketplace | Record created/updated/not requested |
| Sale status | `true`, `false`, not requested, or blocked |
| Exceptions | Skipped checks and concrete reasons |

Do not claim the whole catalog is complete unless every requested catalog ID appears in the final inventory.
