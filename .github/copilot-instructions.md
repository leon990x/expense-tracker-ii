### **Project Context**

App Name: DollarVis

Tech Stack: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React (icons).

Data Strategy: Local data.json file storage. No external database.

Core UI Pattern: A dashboard with three interactive summary tiles (Daily, Weekly, Monthly).

### **Code Style & Rules**

Strict Typing: Always define TypeScript interfaces for data. Avoid any. Use Expense and Category types consistently.

Component Architecture: * Use Functional Components with Arrow Function syntax.

Keep Client Components (interacting with state) separate from Server Components (fetching data).

Use 'use client' only when necessary for state (tile expansion, form handling).

State Management: * Use Server Actions ('use server') for all JSON file mutations (add/edit).

Use revalidatePath('/') after mutations to update the UI without a page refresh.

Use Optimistic UI patterns where possible to ensure the "no-refresh" feel.

### **UI/UX Logic:**

Tiles: Must be clickable. On click, toggle an isExpanded state.

Expansion: Expanded tiles must show a list of expenses grouped by category.

Forms: The "Add/Edit" form must appear inline within or directly under the expanded tile, not in a modal or separate page.

Categories: Standard categories include: Food, Transport, Housing, Entertainment, Utilities, and Healthcare.

### **Naming Conventions**

Components: PascalCase (e.g., SummaryTile.tsx).

Functions/Variables: camelCase.

Styles: Use utility-first Tailwind classes. Avoid CSS modules.

### **File Structure Reference**

/app: Next.js App Router pages.

/components: Reusable UI elements (Tiles, Forms, Buttons).

/lib: Server actions and JSON helper functions.

/types: TypeScript definitions.

/data: Contains expenses.json.

### **Examples to refer to:**

Data Schema:

for types/expense.ts

```ts
export type Category = 
  | 'Food' 
  | 'Transport' 
  | 'Housing' 
  | 'Entertainment' 
  | 'Utilities' 
  | 'Healthcare' 
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string; // ISO String
  description: string;
}

export interface DailySummary {
  total: number;
  categories: Record<Category, number>;
}
```

### **Mock Database structure**

for data/expenses.json

```json
[
  {
    "id": "1",
    "amount": 12.50,
    "category": "Food",
    "date": "2026-03-08T12:00:00Z",
    "description": "Coffee and pastry"
  },
  {
    "id": "2",
    "amount": 45.00,
    "category": "Transport",
    "date": "2026-03-07T09:30:00Z",
    "description": "Gas refill"
  },
  {
    "id": "3",
    "amount": 1200.00,
    "category": "Housing",
    "date": "2026-03-01T08:00:00Z",
    "description": "Monthly Rent"
  }
]
```
### **The Server Action (Database Logic)**

for lib/actions.ts

```ts
'use server'

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { Expense } from '@/types/expense';

const DATA_PATH = path.join(process.cwd(), 'data/expenses.json');

export async function getExpenses(): Promise<Expense[]> {
  const file = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(file);
}

export async function addExpense(expense: Omit<Expense, 'id'>) {
  const expenses = await getExpenses();
  
  const newExpense: Expense = {
    ...expense,
    id: Math.random().toString(36).substring(2, 9),
  };

  const updatedExpenses = [...expenses, newExpense];
  await fs.writeFile(DATA_PATH, JSON.stringify(updatedExpenses, null, 2));
  
  // This triggers the "No Refresh" UI update
  revalidatePath('/');
}
```
### **Component logic for click to expand form**

For components/SummaryTile.tsx

```ts
'use client'

import { useState } from 'react';
import { Expense, Category } from '@/types/expense';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface Props {
  title: string;
  amount: number;
  expenses: Expense[];
}

export default function SummaryTile({ title, amount, expenses }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="border rounded-xl p-6 bg-white shadow-sm transition-all">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-sm text-gray-500 uppercase tracking-wider">{title}</h3>
          <p className="text-3xl font-bold">${amount.toFixed(2)}</p>
        </div>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </div>

      {isExpanded && (
        <div className="mt-6 border-t pt-4 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2 mb-4">
            {/* Logic for Category Breakdown goes here */}
            <p className="text-sm font-medium">Breakdown:</p>
            {/* ... map through categories ... */}
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 text-blue-600 font-semibold text-sm"
          >
            <Plus size={16} /> Add Expense
          </button>

          {showForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {/* Your form component goes here */}
              <p className="text-xs text-gray-400 italic">Form ready for input...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

