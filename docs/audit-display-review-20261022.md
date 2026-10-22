# Audit display source review

Task: TASK-PI-GOAL-AUDIT-DISPLAY-20261022. Goal: mvjgpgl5-1jxzqz.

Owning repository: https://github.com/tmonk/pi-goal-x.git.
Base: 0dcc776a93f80897b7775534be20279a519b94b5, the configured local
consumer branch, not upstream main. Preserve its finite-budget consent fixes.
Worktree: /Users/mikh/rwx/projects/.worktrees/pi-goal-x/panelshchik/pi-audit-display-20261022.

Presentation uses explicit event/tool-result audit phases. Compact messages
and result cards show Russian result/state/next-action rows. Expanded audit
messages and tool results retain the full report, excluding service headers
and verdict tags. Raw message content, parser, and ledger are unchanged.
Unknown is neutral, including all checks in a finished undecided dashboard.
Error and unknown are explicit UI phases; the existing machine ledger schema
and completion acceptance condition are deliberately unchanged.

Validation:

```sh
npm run check
npm run lint
node --import ./scripts/test-adapter-hooks.mjs --experimental-strip-types --test tests/goal-audit-presentation.test.ts tests/goal-audit-dashboard.test.ts tests/goal-auditor.test.ts tests/goal-widget.test.ts tests/goal-deferred-archival.test.ts
git diff 0dcc776 -- extensions/goal-auditor.ts
```

125 focused tests passed. The last command must show no parser diff.
The broader core-tools file has 17 failures / 2 passes on both base and
this branch with the same adapter invocation. This is baseline debt, not a
passing full suite. No live runtime, agents, terminal changes, npm package
edits or provisioning performed. No visual/runtime acceptance claimed.

Publication: upstream permission reports push=false; fork creation through
the current credential returned HTTP 403. Local source commit is not remote
publication. Coordinator must arrange authorized source publication/review.
Provisioning belongs to Razvodyashchiy only after source review. Do not point
settings at this author worktree or replace the current consumer without GO.

Falsifiers: raw tags in compact or expanded UI, success styling for unknown,
changed machine verdicts, unavailable expanded report, terminal width overflow.
Rollback after an authorized rollout: restore the prior reviewed source pin;
never discard the base branch consent deltas by substituting npm upstream.

Overlap inquiry sent to Privratnik (518301d1), owner ACK pending. Existing
messenger/web and audit-bounds tasks remain with their owners. Footer
9cd619c9a awaits review GO, identity 37f3c70cb awaits QA, and Yazi visual
acceptance remains open.
