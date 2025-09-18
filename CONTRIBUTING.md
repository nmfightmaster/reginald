# Contributing

## Branch strategy
- Trunk‑based. `main` is always releasable.
- Name branches like:
  - `feat/staging-area`
  - `fix/tauri-build`
  - `chore/ci-setup`

## Commit convention (Conventional Commits)
Format: `type(scope)!: short summary`

**Types**
- `feat`: user‑visible feature
- `fix`: bug fix
- `docs`: docs only
- `chore`: tooling/config
- `refactor`: internal code change
- `test`: adding/fixing tests
- `build`: build system changes
- `ci`: CI changes

**Examples**
- `feat(staging): add inbox panel for quick capture`
- `fix(auth): handle PKCE state mismatch`
- `refactor(ui): extract StatusBar component`
- `ci: add node + rust workflow for PRs`

Use the body for details and “why”; link issues when relevant.

## Pull requests
- Small, focused PRs.
- Include:
  - **Summary**: what/why
  - **Test plan**: steps or command outputs
  - **Screenshots** if UI impacted
  - **Risk & rollback**: what to do if we revert
- Squash‑merge to keep history clean.

## CI expectations
- PRs must pass: lint, typecheck, tests (fast feedback).
- Keep the build < 5 minutes.

## Releases
- Tag with SemVer: `vMAJOR.MINOR.PATCH`.
- Update `CHANGELOG.md` when tagging.
- Breaking changes require `!` in the commit subject, e.g. `feat(api)!: ...`.
