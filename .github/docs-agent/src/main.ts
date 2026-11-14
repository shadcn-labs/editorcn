import { providerFromEnv, RunStatus } from "@intentlock/guard";
import { HybridGate } from "@intentlock/sdk";
import { z } from "zod";

import { githubClient, runDocsAgent } from "./agent.ts";
import type { GitHub } from "./agent.ts";

const Env = z.object({
  DOCS_AGENT_USER: z.email(),
  GITHUB_REPOSITORY: z.string().min(1),
  GITHUB_TOKEN: z.string().min(1),
  INTENTLOCK_API_KEY: z.string().min(1),
  INTENTLOCK_URL: z.url(),
  PR_NUMBER: z.coerce.number().int().positive(),
});

const env = Env.parse(process.env);
const gate = new HybridGate({
  apiKey: env.INTENTLOCK_API_KEY,
  baseUrl: env.INTENTLOCK_URL,
  onError: (err) =>
    console.log(
      `::warning::Intentlock: ${err instanceof Error ? (err.stack ?? err.message) : err}`
    ),
});

const gh: GitHub = githubClient(env.GITHUB_TOKEN);
const outcome = await runDocsAgent({
  gate,
  gh,
  onEvent: (e: {
    type: string;
    tool?: string;
    ruleId?: string | null;
    reason?: string;
  }) =>
    console.log([e.type, e.tool, e.ruleId, e.reason].filter(Boolean).join(" ")),
  pr: env.PR_NUMBER,
  provider: providerFromEnv(),
  repo: env.GITHUB_REPOSITORY,
  user: env.DOCS_AGENT_USER,
});

await gate
  .close()
  .catch((error: Error) =>
    console.log(`::warning::Audit flush failed: ${error.message}`)
  );

if (!outcome.ok) {
  console.log(`::error::Docs agent failed: ${outcome.error}`);
  process.exitCode = 1;
} else if (outcome.result.status === RunStatus.COMPLETED) {
  console.log(outcome.result.text ?? "Finished.");
} else {
  console.log(`Finished: ${outcome.result.status}`);
}
