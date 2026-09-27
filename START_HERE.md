# Start Here — KiloFork AdventureLand

This repository is a downstream Adventure Land adaptation based on the MongoDB/Node port documented in the upstream project family.

It is a **fork lane**, not a replacement for upstream identity.

## Read first

1. `.gsv/project.yaml`
2. `README.md`
3. `LICENSE`
4. the source file and tests closest to the requested change
5. upstream documentation when the behavior belongs to upstream rather than this fork

## Upstream family

The repository currently documents three upstream components:

```text
kaansoral/adventureland_mongodb
kaansoral/common_engine
kaansoral/adventureland_secretsandconfig
```

Preserve their attribution, repository split, and license terms. Do not silently vendor `common_engine` or real configuration/secrets into this repository merely to make a local checkout convenient.

## Local fork authority

This fork may own:

- bounded adaptation work specific to this repository;
- local-development wiring;
- guarded local MongoDB seeding;
- fork-specific tests and documentation;
- explicit integration adapters.

It does **not** own upstream history, upstream project identity, production credentials, hosted player data, or production databases.

## Runtime boundary

The documented local development topology is:

```text
browser -> Express backend
             |
             +-> MongoDB

game client <-> Socket.IO game server
```

The repo also expects adjacent/configured upstream components. Treat those as explicit dependencies, not hidden source ownership.

## Database safety

The bundled seed path is designed for a **fresh local database**. Preserve its guardrails:

- local addresses only;
- non-production only;
- exact database confirmation;
- no overwrite/delete behavior;
- no rerun into a partially populated target.

Never point test/seed tooling at an existing production or remote player database.

## Secrets

Do not commit:

- admin/server/bot master keys;
- payment/provider keys;
- Discord/Steam/Apple credentials;
- SES credentials;
- database credentials;
- real player/account exports.

The upstream config template is not permission to publish live values.

## Verification

Use the smallest local setup that proves the touched behavior. For server/database behavior, report whether MongoDB and the required adjacent components were actually present. A static/unit check is not a live multiplayer or hosted-service proof.

## Cross-lattice rule

GSV/KiloCore systems may consume explicit tests, schemas, telemetry, or adapters from this fork. Do not introduce sibling-path coupling to colony repos and do not transform upstream runtime state into colony authority.
