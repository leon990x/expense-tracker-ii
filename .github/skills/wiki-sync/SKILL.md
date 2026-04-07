---
name: wiki-sync
description: Syncs internal .docs.md files to the actual GitHub Wiki repository.
---
# Wiki Sync Protocol

1. **Clone the Wiki Repo:** The agent must clone the hidden wiki repo located at `[CURRENT_REPO_URL].wiki.git`.
2. **Scan Source:** Find all `*.docs.md` files in the current codebase branch.
3. **Transfer Content:** - Copy each `*.docs.md` to the root of the cloned Wiki repo.
   - Rename them to a clean format (e.g., `Auth-Service.md`).
4. **Update Sidebar:** - Open (or create) `_Sidebar.md` in the Wiki repo.
   - Generate a Markdown list of links to every `.md` file now in the Wiki.
5. **Commit & Push:** Commit these changes to the Wiki's `master` branch and push.
