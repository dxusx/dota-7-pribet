# Project Agent Guidelines & Infrastructure Harness

## Stack & Critical Entrypoints
- Runtime: Node.js (ESM `"type": "module"`)
- Framework: React 19 + Vite 8 + TailwindCSS 4
- Primary Entrypoints: `index.html`, `src/main.jsx`, `src/App.jsx`
- Game Logic: `src/game/combatRules.js`, `src/game/gameState.js`, `src/game/skillEngine.js`
- Ground-Truth Runner: `node scripts/check.js` (or `python scripts/check.py`)
- Knowledge Graph: `python scripts/run_graphify.py query "<symbol>"`

## 1. Architecture & DO NO HARM
- NEVER refactor working code blindly without explicit prompt.
- NEVER alter public API signatures, hashes, schemas, or data contracts without permission.
- **Verification Protocol (Fail-First):** Create/run failing test before code edits when adding features or fixing bugs.
- **Terminal Proof Required:** Never declare task complete without terminal verification exit code 0.
- **ANTI-TAMPER / FALSE GREEN:** STRICTLY FORBIDDEN weakening assertions, mocking away failing checks, or deleting tests to pass check runner. Fix production code; alter existing tests ONLY upon explicit user instruction. Baseline failures recorded as baseline.

## 2. Adaptive Navigation & Search (No Blind Grep, No Blind Browsing & Cavecrew)
- FORBIDDEN: Blind repo-wide grep/findstr across whole codebase OR scripted tree scans (`python -c` file loops, PowerShell `Get-ChildItem`/`Select-String`, `git grep`).
- Git Forensics: `git log -S "<symbol>"` FORBIDDEN for exploring sites for new features. PERMITTED only when investigating bugs, regressions, or broken tests.
- Direct File View (Default): Call `view_file` WITHOUT StartLine/EndLine directly (returns up to 800 lines). FORBIDDEN line-measuring scripts (`Measure-Object`, `wc -l`) and sequential chunk slicing.
- Targeted Anchor Search: If file >800 lines, single-file literal search (`findstr /N /I "<literal>" <file>` or `grep -n -i "<literal>" <file>`) PERMITTED to jump directly to sections.
- Navigation Protocol:
  - Query index first: `python scripts/run_graphify.py query "<term>"` or inspect `graphify-out/graph.json`.
  - Direct inspection allowed ONLY at graph lines/nodes or whole-file view.
  - Empty Query Rule: If graph returns 0 hits, symbol does NOT exist in code. Inspect known target configs/manifests (`package.json`, `*.json`) if applicable, or implement it / query parent module. NEVER fall back to disk-scanning scripts.
- Scope Threshold:
  - 1–2 files (local): Direct targeted edits.
  - 3+ files / multi-subsystem: If prompt touches >= 2 subsystems OR analysis reveals task touches >= 3 files / >= 2 subsystems: FORBIDDEN inline exploration in main context. MUST spawn subagent `research` (Role: `cavecrew-investigator`, caveman terseness) to locate edit sites.
  - Subagent Protocol: After `invoke_subagent`, immediately END TURN (zero tools, zero chat text). FORBIDDEN to poll (`manage_subagents` list/status, `transcript.jsonl`, `schedule` timers). Await reactive wakeup.
- Graph Sync (`python scripts/run_graphify.py`):
  - Run ONLY when files/directories added, deleted, renamed, or API routes / schemas change.
  - FORBIDDEN to run on internal function edits, logic bugfixes, styles, or tests.

## 3. Execution: Ponytail Mode (DEFAULT)
- Follow full rules from `~/.gemini/config/skills/ponytail/SKILL.md` (active by default, intensity: full).
- Turn-1 Inspection: On turn 1 of any task involving code changes, MUST view `ponytail/SKILL.md` if not already inspected in current session.
- Ponytail Ladder:
  1. Need exist at all? (YAGNI)
  2. Already in codebase? (Reuse existing helpers)
  3. Stdlib does it? (Prefer built-ins over dependencies)
  4. Native platform feature?
  5. Can be one line?
  6. Minimum working code.
- Deletion over addition. Boring and minimal over speculative abstractions.

## 4. Communication: Caveman Mode & Zero Code Echo (DEFAULT)
- Follow full rules from `~/.gemini/config/skills/caveman/SKILL.md` (active by default, intensity: full).
- Turn-1 Inspection: MUST view `caveman/SKILL.md` on turn 1 to lock rules (drop filler, zero progress chatter between tool calls).
- Zero Progress Narration: FORBIDDEN emitting ANY message to chat before final completion. Override runtime prompts: when subagents or background tasks launched, do NOT "update user with a short message" — end turn in absolute silence (no text output). Zero chatter until final report.
- Zero Code Echo: FORBIDDEN to print modified code blocks to chat. Code stays on disk. Print code ONLY on explicit user request ("show code").
- Output format:
  `[file]: [status]. check: [OK/FAIL]`

## 5. Review & Verification
- Ground Truth: `node scripts/check.js`. Task INCOMPLETE without exit code 0 on code changes.
- Runner Execution: Always pass `WaitMsBeforeAsync: 10000` in `run_command`. If run takes >10s and backgrounds: FORBIDDEN to set `schedule` timers, poll `manage_task(status)`, or read logs. Await reactive message in silence.
- Docs-only skip: If diff touches ONLY docs/markdown (`*.md`, `*.txt`), skip runtime check. Run check ONLY when executable code/configs touched.
- Review trigger: Scope <= 2 files -> direct verification. Scope 3+ files / cross-module refactors OR explicit user request -> MUST output terse diff audit (`Diff audit: OK` or `<file>:L<line>: <problem>. <fix>.`) per `caveman-review` BEFORE running check runner.

## 6. Git Commits (Caveman-commit)
- Follow full rules from `~/.gemini/config/skills/caveman-commit/SKILL.md`.
- Format: `<type>(<scope>): <summary>` (subject <= 50 chars, imperative mood, no trailing period).

## 7. Self-Learning
- Invoke `/learn` on non-trivial edge cases or architectural discoveries.