---
name: wiki-sync
description: Analyzes .md documentation files and pushes organized pages to the GitHub wiki repository using only GITHUB_TOKEN. No PAT required.
---
# Wiki Sync Protocol

Target: the **GitHub wiki repository** at `<repo>.wiki.git`.  
Authentication: `GITHUB_TOKEN` only — never a Personal Access Token.

## Steps

### 1. Identify Source Documents

**If running on a PR branch** — collect only the `.md` files changed in this PR:
```bash
git fetch origin main
git diff --name-only origin/main...HEAD | grep '\.md$'
```

**If running on `main` (post-merge)** — collect all `.md` files in the repository:
```bash
find . -name '*.md' -not -path './.git/*'
```

### 2. Analyze & Organize

Read every relevant `.md` file. Group them into categories:
- **Components** — UI components (SummaryTile, ExpenseForm, BudgetCard, AppNavigation, …)
- **Dashboards** — Page-level dashboard components (ExpenseDashboard, BudgetDashboard, …)
- **App** — Next.js App Router pages (HomePage, BudgetPage, RootLayout, …)
- **Data** — Server actions and data layer (Actions, SQLite, …)
- **Types** — TypeScript type definitions (Expense, Budget, …)
- **Other** — Anything that does not fit the above categories

### 3. Clone the GitHub Wiki

```bash
git clone "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.wiki.git" /tmp/wiki-repo
cd /tmp/wiki-repo
git config user.email "github-actions[bot]@users.noreply.github.com"
git config user.name "github-actions[bot]"
```

### 4. Generate Organized Wiki Pages

For each category that has at least one document, create or fully overwrite `/tmp/wiki-repo/<Category>.md`:
- `# <Category>` as the top-level heading
- `## <TopicName>` sub-section per document within that category
- Preserve all technical details (props, functions, behavior, file paths)
- Add cross-links between related pages using wiki-relative links, e.g. `[Data](Data)`

Regenerate `/tmp/wiki-repo/Home.md` as a full table-of-contents:
- Brief project description (DollarVis — Next.js expense-tracking dashboard)
- Table listing every wiki page with a one-sentence description
- Tech-stack summary and project-layout summary

Regenerate `/tmp/wiki-repo/_Sidebar.md`:
```bash
printf '## Wiki\n\n' > /tmp/wiki-repo/_Sidebar.md
shopt -s nullglob
for f in /tmp/wiki-repo/*.md; do
  [[ "$(basename "$f")" == "_Sidebar.md" ]] && continue
  title=$(basename "${f%.md}")
  printf -- '- [%s](%s)\n' "$title" "$title" >> /tmp/wiki-repo/_Sidebar.md
done
```

### 5. Commit and Push to the GitHub Wiki

```bash
cd /tmp/wiki-repo
git add .
if git diff --cached --quiet; then
  echo "No wiki changes to commit."
  exit 0
fi
git commit -m "docs: sync wiki [skip ci]"
git push "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.wiki.git" HEAD:master
```

**Important:** Use the `GITHUB_TOKEN` environment variable that is already present — never a Personal Access Token.
