# AppNavigation — Technical Notes

## Overview

`AppNavigation` is a client-side React component that renders the primary navigation bar for DollarVis. It is mounted inside `RootLayout` (`src/app/layout.tsx`) within the shared `<header>`, making it visible on every page in the app.

## Component Location

| File | Role |
|---|---|
| `src/components/AppNavigation.tsx` | Component implementation |
| `src/app/layout.tsx` | Mount point — renders `<AppNavigation />` inside `<header>` |
| `src/components/AppNavDocs/` | Documentation for this component |

## Why This Is a Client Component

`AppNavigation` carries the `"use client"` directive because it calls `usePathname()` from `next/navigation`. `usePathname()` reads the current browser URL and is only available in the client rendering environment. Server components cannot re-render in response to navigation, so active state detection must happen on the client.

## Active State Implementation

Active state is derived at render time by comparing `pathname` (from `usePathname()`) against each link's `href`:

```ts
const isActive = pathname === href;
```

The comparison is **strict equality** — no prefix or partial matching. This ensures only the exact destination link is highlighted.

All class resolution is encapsulated in `getTileClassName(href: string)`:

```ts
const getTileClassName = (href: string) => {
  const isActive = pathname === href;
  return `rounded-xl border px-6 py-3 text-sm font-semibold transition ${
    isActive
      ? "border-sky-300 bg-slate-50 text-sky-800"
      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
  }`;
};
```

Active links receive no hover classes — Tailwind's cascade ensures the hover variants on inactive links do not apply to the active state.

## Routing

Navigation links use `next/link` (`<Link>`), which performs client-side route transitions without a full page reload. The two registered destinations are:

| Label | `href` |
|---|---|
| Dashboard | `/` |
| Budget | `/budget` |

## Layout and Styling

The `<nav>` element uses `flex justify-center gap-4 mt-5` to center the link group horizontally below the app title inside the header. Link tiles share a consistent pill shape (`rounded-xl border px-6 py-3`) regardless of active state; visual differentiation is achieved through border and text color only, not size or shape changes.

## Accessibility

- The `<nav>` element has `aria-label="Primary"` to distinguish it from any future secondary navigation regions.
- Link text ("Dashboard", "Budget") is the accessible name — no icon-only links are used.
- Focus rings are provided by Tailwind's default `outline` behaviour and must not be suppressed.

## Extending the Component

**Adding a new route:**
1. Add a `<Link href="/<new-route>">` element inside `<nav>` in `AppNavigation.tsx`.
2. Pass the new `href` to `getTileClassName` as the `className` value.
3. Update `BUSINESS-RULES.md` Route Rules section.
4. Update this file with the new destination in the Routing table above.

**Adding a new visual state (e.g. disabled):**
- Add a new branch inside `getTileClassName` — do not add inline conditional classes on `<Link>` elements.
