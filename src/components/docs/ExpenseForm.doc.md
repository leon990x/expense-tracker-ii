# ExpenseForm

## Overview
`ExpenseForm` is a client component used to create a new expense entry from inside an expanded summary tile. It captures amount, category, date, and optional description, then submits to a server action.

## Source
- Component: `src/components/ExpenseForm.tsx`

## Props
- `onClose: () => void`
  - Called when the user cancels or after a successful save.
- `onOptimisticAdd: (expense: Expense) => void`
  - Receives an optimistic expense so parent UI can update immediately.

## User Flow
1. User enters form values and submits.
2. Form validates required values client-side.
3. Component creates an optimistic `Expense` and sends it to `onOptimisticAdd`.
4. Form submits to server action (`addExpense`) through `useActionState`.
5. On success, the form resets and closes.
6. If validation fails, an inline error message is shown.

## Validation Rules
- `amount` must be a finite number greater than `0`.
- `category` must match one of the allowed `Category` values.
- `date` is required.
- `description` is optional and trimmed.

## Category Set
Current selectable categories in the component:
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

## Technical Notes
- Uses `useActionState` for async server-action submission state.
- Uses `useOptimistic` to construct local optimistic updates.
- Uses `useRef` to reset form fields after success.
- Uses `useEffect` to close form when save succeeds.
- Converts date input to ISO using midday local time (`T12:00:00`) before `toISOString()` to reduce timezone edge shifts.

## Dependencies
- `addExpense` from `src/lib/actions.ts`
- `Expense` and `Category` from `src/types/expense.ts`

## Error and Pending UX
- Pending submit state changes button label to `Saving...` and disables submit.
- Validation errors are rendered inline in a message row.

## Integration Expectations
- Parent component should keep optimistic and server-revalidated lists in sync.
- Parent must provide `onClose` and `onOptimisticAdd` handlers.
- This form is intended for inline usage in dashboard tiles, not modal-only workflows.
