# Budget Page

The budget route (`src/app/budget/page.tsx`) computes daily, weekly, and monthly expense slices and builds category rows (`spent` + `limit`) for each timeframe.

It passes the prepared rows to `BudgetDashboard` and is also configured as a dynamic server page.
