# ThemeProvider

## Status
`src/components/ThemeProvider.tsx` currently exists but has no implementation. This document defines the expected behavior and integration contract for when it is implemented.

## Purpose
`ThemeProvider` should provide application-wide theme state and persistence so users can switch between visual themes (for example, light and dark) without losing preference on navigation or refresh.

## Source
- Component path: `src/components/ThemeProvider.tsx`

## Expected Public Contract

### Props
- `children: React.ReactNode`
  - Wrapped application content that receives the theme context.

### Context Shape (recommended)
- `theme: 'light' | 'dark'`
- `setTheme: (theme: 'light' | 'dark') => void`
- `toggleTheme: () => void`

## Expected Responsibilities
1. Store the active theme in React state.
2. Persist theme preference in `localStorage`.
3. Initialize theme from persisted value (or system preference fallback).
4. Apply theme to the document root (for example, `document.documentElement.classList`).
5. Expose stable context APIs for consumers like `ThemeToggle`.

## Rendering and UX Notes
- Avoid visual flicker on initial load by applying the resolved theme as early as possible.
- Keep theme transitions subtle and consistent with existing Tailwind styles.
- Preserve accessibility contrast across all themed surfaces.

## Integration Expectations
- Use in top-level layout so all pages/components can access the theme context.
- `ThemeToggle` should consume provider context and never duplicate persistence logic.

## Error Handling Guidance
- If `localStorage` is unavailable, fall back to in-memory state without breaking render.
- Validate loaded theme values before applying (`light`/`dark` only).

## Implementation Checklist
- [ ] Add `'use client'` if hooks or browser APIs are used.
- [ ] Implement context + provider wrapper.
- [ ] Add localStorage read/write.
- [ ] Add root class synchronization.
- [ ] Export a typed hook (for example, `useTheme`) for consumers.
