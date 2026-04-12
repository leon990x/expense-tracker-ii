# ExpenseForm

## Purpose
`ExpenseForm` is the inline create form for new expenses in the dashboard experience. It is designed to keep interaction fast by combining local optimistic updates with server action persistence.

## Source
- Component: `src/components/ExpenseForm.tsx`

## Public Contract

### Props
- `onClose: () => void`
  - Called when the user clicks Cancel.
  - Called after a successful server save.
- `onOptimisticAdd: (expense: Expense) => void`
  - Called before the server action resolves when input is valid.
  - Receives a generated optimistic expense object.

### External Dependencies
- `addExpense` from `src/lib/actions.ts`
- `Expense` and `Category` from `src/types/expense.ts`

## Form Fields
- `amount` (`number`, required, min `0.01`, step `0.01`)
- `category` (`select`, required, defaults to `Food`)
- `date` (`date`, required)
- `description` (`text`, optional, trimmed)

## Allowed Categories
- Food
- Transport
- Housing
- Entertainment
- Utilities
- Healthcare
- Merchandise
- Investments
- Subscriptions
- Coffee
- Other

## Validation Behavior
Validation is performed in both optimistic pre-check and server-action handler:
- `amount` must be finite and greater than `0`.
- `category` must pass `isCategory(...)`.
- `date` must be present.
- `description` may be empty and is trimmed.

If validation fails in the server-action path, the form returns user-facing errors:
- `Please enter a valid amount.`
- `Please select a valid category.`
- `Please select a date.`

## Submission Lifecycle
1. User submits the form.
2. `handleSubmit` parses values and, if valid, creates an optimistic `Expense`.
3. Optimistic expense is sent to both local optimistic state (`useOptimistic`) and parent callback (`onOptimisticAdd`).
4. The same payload is submitted through `formAction` to `addExpense` (server action).
5. On success (`state.success === true`), the component resets the form and calls `onClose()`.
6. On failure, inline error text is rendered and the form remains open.

## Date Handling Note
Date input is normalized with a midday timestamp (`${date}T12:00:00`) before `toISOString()`. This helps reduce boundary shifts that can happen when converting date-only values across time zones.

## UX States
- Pending: submit button shows `Saving...` and becomes disabled.
- Error: message row displayed in rose text.
- Success: form reset + close action.

## Accessibility and Interaction
- Inputs are label-wrapped for clear field association.
- Buttons keep native semantics (`type="submit"`, `type="button"`).
- Component is intended for inline rendering in expanded dashboard tiles.

## Integration Guidance
- Parent should treat optimistic items as temporary and reconcile after server revalidates.
- Parent should avoid duplicate rendering if both optimistic and server-refetched items are present.
- Keep this component as a client component; it depends on `useActionState`, `useOptimistic`, and `useEffect`.
