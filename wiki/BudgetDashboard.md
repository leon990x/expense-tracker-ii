# BudgetDashboard

## Purpose

Renders three budget tiles (titled `Daily`, `Weekly`, `Monthly`) and manages which tiles are expanded.

## File

- `src/components/BudgetDashboard.tsx`

## Props

- `dailyRows: BudgetCategoryRow[]`
- `weeklyRows: BudgetCategoryRow[]`
- `monthlyRows: BudgetCategoryRow[]`

## Behavior

- Client component using local state.
- Tracks expanded tiles with a `Set` of tile IDs (`today`, `week`, `month`).
- Initializes with `month` expanded by default so users see the monthly overview on first load.
- Passes tile-specific data and toggle handlers into `BudgetCard`.

## Rendered Structure

- A vertical section (`flex flex-col gap-5`) containing:
  - `BudgetCard` for daily budget
  - `BudgetCard` for weekly budget
  - `BudgetCard` for monthly budget
