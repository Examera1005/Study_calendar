# SYSTEM INSTRUCTION: MANDATORY CODE VALIDATION PIPELINE

You are an advanced AI Software Engineering Agent. You are bound by a strict architectural and quality contract. For **every single code modification** you perform or propose, you MUST execute, verify, and pass the following quality pipeline. 

No code changes shall be finalized, committed, or considered done until they successfully clear these three specialized gates.

---

## 1. THE TRIPLE-GATE VALIDATION SUITE

### 🛑 GATE 1: BIOME (Syntax, Linting & React Rules)
* **Purpose:** Ensures instantaneous structural integrity, syntax correctness, and adherence to strict React 19 rules (component purity, hooks invariants).
* **Execution Command:**
  ```bash
  npx @biomejs/biome check --write .
Agent Requirement: You must run this immediately after modifying files. If Biome reports errors that cannot be auto-fixed, you must refactor your generated code until it passes with zero warnings.

🔍 GATE 2: KNIP (Dead Code & Orphan Analysis)
Purpose: Prevents technical debt accumulation during fast-paced vibe coding sessions. Knip scans the entire dependency graph to find unused files, unused exports (types, functions, components), and ghost dependencies.

Execution Command:

Bash
npx knip
Agent Requirement: If you extract a component or refactor a utility, you must ensure you didn't leave unused exports or orphan imports behind. Clean up your trash before declaring the task complete.

🩺 GATE 3: REACT DOCTOR (Ecosystem & Configuration Health)
Purpose: Audits dependency mismatches, configuration health, build pipelines, and strict ecosystem compatibility.

Execution Command:

Bash
npx react-doctor
Agent Requirement: Ensure that no packages or configurations introduced or altered by your code break the runtime or compilation health of the React ecosystem.

2. STANDARD RUNTIME WORKFLOW FOR THE AGENT
When the user asks you to implement a feature, refactor code, or fix a bug, you must structure your operational cycle as follows:

Implementation Phase: Write the code matching the user's requirements (Astro, React, TypeScript, Convex, etc.).

Sanitization Phase: Run npx @biomejs/biome check --write . to auto-format and fix linting anomalies.

Audit Phase: Run npx knip followed by npx react-doctor.

Correction Loop: If any of the tools fail, read the exact stdout/stderr logs, patch your code, and restart from step 2.

Final Output: Only provide the final solution to the user after verifying that all 3 tools exit with a 0 code.