# Sportify repository instructions

## Git identity: tadeskops only

- Only the GitHub account `tadeskops` may perform any Git activity for this repository, including read-only Git commands, fetch, pull, branch operations, staging, commits, and pushes.
- User-approved automation exception: the repository's Pages workflow may read full Git history for photo first-addition metadata and use `github-actions[bot]` only to commit/push expired file removals under `assets/photos/`. This does not authorize bot changes to rules, configuration or other code. Scheduled cleanup publishes through the same workflow because bot-token pushes do not trigger a separate run.
- Before any Git command, verify the active github.com account with `gh api --hostname github.com user --jq .login`. Stop if it is not exactly `tadeskops` or verification fails. Always specify the hostname: this machine also uses an enterprise GitHub server. Do not silently switch accounts; obtain permission first.
- After verifying the account, check repository-local commit author name/email and remote before writes. Use a verified email belonging to `tadeskops`; do not guess an email or change global Git settings. Use HTTPS authentication explicitly backed by the verified account; do not rely on an unrelated credential or SSH key.
- The intended repository is `https://github.com/tadeskops/sportify`, branch `main`. Do not overwrite unrelated changes or force-push.
- Include the required Copilot co-author trailer in assistant-created commits.

## Persistent local exploration

- `temp/` holds design demos, session context, and validation artifacts. Keep it locally between sessions; it is not disposable cleanup.
- Never stage, force-add, commit, or deploy `temp/` or any of its contents. Keep `/temp/` in the root `.gitignore`.
- Read `temp/CONTEXT.md`, when present, before continuing design work, and update it with decisions, validation, and next steps. Never depend on chat history alone.
- Keep `REQUIREMENTS.md` current in the same change as any implementation or scope change. It is the tracked source of truth; local context complements it.

## Website

- Build a static, responsive, accessible rule-book website for GitHub Pages. Use relative asset links compatible with the `/sportify/` project path.
- Approved production designs are Clubhouse Gold dark and light. Implement production outside `temp/`; publish only the allowlisted `dist/` build. The workflow deploys `main` through GitHub Pages.
- Preserve the supplied football rules in their dedicated section, including timings, source attribution and original update date. General rules adapt relevant points and include WhatsApp joining, next-week planning, resident self-management and monthly booking rotation. Do not introduce new penalties or booking/payment features without approval.
- `config/site.js` is the public, validated feature configuration. Disabled features must disappear from relevant UI and not be re-enabled by saved preferences. Never put secrets or private resident information in this file.
- Use local assets, system fonts, native ES modules and dependency-free tests. No backend, third-party scripts or runtime framework is needed.
- Validate desktop/mobile layouts, keyboard navigation, sport switching, search, and local asset loading after UI changes. See `README.md` for local preview.
