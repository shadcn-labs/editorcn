# Docs agent

When a PR that changes `packages/` is merged, this agent writes a changelog entry, updates the matching docs page if the public API changed, and opens a docs PR from `docs-agent/pr-<number>`. Every tool call is checked by [Intentlock](https://intentlock.space). Opening the PR is held until a maintainer approves it in the Intentlock inbox. The agent never merges anything.

## What it can do

| Tool                  | What it does                                                    |
| --------------------- | --------------------------------------------------------------- |
| `github_get_pr`       | Title, body (capped), author, merged state and merge date       |
| `github_get_pr_files` | Changed files with patches, capped per file and in total        |
| `repo_read_file`      | Read 4000 characters of a file from an offset, or list a folder |
| `git_create_branch`   | Create `docs-agent/pr-<n>` from `main`                          |
| `repo_write_file`     | Create a new docs file, or edit one with an exact find/replace  |
| `github_open_pr`      | Open the docs PR into `main`, linking the source PR             |

Existing files can only be edited with find/replace, never rewritten whole, so the model can't drop parts of a page it only read in part.

Limits come from two places:

- **The plan in `src/agent.ts`.** It pins this repo, this PR and its branch, and sets per-tool call counts: 5 writes and 1 PR.
- **`policy.yaml`.** It blocks writes outside `apps/web/content/docs/`, any branch other than `docs-agent/*`, and other repos, and holds `github_open_pr`.

The PR title, body and diff are treated as data, never instructions.

Trivial PRs are skipped:

- **Before the agent runs:** the workflow doesn't start for PRs that only change `package.json` or test files.
- **When the agent runs:** the model replies `SKIP: <reason>` for internal changes and writes nothing.

## Setup

1. **Intentlock.** Create an agent (e.g. `docs-agent`) and an API key. Push the policy: `intentlock policy push --agent docs-agent policy.yaml`. Give maintainers the `admin` or `approver` role so they can approve the held PR.
2. **Repository settings** (Settings → Secrets and variables → Actions):
   - Secrets: `INTENTLOCK_URL`, `INTENTLOCK_API_KEY`
   - Variable: `DOCS_AGENT_USER`, the Intentlock user email the agent runs as
3. **Actions permissions.** Settings → Actions → General → Workflow permissions: allow GitHub Actions to create pull requests.

The model is **GitHub Models** (`openai/gpt-4.1-mini`) with the built-in token, so no paid key is needed. To use the Gemini free tier instead, change the env in `.github/workflows/docs-agent.yaml`:

```yaml
LLM_BASE_URL: https://generativelanguage.googleapis.com/v1beta/openai/
LLM_MODEL: gemini-3.5-flash-lite
LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
```

## Running it

- **Automatically:** on every merged PR into `main` that touches `packages/**`.
- **Manually:** Actions → Docs agent → Run workflow → PR number.

## Notes

- The workflow uses `pull_request_target`, so PRs merged from forks still get a write token. It checks out only `.github/docs-agent` from `main` and never runs PR code.
- The job waits in Actions during the hold, up to 30 minutes. Pausing with a checkpoint (tristack's relay flow) is not set up yet.
- If the hold is rejected or times out, the `docs-agent/pr-<n>` branch is left behind. Delete it before running the agent again for that PR.
- PRs opened with the built-in token don't trigger CI. Close and reopen the docs PR to run checks.
- GitHub Models caps request size on the free tier, which is why the reads and patches are capped.
- Policy dry run: `intentlock policy test --agent docs-agent policy.yaml --calls calls.json`.
- Tests: `npm test` (FakeProvider, no network).
