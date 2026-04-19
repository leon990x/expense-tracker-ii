# Summary Tile Business Rules

## Scope
These rules define expected behavior for tile expansion, interaction, and display within the SummaryTile component under src/components/SummaryTile.tsx.

## Expansion Rules
1. Only one tile can be expanded at a time; expanding a new tile must collapse any currently expanded tile.
2. Expansion state is controlled externally via the `isExpanded` prop — the tile must not manage its own open/closed state.
3. The `onToggle` callback must be invoked with the tile's `id` on click, allowing the parent to control which tile is open.
4. Expanding a tile must not affect the scroll position of the page or cause layout shifts outside the tile boundary.

## Content Display Rules
1. The expanded panel must show expenses grouped by category in the fixed category order: Food, Transport, Housing, Entertainment, Utilities, Healthcare, Merchandise, Investments, Subscriptions, Coffee, Other.
2. Categories with zero expenses must be omitted from the expanded panel.
3. Each category group must display the category name and a list of its expenses with amount, description, and formatted date.
4. The total amount shown in the tile header must always reflect the sum of all expenses passed in via the `expenses` prop.

## Amount Status Rules
1. The displayed total amount must be color-coded based on the `amountStatus` prop:
   - `normal` → blue (`text-[#0072C1]`)
   - `warning` → orange (`text-orange-500`)
   - `danger` → red (`text-rose-500`)
2. Color coding must only be applied to the amount; title and other tile elements must remain unstyled.

## Inline Edit Rules
1. Only one expense row may be in edit mode at a time within a tile.
2. Starting an amount/description edit must clear any active category edit, and vice versa.
3. An edit must not be committed if the amount field is empty, non-numeric, or less than or equal to zero.
4. Cancelling an edit must restore the row to its original display state without persisting any changes.
5. A date field left blank during edit must fall back to the expense's original date.

## Bulk Category Edit Rules
1. Editing a category group label must apply the new category to all expenses in that group via `onBulkEditCategory`.
2. A bulk category edit must not be submitted if the expense ID list is empty.
3. Bulk category edit mode on a group must be suppressed if any individual expense row is already in edit mode.

## Accessibility Rules
1. The expand/collapse toggle must be a `button` element, not a `div` or `span`, to support keyboard interaction.
2. The toggle button must be full-width and left-aligned so the entire tile header is the click target.
3. Delete and edit actions within the expanded panel must be accessible via keyboard focus.

## Consistency Rules
1. Animation and transition classes on the expanded panel must use CSS grid row transitions, not `display:none` toggling, to allow smooth open/close.
2. Any new category added to the type system must be appended to `categoryOrder` in `SummaryTile.tsx` and reflected in these rules.
3. Changes to tile interaction behavior must be documented here before implementation.
