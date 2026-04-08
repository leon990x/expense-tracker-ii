# App Navigation

`AppNavigation` is a client-side component that renders the primary navigation bar for DollarVis. It is mounted globally inside the shared `<header>` in `layout.tsx`, so it appears on every page.

## Routes

| Route | Label | Description |
|---|---|---|
| `/` | Dashboard | Expense dashboard — view and manage daily, weekly, and monthly spending summaries |
| `/budget` | Budget | Budget dashboard — compare per-category spending against configured limits |

## Active-link Highlighting

`AppNavigation` calls `usePathname()` from `next/navigation` to detect the current route. The active link receives distinct border and text styles (`border-sky-300 text-sky-800`), while inactive links use muted slate styling with a hover effect.

## Component Location

```
src/components/AppNavigation.tsx
```

## Usage

The component is imported and rendered directly in the root layout:

```tsx
// src/app/layout.tsx
import AppNavigation from "@/components/AppNavigation";

<header>
  <h1>DollarVis</h1>
  <AppNavigation />
</header>
```

No props are required — the component is self-contained and reads its active state from the router.
