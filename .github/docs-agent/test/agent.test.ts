import { readFileSync } from "node:fs";

import {
  ClientBlockReason,
  generateSigningKeyPair,
  parsePolicy,
  Verdict,
} from "@intentlock/core";
import type { GateDecision, PolicySet, ToolCall } from "@intentlock/core";
import { EventType, FakeProvider } from "@intentlock/guard";
import type {
  ChatResponse,
  FakeStep,
  GuardEvent,
  ToolCallReq,
} from "@intentlock/guard";
import { HybridGate, LocalGate } from "@intentlock/sdk";
import type { Gate, HoldOutcome } from "@intentlock/sdk";
import { describe, expect, test } from "vitest";

import {
  AGENT_BRANCH,
  DOCS_PATH,
  runDocsAgent,
  titleDate,
} from "../src/agent.ts";
import type { GitHub } from "../src/agent.ts";

const REPO = "shadcn-labs/editorcn";
const USER = "docs-agent@editorcn.dev";
const PR = 80;
const BRANCH = "docs-agent/pr-80";
const CHANGELOG = "apps/web/content/docs/changelog/2026-10-27-link-target.mdx";
const INDEX = "apps/web/content/docs/changelog/index.mdx";
const LINK_DOCS = "apps/web/content/docs/editor/link.mdx";

const loadPolicy = (): PolicySet => {
  const parsed = parsePolicy(
    readFileSync(new URL("../policy.yaml", import.meta.url), "utf-8")
  );
  if (!parsed.ok) {
    throw new Error(JSON.stringify(parsed.errors));
  }
  return parsed.policy;
};

const { privateKey } = await generateSigningKeyPair();

const gateOptions = () => ({
  policies: loadPolicy(),
  privateKey,
  users: { [USER]: { role: "member" as const } },
});
const localGate = () => new LocalGate(gateOptions());

class HoldingGate extends LocalGate {
  readonly outcome: HoldOutcome;

  constructor(outcome: HoldOutcome) {
    super(gateOptions());
    this.outcome = outcome;
  }

  override async check(token: string, call: ToolCall): Promise<GateDecision> {
    const d = await super.check(token, call);
    if (
      d.verdict !== Verdict.BLOCK ||
      d.reason !== ClientBlockReason.HOLD_REQUIRES_SERVER
    ) {
      return d;
    }
    return {
      approvers: { emails: [], roles: [], self: false },
      holdId: `hold-${call.callId}`,
      planStep: 0,
      ruleId: d.ruleId ?? "",
      timeoutSeconds: 1800,
      verdict: Verdict.HOLD,
    };
  }

  override waitForHold(): Promise<HoldOutcome> {
    return Promise.resolve(this.outcome);
  }
}

const b64 = (s: string) => Buffer.from(s, "utf-8").toString("base64");
const INDEX_TEXT = `---
title: Changelog
description: Latest updates and announcements for editorcn.
---

## September 30, 2026 - Icon library presets
`;

interface Call {
  method: string;
  path: string;
  body?: Record<string, unknown>;
}

const fakeGitHub = (files: string[]) => {
  const calls: Call[] = [];
  const store = new Map<string, string>([
    [`main:${INDEX}`, INDEX_TEXT],
    [`main:${LINK_DOCS}`, "## Props\n\n| `openOnClick` | boolean |\n"],
  ]);
  const branches = new Set(["main"]);
  const respond = (
    method: string,
    path: string,
    body?: Record<string, unknown>
  ): unknown => {
    calls.push({ method, path, ...(body !== undefined && { body }) });
    const url = new URL(`https://x${path}`);
    const contents = /^\/repos\/[^/]+\/[^/]+\/contents\/(.+)$/.exec(
      url.pathname
    );
    if (contents?.[1]) {
      const file = decodeURIComponent(contents[1]);
      const ref = String(body?.branch ?? url.searchParams.get("ref"));
      if (method === "PUT") {
        store.set(
          `${ref}:${file}`,
          Buffer.from(String(body?.content), "base64").toString("utf-8")
        );
        return { content: {} };
      }
      const text =
        store.get(`${ref}:${file}`) ??
        (branches.has(ref) ? store.get(`main:${file}`) : undefined);
      return text === undefined
        ? null
        : { content: b64(text), sha: "sha1", type: "file" };
    }
    if (path.endsWith("/git/ref/heads/main")) {
      return { object: { sha: "abc" } };
    }
    if (path.endsWith("/git/refs")) {
      branches.add(String(body?.ref).replace("refs/heads/", ""));
      return {};
    }
    if (path.endsWith("/pulls")) {
      return { html_url: "https://gh/pull/81" };
    }
    if (path.includes("/files")) {
      return files.map((filename) => ({
        additions: 3,
        deletions: 1,
        filename,
        patch: "+  target?: string",
        status: "modified",
      }));
    }
    return {
      body: "Adds a target prop.",
      html_url: "https://gh/pull/80",
      merged: true,
      merged_at: "2026-10-27T10:00:00Z",
      number: PR,
      title: "feat(editor): link target prop",
      user: { login: "contributor" },
    };
  };
  const writes = () => calls.filter((c) => c.method !== "GET");
  const gh: GitHub = (method, path, body) =>
    Promise.resolve(respond(method, path, body));
  const file = (ref: string, path: string) => store.get(`${ref}:${path}`);
  return { calls, file, gh, writes };
};

const call = (
  id: string,
  name: string,
  args: ToolCallReq["args"]
): ToolCallReq => ({ args, id, name });
const turn = (...toolCalls: ToolCallReq[]): ChatResponse => ({ toolCalls });
const done = (text = "Done."): ChatResponse => ({ text, toolCalls: [] });
const prArgs = { number: PR, repo: REPO };
const onBranch = { branch: BRANCH, repo: REPO };

const ENTRY = `---
title: "October 27, 2026 - Link target"
description: "The link extension accepts a target prop."
date: "2026-10-27"
---

Links can now open in a new tab.

## Highlights

- **\`target\` prop** — set \`target="_blank"\` on the link extension.

See the [Link docs](/docs/editor/link).
`;

const run = async (
  script: FakeStep[],
  gate: Gate,
  files = ["packages/editor/src/link.tsx"]
) => {
  const github = fakeGitHub(files);
  const events: GuardEvent[] = [];
  const provider = new FakeProvider(script);
  const outcome = await runDocsAgent({
    gate,
    gh: github.gh,
    onEvent: (e) => events.push(e),
    pr: PR,
    provider,
    repo: REPO,
    user: USER,
  });
  await gate.close();
  return { ...github, events, outcome, provider };
};

const blocks = (events: GuardEvent[]) =>
  events
    .filter((e) => e.type === EventType.BLOCK)
    .map((e) => [e.tool, e.ruleId ?? e.reason])
    .toSorted();

const featureScript = (): FakeStep[] => [
  turn(
    call("c1", "github_get_pr", prArgs),
    call("c2", "github_get_pr_files", prArgs)
  ),
  turn(
    call("c3", "repo_read_file", {
      path: "apps/web/content/docs/changelog",
      repo: REPO,
    }),
    call("c4", "repo_read_file", { path: LINK_DOCS, repo: REPO })
  ),
  turn(call("c5", "git_create_branch", onBranch)),
  turn(
    call("c6", "repo_write_file", {
      ...onBranch,
      content: ENTRY,
      message: "docs: changelog for #80",
      path: CHANGELOG,
    }),
    call("c7", "repo_write_file", {
      ...onBranch,
      find: "editorcn.\n---\n",
      message: "docs: changelog index",
      path: INDEX,
      replace:
        "editorcn.\n---\n\n## October 27, 2026 - Link target\n\nNew `target` prop. See the [full entry](/docs/changelog/2026-10-27-link-target).\n",
    }),
    call("c8", "repo_write_file", {
      ...onBranch,
      find: "| `openOnClick` | boolean |\n",
      message: "docs: link target prop",
      path: LINK_DOCS,
      replace: "| `openOnClick` | boolean |\n| `target` | string |\n",
    })
  ),
  turn(
    call("c9", "github_open_pr", {
      ...onBranch,
      body: "Changelog entry and Link docs for the new target prop.",
      title: "docs: Link target",
    })
  ),
  done(),
];

describe("feature PR", () => {
  test("writes the docs on the agent branch and opens the PR after approval", async () => {
    const r = await run(featureScript(), new HoldingGate("approved"));
    expect(r.outcome.ok).toBeTruthy();
    expect(blocks(r.events)).toStrictEqual([]);
    expect(
      r.events.filter((e) => e.type === EventType.HOLD).map((e) => e.ruleId)
    ).toStrictEqual(["hold-open-pr"]);

    expect(r.file(BRANCH, CHANGELOG)).toBe(ENTRY);
    expect(r.file(BRANCH, INDEX)).toContain(
      "---\n\n## October 27, 2026 - Link target\n"
    );
    expect(r.file(BRANCH, INDEX)).toContain("## September 30, 2026");
    expect(r.file(BRANCH, LINK_DOCS)).toContain("| `target` | string |");
    expect(r.file("main", INDEX)).toBe(INDEX_TEXT);

    const pr = r.writes().find((c) => c.path.endsWith("/pulls"));
    expect(pr?.body).toMatchObject({
      base: "main",
      body: expect.stringMatching(/^Docs for #80\./),
      head: BRANCH,
    });
    expect(
      r
        .writes()
        .filter((c) => c.method === "PUT")
        .every((c) => c.body?.branch === BRANCH)
    ).toBeTruthy();
  });

  test("a rejected PR is never opened", async () => {
    const r = await run(featureScript(), new HoldingGate("rejected"));
    expect(r.events.filter((e) => e.type === EventType.REJECTED)).toHaveLength(
      1
    );
    expect(r.writes().some((c) => c.path.endsWith("/pulls"))).toBeFalsy();
  });

  test("the plan comes from code, never from the model", async () => {
    const r = await run(featureScript(), localGate());
    const offered = r.provider.requests.flatMap((req) =>
      req.tools.map((t) => t.name)
    );
    expect(offered).not.toContain("declare_plan");
  });

  test("a whole-file rewrite of an existing page is refused", async () => {
    const r = await run(
      [
        turn(call("c1", "git_create_branch", onBranch)),
        turn(
          call("c2", "repo_write_file", {
            ...onBranch,
            content: "truncated",
            message: "docs",
            path: LINK_DOCS,
          })
        ),
        done(),
      ],
      localGate()
    );
    expect(r.file(BRANCH, LINK_DOCS)).toBeUndefined();
    expect(r.writes().some((c) => c.method === "PUT")).toBeFalsy();
  });
});

describe("trivial PR", () => {
  test("a deps-only PR is skipped without writes", async () => {
    const r = await run(
      [
        turn(
          call("c1", "github_get_pr", prArgs),
          call("c2", "github_get_pr_files", prArgs)
        ),
        done("SKIP: dependency bump only"),
      ],
      localGate(),
      ["packages/editor/package.json"]
    );
    expect(r.outcome.ok && r.outcome.result.text).toBe(
      "SKIP: dependency bump only"
    );
    expect(r.writes()).toStrictEqual([]);
  });
});

describe("prompt injection in the PR", () => {
  test("writes outside docs, to main, to other repos and unknown tools are blocked", async () => {
    const r = await run(
      [
        turn(call("c1", "github_get_pr", prArgs)),
        turn(call("c2", "git_create_branch", onBranch)),
        turn(
          call("c3", "repo_write_file", {
            ...onBranch,
            content: "evil",
            message: "x",
            path: "packages/editor/src/index.ts",
          }),
          call("c4", "repo_write_file", {
            branch: "main",
            content: "x",
            message: "x",
            path: CHANGELOG,
            repo: REPO,
          }),
          call("c5", "git_create_branch", { branch: "main", repo: REPO }),
          call("c6", "github_get_pr", {
            number: 1,
            repo: "shadcn-labs/private",
          }),
          call("c7", "github_merge_pr", { number: PR, repo: REPO })
        ),
        done(),
      ],
      localGate()
    );
    expect(r.outcome.ok).toBeTruthy();
    expect(blocks(r.events)).toStrictEqual([
      ["git_create_branch", "not_in_plan"],
      ["github_get_pr", "not_in_plan"],
      ["github_merge_pr", "unknown_tool"],
      ["repo_write_file", "not_in_plan"],
      ["repo_write_file", "not_in_plan"],
    ]);
    expect(r.writes().filter((c) => c.method === "PUT")).toStrictEqual([]);
    expect(r.calls.every((c) => c.path.includes(REPO))).toBeTruthy();
  });

  test("the policy still blocks them when the plan is loose", async () => {
    const gate = localGate();
    const { token } = await gate.signPlan({
      goal: "Loose plan",
      steps: [
        { tool: "github_get_pr" },
        { tool: "repo_write_file" },
        { tool: "git_create_branch" },
        { tool: "github_open_pr" },
      ],
      user: USER,
      version: 1,
    });
    const calls = JSON.parse(
      readFileSync(new URL("../calls.json", import.meta.url), "utf-8")
    ) as { call: ToolCall }[];
    const verdicts = await Promise.all(
      calls.map(async ({ call: c }) => {
        const d = await gate.check(token, c);
        return d.verdict === Verdict.BLOCK ? d.ruleId : d.verdict;
      })
    );
    expect(verdicts).toStrictEqual([
      Verdict.ALLOW,
      "write-docs-only",
      "write-docs-only",
      "agent-branch-only",
      "agent-branch-only",
      "only-editorcn",
      "hold-open-pr",
    ]);
  });
});

describe("Intentlock server unreachable", () => {
  test("fails closed: no GitHub calls and no throw", async () => {
    const gate = new HybridGate({
      apiKey: "il_live_test",
      baseUrl: "http://127.0.0.1:9/api",
      fetch: () => Promise.reject(new TypeError("fetch failed")),
      handleSignals: false,
      outboxDir: null,
    });
    const r = await run(featureScript(), gate);
    expect(r.outcome.ok).toBeFalsy();
    expect(r.calls).toStrictEqual([]);
  });
});

describe("policy", () => {
  test("the policy and the tools allow the same paths and branches", () => {
    const { rules } = loadPolicy();
    expect(
      rules.find((rule) => rule.id === "write-docs-only")?.except?.args?.path
    ).toStrictEqual({ regex: DOCS_PATH });
    expect(
      rules.find((rule) => rule.id === "agent-branch-only")?.except?.args
        ?.branch
    ).toStrictEqual({ regex: AGENT_BRANCH });
  });

  test("changelog title date", () => {
    expect(titleDate("2026-10-03T23:59:00Z")).toBe("October 3, 2026");
  });
});
