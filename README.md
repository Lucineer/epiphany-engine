# Epiphany Engine

You ask one complex question. This engine splits it into 13 focused sub-questions, routes each to a specialized AI agent, and weaves the answers into a final synthesis. It runs on Cloudflare Workers with zero external dependencies.

**Live Demo:** [https://epiphany-engine.casey-digennaro.workers.dev](https://epiphany-engine.casey-digennaro.workers.dev)

## How It Works
Instead of asking one model to solve a multi-faceted problem, you submit a single question. The engine decomposes it, assigns each piece to a dedicated agent with a specific capability, runs them in parallel, and then synthesizes the results while preserving disagreements and trade-offs.

## Quick Start
1.  **Fork this repository.**
2.  Deploy to Cloudflare Workers.
3.  Create one KV namespace named `EPIPHANY_KV`.
4.  Set your `DEEPSEEK_API_KEY` as a secret.
5.  Edit the `FLEET_CAPS` configuration to modify the fleet's capabilities.

## Architecture
The system runs entirely on Cloudflare Workers. It uses KV for state persistence and has no npm dependencies, build steps, or external backend servers.

## Features
- **Problem Decomposition:** Breaks a complex question into 13 distinct sub-problems.
- **Capability Routing:** Each sub-problem is sent to an agent configured for a specific task.
- **Parallel Execution:** All agents operate concurrently.
- **Confidence Scoring:** Each partial answer includes a confidence estimate.
- **Neutral Synthesis:** The final step preserves gaps and trade-offs instead of smoothing them over.
- **State Persistence:** You can pause and resume sessions via KV storage.
- **Fork-First Design:** The entire fleet roster is defined in a single configuration file you control.
- **Security:** Implements strict CSP and input sanitization.

## What Makes It Different
1.  **No Generalist Bottleneck:** It uses 13 specialized agents instead of one model trying to do everything.
2.  **Honest Synthesis:** The final answer highlights disagreements and uncertainty between agents.
3.  **Full Control:** You can add, remove, or modify any agent by editing a few lines of configuration.

## A Specific Limitation
The decomposition logic is fixed and generates exactly 13 sub-questions. It cannot dynamically adjust the number or granularity of sub-problems based on your query's complexity.

## Open Source
MIT licensed. You can fork, modify, run privately, or build commercial projects on top of it.

Attribution: Superinstance and Lucineer (DiGennaro et al.)

<div style="text-align:center;padding:16px;color:#64748b;font-size:.8rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> &middot; <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>

---

<i>Built with [Cocapn](https://github.com/Lucineer/cocapn-ai) — the open-source agent runtime.</i>
<i>Part of the [Lucineer fleet](https://github.com/Lucineer)</i>

