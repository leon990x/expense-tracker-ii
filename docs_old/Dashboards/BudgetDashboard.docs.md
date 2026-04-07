# Budget Dashboard

`BudgetDashboard` renders the budget view for daily, weekly, and monthly limits. It controls which tile is expanded and delegates each timeframe to `BudgetCard`.

The component receives precomputed row data (`dailyRows`, `weeklyRows`, `monthlyRows`) from the server route and keeps expansion state on the client with a `Set` of tile IDs.
