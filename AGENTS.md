# AGENTS.md — KiloFork AdventureLand

This repository is a downstream Adventure Land fork/adaptation. Preserve both the upstream lineage and the local fork boundary.

## Before editing

1. Read `START_HERE.md`.
2. Identify whether the behavior is inherited upstream or fork-specific.
3. Check the relevant upstream component when changing behavior that crosses the main-game/common/config split.
4. Keep secrets and runtime databases outside Git.
5. Work on focused branches and state what was actually tested.

## Lineage rules

- Preserve Adventure Land attribution and the repository's license.
- Do not rewrite history or documentation so the fork appears to have originated upstream work.
- Prefer small adaptation commits over wholesale divergence.
- If a change should reasonably live upstream, describe that relationship in the PR rather than silently redefining upstream behavior.

## Dependency boundaries

The documented upstream family includes the main MongoDB game, `common_engine`, and the secrets/config template. Their separation is part of the architecture.

Do not:

- copy live secrets/configuration into this repo;
- silently vendor an adjacent upstream tree;
- add GSV sibling repositories to runtime `require`/filesystem paths;
- use a production database to satisfy a local test.

## Database and execution safety

The local seed script is intentionally conservative. Keep its local-only, empty-database, explicit-confirmation semantics.

Changes involving:

- admin execution;
- authentication;
- payments;
- account/session data;
- Discord/platform integration;
- MongoDB mutation

require explicit negative controls and a clear local-vs-production statement.

## Evidence

Keep these distinct:

```text
source/lint check
!= unit test
!= local MongoDB integration
!= backend starts
!= game server starts
!= browser/game client interaction works
!= hosted/production behavior verified
```

Claim only the highest rung actually exercised.

## GSV wrapper

`.gsv/project.yaml` describes this fork's role in the wider lattice. It does not grant Kilo_Core or any wrapper ownership of Adventure Land gameplay, accounts, or upstream source.
