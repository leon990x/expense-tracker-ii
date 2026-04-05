# SQLite

`src/lib/sqlite.ts` initializes the SQLite database, creates required tables (`expenses`, `budget_limits`), and seeds missing budget rows across all categories/timeframes.

It exports `getDb` for shared access plus constants such as `defaultBudgetData`, `allCategories`, and `allTimeframes`.
