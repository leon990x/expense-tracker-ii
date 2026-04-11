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

## Steps

### 1. Identify Source Documents

Target source document types (repository-wide):
- `BUSINESS-RULES.md`
- `TECHNICAL-NOTES.md`
- `*.doc.md`

**In all contexts (PR branch or `main`)** — collect all matching files anywhere in the repository:
```bash
find . -type f \( -name 'BUSINESS-RULES.md' -o -name 'TECHNICAL-NOTES.md' -o -name '*.doc.md' \) -not -path './.git/*'
```

Important:
- Search the entire repo; do not limit to one folder.
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

### 3. Generate Wiki Files In `wiki/`

Create or update an organized structure under `wiki/`:
- `wiki/Home.md` (global table of contents)
- `wiki/Business-Rules.md` (index of Business Rules sources)
- `wiki/Technical-Notes.md` (index of Technical Notes sources)
- `wiki/Docs.md` (index of `*.doc.md` sources)
- `wiki/Categories.md` (index of category pages)
- `wiki/Categories/<Category>.md` (category-specific grouped pages)

Per generated page requirements:
- Use a stable title derived from source path (e.g., `src-components-docs-BUSINESS-RULES`).
- Include source attribution near the top (original repository path).
- Preserve technical details, constraints, and behavior from source documents.
- Add markdown cross-links between related pages in `wiki/`.

Category index page requirements:
- For each category with at least one mapped document, create or overwrite `wiki/Categories/<Category>.md`.
- Render grouped sections: `## Business Rules`, `## Technical Notes`, and `## Docs` (only when present).
- Under each section, list links to generated pages and include source-path attribution.

Required rendering for components docs:
- Ensure source files mapped to Components appear in `wiki/Categories/Components.md`.
- Keep `Business Rules` and `Technical Notes` sections above general `Docs` entries in that page.
- Include links to the relevant entries from `wiki/Business-Rules.md` and `wiki/Technical-Notes.md`.

Regenerate `wiki/Home.md` as a full table-of-contents:
- Brief project description
- Top-level links to `Business-Rules`, `Technical-Notes`, `Docs`, and `Categories`
- Table listing generated pages with one-sentence descriptions and source paths
- Tech-stack and project-layout summary when available from source docs

Home page coverage requirement:
- Explicitly mention that Components category includes Business Rules and Technical Notes sections when present.

### 4. Validate Wiki Folder Output

Before finishing, verify expected outputs exist in `wiki/` and contain generated content.

Minimum expected files when matching sources exist:
- `wiki/Home.md`
- `wiki/Business-Rules.md`
- `wiki/Technical-Notes.md`
- `wiki/Docs.md`
- `wiki/Categories.md`

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

### 6. Handoff To Publisher Workflow

Do not publish directly from this skill.  
Publishing happens when `.github/workflows/wiki-sync.yml` runs and syncs `wiki/` to `<repo>.wiki.git`.

**Important:** This skill must never perform clone/push operations against the wiki repository.
