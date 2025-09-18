# Reginald

A PC‑first mind‑map / second‑brain with tight AI integration. 

## Why
- Capture raw thoughts quickly, then refine and link them into a knowledge graph.
- PC‑first UX, later mobile companion.

## Tech (intended)
- Desktop: Tauri (Rust) + React + TypeScript
- Data: SQLite (bundled for local, zero‑admin)
- State/logic: TBD (Zustand/Redux), Vector/AI later
- Monorepo: TBD (single repo with packages)

## Getting started (dev)
1) Install: Node 20+, Rust (stable), pnpm or npm, Git.
2) Clone & checkout `main`.
3) Follow `CONTRIBUTING.md` for branch/commit rules.
4) Run dev (once scaffold exists): `pnpm dev` (placeholder for now).

## Working agreements
- Trunk‑based: short‑lived feature branches → PR → `main`.
- Conventional Commits for messages (see `CONTRIBUTING.md`).
- Every PR includes a brief test plan and screenshot if UI.

## Versioning & releases
- SemVer. First tag after a minimal demo: `v0.1.0`.
- Changelog: keep `CHANGELOG.md` updated per release.

## Roadmap (Block 1)
- [ ] Repo hygiene files (this PR)
- [ ] Tauri + React scaffold
- [ ] Minimal CI: lint, typecheck, test
- [ ] Decide monorepo structure
