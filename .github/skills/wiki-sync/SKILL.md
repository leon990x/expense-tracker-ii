---
name: wiki-sync
description: Analyzes documentation files and builds an organized wiki into the wiki/ folder of the main repo. No PAT required — uses only the built-in GITHUB_TOKEN.
---
# Wiki Sync Protocol (Credential-Free)

Wiki content lives at `wiki/` inside this repository. **Do not push to `.wiki.git`.**
All changes are committed directly to the current branch using standard `git` commands.

## Steps

### 1. Discover Source Docs
Scan the entire codebase for:
- All `**/*.docs.md` files (inline source documentation)
- All `docs_old/**/*.md` files (legacy documentation)

### 2. Analyze & Organize
Read every discovered doc file. Group them into these categories:
- **Components** — UI components (SummaryTile, ExpenseForm, BudgetCard, AppNavigation, …)
- **Dashboards** — Page-level dashboard components (ExpenseDashboard, BudgetDashboard, …)
- **App** — Next.js App Router pages (HomePage, BudgetPage, RootLayout, …)
- **Data** — Server actions and data layer (Actions, SQLite, …)
- **Types** — TypeScript type definitions (Expense, Budget, …)
- **Other** — Anything that does not fit the above categories

### 3. Generate Organized Wiki Pages
For each category that has at least one doc, create or fully overwrite `wiki/<Category>.md`:
- Use a top-level `# <Category>` heading.
- Add a sub-section `## <TopicName>` for each individual doc within that category.
- Preserve all technical details (props, functions, behavior, file paths) from the source docs.
- Add cross-links between related pages using wiki-relative links, e.g. `[Data](Data)`.

### 4. Regenerate Home.md
Rewrite `wiki/Home.md` as a table-of-contents page:
- Brief project description (DollarVis — Next.js expense-tracking dashboard).
- A table listing every page now in `wiki/` with a one-sentence description.
- Tech-stack summary.
- Project-layout summary.

### 5. Commit to the Current Branch
```bash
git config user.email "github-actions[bot]@users.noreply.github.com"
git config user.name "github-actions[bot]"
git add wiki/
git diff --cached --quiet && echo "No changes." && exit 0
git commit -m "docs: sync wiki from *.docs.md files [skip ci]"
git push origin HEAD
```
This commits the updated `wiki/` folder to the **current branch** (the PR branch if invoked from a PR, or `main` if run manually). When the PR is merged, the wiki lands in `main` automatically — no separate wiki PR needed.
