---
name: wiki-sync
description: Analyzes .md documentation files and pushes organized pages to the GitHub wiki repository using only GITHUB_TOKEN. No PAT required.
---
# Wiki Sync Protocol

Target: the **GitHub wiki repository** at `<repo>.wiki.git`.  
Authentication: `GITHUB_TOKEN` only — never a Personal Access Token.

## Steps

### 1. Identify Source Documents

Target source document types (repository-wide):
- `BUSINESS-RULES.md`
- `TECHNICAL-NOTES.md`
- `*.doc.md`

**If running on a PR branch** — collect only matching files changed in this PR:
```bash
git fetch origin main
git diff --name-only origin/main...HEAD | grep -E '(^|/)BUSINESS-RULES\.md$|(^|/)TECHNICAL-NOTES\.md$|\.doc\.md$'
```

**If running on `main` (post-merge)** — collect all matching files anywhere in the repository:
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

### 3. Clone the GitHub Wiki

```bash
git clone "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.wiki.git" /tmp/wiki-repo
cd /tmp/wiki-repo
git config user.email "github-actions[bot]@users.noreply.github.com"
git config user.name "github-actions[bot]"
```

### 4. Generate Organized Wiki Pages

Create an organized wiki structure inside the existing wiki repository using folders plus index pages:
- `/tmp/wiki-repo/Home.md` (global table of contents)
- `/tmp/wiki-repo/_Sidebar.md` (navigation)
- `/tmp/wiki-repo/Business-Rules/` (one page per matched BUSINESS-RULES.md source)
- `/tmp/wiki-repo/Technical-Notes/` (one page per matched TECHNICAL-NOTES.md source)
- `/tmp/wiki-repo/Docs/` (one page per matched *.doc.md source)
- `/tmp/wiki-repo/Categories/` (optional category index pages like Components.md, Data.md)

Per generated page requirements:
- Use a stable title derived from source path (e.g., `src-components-docs-BUSINESS-RULES`).
- Include source attribution near the top (original repository path).
- Preserve technical details, constraints, and behavior from source documents.
- Add wiki-relative cross-links to related pages and category indexes.

Category index page requirements:
- For each category with at least one mapped document, create or overwrite `/tmp/wiki-repo/Categories/<Category>.md`.
- Render grouped sections: `## Business Rules`, `## Technical Notes`, and `## Docs` (only when present).
- Under each section, list links to the generated pages in `Business-Rules/`, `Technical-Notes/`, and `Docs/`.

Required rendering for components docs:
- Ensure source files mapped to Components appear in `/tmp/wiki-repo/Categories/Components.md`.
- Keep `Business Rules` and `Technical Notes` sections above general `Docs` entries in that page.
- Include links to the specific generated pages under `Business-Rules/` and `Technical-Notes/`.

Regenerate `/tmp/wiki-repo/Home.md` as a full table-of-contents:
- Brief project description
- Top-level links to `Business-Rules`, `Technical-Notes`, `Docs`, and `Categories`
- Table listing generated pages with one-sentence descriptions and source paths
- Tech-stack and project-layout summary when available from source docs

Home page coverage requirement:
- Explicitly mention that Components category includes Business Rules and Technical Notes sections when present.

Regenerate `/tmp/wiki-repo/_Sidebar.md`:
```bash
printf '## Wiki\n\n' > /tmp/wiki-repo/_Sidebar.md
printf -- '- [Home](Home)\n' >> /tmp/wiki-repo/_Sidebar.md
printf -- '- [Business Rules](Business-Rules)\n' >> /tmp/wiki-repo/_Sidebar.md
printf -- '- [Technical Notes](Technical-Notes)\n' >> /tmp/wiki-repo/_Sidebar.md
printf -- '- [Docs](Docs)\n' >> /tmp/wiki-repo/_Sidebar.md
printf -- '- [Categories](Categories)\n' >> /tmp/wiki-repo/_Sidebar.md
```

Also create index pages when content exists:
- `/tmp/wiki-repo/Business-Rules.md` linking all pages in `Business-Rules/`
- `/tmp/wiki-repo/Technical-Notes.md` linking all pages in `Technical-Notes/`
- `/tmp/wiki-repo/Docs.md` linking all pages in `Docs/`
- `/tmp/wiki-repo/Categories.md` linking all pages in `Categories/`

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
