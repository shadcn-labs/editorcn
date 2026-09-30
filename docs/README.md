# editorcn — internal documentation

This folder is the maintainer-and-agent-facing documentation for the `editorcn` monorepo. It is **not published** to editorcn.vercel.app. The user-facing documentation lives in [`apps/web/content/docs`](../apps/web/content/docs) and ships with the website.

| Document                             | What it answers                                                                                            | Read it when                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [PRD.md](./PRD.md)                   | What the product is, who it is for, what is in and out of scope, and the requirements it must keep meeting | You need the "why" before touching scope, or you are judging whether a feature request fits              |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | How the repo, packages, build pipeline, registry and docs site actually work                               | You are changing a package, the registry output, or the styling contract                                 |
| [CONTEXT.md](./CONTEXT.md)           | The working knowledge: commands, conventions, and the gotchas that cost us time                            | Before your first change in this repo, and whenever something behaves in a way the code does not explain |
| [ROADMAP.md](./ROADMAP.md)           | What is done, what is open, and the known debt we have chosen not to fix yet                               | You want to pick up work, or you need to know whether something is already known                         |
| [DECISIONS.md](./DECISIONS.md)       | The non-obvious choices we made and their consequences, ADR-style                                          | You are about to "fix" something that looks wrong but was decided on purpose                             |

## How these documents relate to each other

- [`JOURNAL.md`](../JOURNAL.md) at the repo root is the **chronological** log of what happened in a session, including dead ends and corrections. Everything in `DECISIONS.md` and much of `ROADMAP.md` was distilled from it.
- [`CONTRIBUTING.md`](../CONTRIBUTING.md) is the process contract: how to get set up, how to land a PR, the DCO sign-off.
- [`README.md`](../README.md) is the public front door.
- `apps/web/content/docs` is the user contract. If you change user-facing behavior, that is the doc that must change with it.

## When to update what

| Change you made                                                                       | Docs to update                                                          |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Added/removed/renamed a package, changed an export map, or changed the build pipeline | `ARCHITECTURE.md`, and `CONTEXT.md` if it changes a command             |
| Shipped or finished a chunk of work                                                   | `ROADMAP.md` (status), plus a `JOURNAL.md` entry for the session        |
| Made a choice that a future reader would otherwise "fix"                              | `DECISIONS.md` (new entry, status `accepted`)                           |
| Changed user-facing behavior, classes, tokens, or install steps                       | `apps/web/content/docs` (the user docs), not these files                |
| Hit a non-obvious bug                                                                 | `CONTEXT.md` gotchas section, so the next person does not rediscover it |
| Found drift but did not fix it                                                        | `ROADMAP.md` known debt, with the file path                             |

## Conventions used in this folder

- **Cite, do not assert.** Claims carry a file path, and where useful a line number. If you cannot cite it, either verify it or mark it as an assumption.
- **Facts over aspiration.** `PRD.md` separates what the product requires today from open questions; it does not describe a wish list as if it shipped.
- **Time-stamped.** Each document carries a "Last verified" date. Stale docs are worse than absent ones — bump the date when you re-verify, and say so in the diff when a claim is no longer true.
