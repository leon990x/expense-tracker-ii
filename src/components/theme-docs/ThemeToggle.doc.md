# ThemeToggle

## Status
`src/components/ThemeToggle.tsx` currently exists but has no implementation. This document captures the expected interaction and integration requirements.

## Purpose
`ThemeToggle` should provide a user control to switch the active theme exposed by `ThemeProvider`.

## Source
- Component path: `src/components/ThemeToggle.tsx`

## Expected Public Contract

### Props (recommended)
- Optional `className?: string` for placement styling.
- Optional `size?: 'sm' | 'md' | 'lg'` to control icon/button size.

### Dependencies
- Consumes theme context from `ThemeProvider`.
- Should not directly own persistence logic when provider exists.

## Expected Behavior
1. Read current theme from provider context.
2. On user action, call provider theme setter/toggler.
3. Update visual state immediately (icon, label, aria state).
4. Preserve keyboard accessibility and focus visibility.

## Accessibility Requirements
- Use a semantic `button` element.
- Include `aria-label` that reflects action (for example, "Switch to dark theme").
- Keep visible focus ring and sufficient contrast.
- Ensure target size is touch-friendly.

## UI Guidance
- Use clear iconography (for example, sun/moon) plus optional text.
- Keep transitions lightweight and non-distracting.
- Align styling with project tokens/Tailwind patterns.

## Integration Expectations
- Place in shared navigation/header area so users can switch theme globally.
- Must work across route changes without resetting state.
- Should remain functional when rendered inside client components.

## Testing Guidance
- Verify toggle updates root theme class.
- Verify preference persists after page reload.
- Verify button is keyboard operable (`Tab`, `Enter`, `Space`).
- Verify SSR/client hydration does not throw when browser APIs are unavailable.

## Implementation Checklist
- [ ] Add `'use client'` if using hooks.
- [ ] Consume typed `useTheme` hook from provider.
- [ ] Implement accessible button semantics.
- [ ] Add visual state for current theme.
- [ ] Validate behavior after refresh and navigation.
