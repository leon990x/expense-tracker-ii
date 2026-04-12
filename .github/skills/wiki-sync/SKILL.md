---
name: wiki-sync
description: Analyzes distributed documentation files and generates organized wiki pages inside the repo wiki/ folder.
---
# Wiki Sync Protocol

Target: the local repository `wiki/` folder.  
Publishing responsibility: `.github/workflows/wiki-sync.yml` only.

Role boundary:
- This skill must **only** read source docs and write generated pages to the checked-out repository `wiki/` folder.
- This skill must **never** clone, commit, or push to `<repo>.wiki.git`, and must not directly publish wiki content by interacting with the wiki remote.
- When invoked by `wiki-sync.yml` on a PR branch, this skill **may** commit and push changes **only** to the `wiki/` folder of the current PR branch. It must not modify, stage, or commit any files outside of `wiki/`.
- `wiki-sync.yml` is the only process that publishes `wiki/` content to the repository wiki (i.e., to `<repo>.wiki.git`).
- In PR context, this skill must execute in strict order: (1) detect matching docs, (2) copy/update `wiki/` files, (3) commit `wiki/` changes, and only then (4) optionally provide review commentary. It must not review or comment on unrelated code before `wiki/` sync is complete.

## Steps

### 1. Identify Source Documents

Target source document types (repository-wide):
- `Business-Rules.md` / `BUSINESS-RULES.md` (case-insensitive)
- `Technical-Notes.md` / `TECHNICAL-NOTES.md` (case-insensitive)
- `*.doc.md`

**In all contexts (PR branch or `main`)** — collect all matching files anywhere in the repository:
```bash
find . -type f \( -iname 'business-rules.md' -o -iname 'technical-notes.md' -o -name '*.doc.md' \) -not -path './.git/*' -not -path './wiki/*'
```

Important:
- Search the entire repo; do not limit to one folder.
- Exclude `wiki/` from source scanning to avoid recursive copies.
- If no matching files are found, exit successfully with "No matching docs to sync".

### 2. Analyze & Organize

Read every matching source document. Group and normalize by two dimensions:
- **Document kind**: `Business Rules`, `Technical Notes`, `Doc` (`*.doc.md`)
- **Domain/category** derived from source path and content cues (Components, Dashboards, App, Data, Types, Other)

Default domain/category mapping guidance:
- **Components** — UI components (SummaryTile, ExpenseForm, BudgetCard, AppNavigation, …)
- **Dashboards** — Page-level dashboard components (ExpenseDashboard, BudgetDashboard, …)
- **App** — Next.js App Router pages (HomePage, BudgetPage, RootLayout, …)
- **Data** — Server actions and data layer (Actions, SQLite, …)
- **Types** — TypeScript type definitions (Expense, Budget, …)
- **Other** — Anything that does not fit the above categories

Special classification rules:
- Any `BUSINESS-RULES.md` file maps to document kind **Business Rules**.
- Any `TECHNICAL-NOTES.md` file maps to document kind **Technical Notes**.
- Any `*.doc.md` file maps to document kind **Doc**.
- Preserve source path metadata for each section so wiki readers can trace origin.
- Do not drop or summarize away policy content; preserve rule and constraint statements verbatim where possible.

### 3. Copy Source Docs to `wiki/` with Prefixed Names

#### 3a. PR context — copy new or changed files

Execution-order requirement for PR context:
- Complete this copy/update step before any review comments are posted.
- If `wiki/` changes are needed, ensure they are committed first.

When invoked on a PR branch, detect which source doc files are **new or changed** in the PR (compared to the base branch) and copy each one into `wiki/` using the following naming convention:

**Output name rules:**

| Source file pattern | Output name in `wiki/` |
|---|---|
| `*/…/<ParentFolder>/Business-Rules.md` (any case) | `wiki/<ParentFolder>-Business-Rules.md` |
| `*/…/<ParentFolder>/Technical-Notes.md` (any case) | `wiki/<ParentFolder>-Technical-Notes.md` |
| `*/…/<Stem>.doc.md` | `wiki/<Stem>-Doc.md` |

Where:
- `<ParentFolder>` is the **immediate parent directory name** of the file.
- `<Stem>` for a `*.doc.md` file is the base name with `.doc.md` stripped (e.g., `ExpenseForm.doc.md` → stem `ExpenseForm`).

Examples:
- `src/components/AppNavigation/Business-Rules.md` → `wiki/AppNavigation-Business-Rules.md`
- `src/components/BudgetDashboard/Technical-Notes.md` → `wiki/BudgetDashboard-Technical-Notes.md`
- `src/components/docs/ExpenseForm.doc.md` → `wiki/ExpenseForm-Doc.md`

To detect changed files on a PR branch use:
```bash
git diff --name-only origin/HEAD...HEAD
```
Then filter that list to include only files matching the source document patterns.

Per-file copy requirements:
- Write the full source file content into the output wiki path.
- Add a source-attribution header at the top of each copied page: `> Source: <original-repo-path>`.
- If the output file already exists, overwrite it.

#### 3b. Maintain aggregate index files

After copying, regenerate the two aggregate index files:

**`wiki/Business-Rules.md`** — index of all `*-Business-Rules.md` pages in `wiki/`:
- One entry per copied file with a link and the source path.

**`wiki/Technical-Notes.md`** — index of all `*-Technical-Notes.md` pages in `wiki/`:
- One entry per copied file with a link and the source path.

#### 3c. Main branch — full sync

When invoked on the `main` branch (not a PR), process **all** matching source docs (not just changed ones) and apply the same copy-with-prefix rules above to ensure `wiki/` is fully up to date.

### 4. Validate Wiki Folder Output

Before finishing, verify expected outputs exist in `wiki/` and contain generated content.

Minimum expected files when matching sources exist:
- `wiki/Business-Rules.md`
- `wiki/Technical-Notes.md`

### 5. Commit Wiki Changes (PR context only)

When invoked on a PR branch by `wiki-sync.yml`, stage and commit **only** `wiki/` changes to the current PR branch:

```bash
git add wiki/
if git diff --cached --quiet; then
  echo "No wiki changes to commit"
else
  git config user.email "github-actions[bot]@users.noreply.github.com"
  git config user.name "github-actions[bot]"
  git commit -m "docs: sync wiki pages [wiki-sync]"
  git push origin HEAD
fi
```

**Critical constraints:**
- Only stage and commit files inside `wiki/`. Do **not** run `git add .` or add any files outside of `wiki/`.
- Do **not** clone or push to `<repo>.wiki.git`.
- Do not start code review comments before this commit step finishes.

### 6. Handoff To Publisher Workflow

Do not publish directly from this skill.  
Publishing happens when `.github/workflows/wiki-sync.yml` runs and syncs `wiki/` to `<repo>.wiki.git`.

**Important:** This skill must never perform clone/push operations against the wiki repository.
