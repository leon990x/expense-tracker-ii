# ExpenseForm

## Purpose
`ExpenseForm` is the inline create/edit form for expenses in the dashboard experience. It combines local optimistic updates with server action persistence to keep interaction fast and no-refresh.

## Source
- Component: `src/components/ExpenseForm.tsx`

## Public Contract

### Props
| Prop | Type | Description |
|---|---|---|
| `onClose` | `() => void` | Called when the user clicks Cancel, or after a successful save. |
| `onOptimisticAdd` | `(expense: Expense) => void` | Called before the server action resolves when input is valid, with the generated optimistic expense object. |
| `initialValues` | `Expense \| undefined` | Optional. When provided, the form renders in edit mode pre-populated with the existing expense's values. |

### External Dependencies
- `addExpense` from `src/lib/actions.ts` — used in create mode
- `editExpense` from `src/lib/actions.ts` — used in edit mode
- `Expense` and `Category` from `src/types/expense.ts`

## Form Fields
| Field | Type | Required | Notes |
|---|---|---|---|
| `amount` | `number` | Yes | `min="0.01"`, `step="0.01"` |
| `category` | `select` | Yes | Defaults to `Food` |
| `date` | `date` | Yes | Normalized to midday before storage |
| `description` | `text` | No | Trimmed; empty string is allowed |

## Allowed Categories
`Food`, `Transport`, `Housing`, `Entertainment`, `Utilities`, `Healthcare`, `Merchandise`, `Investments`, `Subscriptions`, `Coffee`, `Other`

These must stay in sync with the `Category` union type in `src/types/expense.ts`.

## Validation Behavior
Validation runs in both the optimistic pre-check and the server action handler:
- `amount` must be finite and greater than `0`.
- `category` must pass `isCategory(...)`.
- `date` must be present.
- `description` may be empty and is trimmed before use.

User-facing validation error messages:
- `Please enter a valid amount.`
- `Please select a valid category.`
- `Please select a date.`

## Submission Lifecycle

### Create mode (no `initialValues`)
1. User submits the form.
2. `handleSubmit` parses values and, if valid, creates an optimistic `Expense` with a temporary ID.
3. The optimistic expense is applied via `useOptimistic` and sent to the parent via `onOptimisticAdd`.
4. `addExpense` server action is called with the same payload.
5. On success (`state.success === true`), the form resets and `onClose()` is called.
6. On failure, inline error text is rendered and the form stays open.

### Edit mode (`initialValues` provided)
1. Form renders pre-populated with the existing expense's fields.
2. User submits changes.
3. `editExpense(id, updates)` server action is called.
4. On success, `onClose()` is called; the parent reconciles the updated data via `revalidatePath`.
5. Optimistic UI for edits reflects the new values immediately at the parent level.

## Date Handling
Date input is normalized with a midday timestamp (`${date}T12:00:00`) before calling `.toISOString()`. This reduces boundary shifts when converting date-only values across time zones.

## UX States
| State | Behavior |
|---|---|
| Pending | Submit button showing `Saving…` and becomes disabled |
| Error | Error message rendered in rose text; form stays open |
| Success | Form resets; `onClose()` called |

## Accessibility and Interaction
- All inputs are label-wrapped for clear field association.
- Buttons use native semantics: `type="submit"` and `type="button"`.
- The component is intended for inline rendering inside expanded dashboard tiles.

## Integration Guidance
- The parent must treat optimistic items as temporary and reconcile after the server revalidates.
- Avoid duplicate rendering if both an optimistic item and a server-refetched item are present simultaneously.
- Keep this as a client component — it depends on `useActionState`, `useOptimistic`, and `useEffect`.
