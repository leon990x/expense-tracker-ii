# ExpenseForm

> Source: src/components/docs/ExpenseForm.doc.md  
> Last updated: 2026-04-12

## Purpose

`ExpenseForm` is the inline create form for new expenses in the dashboard experience. It combines local optimistic updates via `useOptimistic` with server action persistence through `addExpense`, keeping interaction fast and avoiding full-page reloads. The component is designed to be rendered inside an expanded `SummaryTile` and delegates optimistic state management to its parent.

## Props / Public Contract

| Prop | Type | Required | Description |
|---|---|---|---|
| `onClose` | `() => void` | Yes | Called when the user clicks Cancel, and also called after a successful server save. |
| `onOptimisticAdd` | `(expense: Expense) => void` | Yes | Called before the server action resolves when input is valid; receives a generated optimistic `Expense` object for immediate UI insertion. |

### External Dependencies

| Dependency | Source |
|---|---|
| `addExpense` | `src/lib/actions.ts` |
| `Expense`, `Category` | `src/types/expense.ts` |

### Form Fields

| Field | Type | Required | Constraints |
|---|---|---|---|
| `amount` | `number` | Yes | `min: 0.01`, `step: 0.01` |
| `category` | `select` | Yes | Defaults to `Food`; must pass `isCategory(...)` guard |
| `date` | `date` | Yes | Normalized to midday timestamp before ISO conversion |
| `description` | `text` | No | Trimmed; may be empty |

### Allowed Categories

Food, Transport, Housing, Entertainment, Utilities, Healthcare, Merchandise, Investments, Subscriptions, Coffee, Other

## Behavior

### Validation

Validation runs in both the optimistic pre-check and the server-action handler:

- `amount` must be finite and greater than `0`.
- `category` must pass the `isCategory(...)` type guard.
- `date` must be present.
- `description` may be empty and is trimmed on submission.

If validation fails in the server-action path, inline user-facing errors are displayed:
- `Please enter a valid amount.`
- `Please select a valid category.`
- `Please select a date.`

### Submission Lifecycle

1. User submits the form.
2. `handleSubmit` parses values and, if valid, creates an optimistic `Expense`.
3. Optimistic expense is dispatched to both local optimistic state (`useOptimistic`) and the parent callback (`onOptimisticAdd`).
4. The same payload is submitted through `formAction` to `addExpense` (server action).
5. On success (`state.success === true`), the component resets the form and calls `onClose()`.
6. On failure, inline error text is rendered and the form remains open.

### Date Handling

Date input is normalized with a midday timestamp (`${date}T12:00:00`) before `.toISOString()`. This reduces boundary shifts that can occur when converting date-only values across time zones.

### UX States

| State | Behaviour |
|---|---|
| Pending | Submit button shows `Saving...` and is disabled |
| Error | Error message rendered in rose text; form stays open |
| Success | Form resets and `onClose()` is called |

### Accessibility and Interaction

- Inputs are label-wrapped for clear field association.
- Buttons use native semantics (`type="submit"`, `type="button"`).
- Component is intended for inline rendering inside expanded dashboard tiles.

## Usage Example

```tsx
// Inside SummaryTile (client component):
{showForm && (
  <ExpenseForm
    onClose={() => setShowForm(false)}
    onOptimisticAdd={(expense) => addOptimistic(expense)}
  />
)}
```

**Integration notes:**
- Parent should treat optimistic items as temporary and reconcile after server revalidates.
- Parent should avoid duplicate rendering if both optimistic and server-refetched items are present.
- Keep `ExpenseForm` as a client component; it depends on `useActionState`, `useOptimistic`, and `useEffect`.

## Related Pages

- [docs-Business-Rules](docs-Business-Rules.md) — Category and expense domain rules
- [docs-Technical-Notes](docs-Technical-Notes.md) — Mutation flow and architecture notes
