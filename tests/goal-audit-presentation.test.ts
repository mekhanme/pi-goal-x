import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@earendil-works/pi-tui";
import { renderGoalAuditEvent, renderGoalResult, type GoalAuditEventDetails } from "../extensions/goal-format.ts";
import { parseAuditorDecision } from "../extensions/goal-auditor.ts";
import { auditReportForDisplay } from "../extensions/widgets/audit-presentation.ts";
import { deriveAuditResultCard, deriveAuditorDashboardModel } from "../extensions/widgets/auditor-dashboard-model.ts";
import { renderAuditResultCard } from "../extensions/widgets/goal-dashboard-renderer.ts";

const theme = { fg: (_color: string, value: string) => value, bold: (value: string) => value } as never;

test("compact event is Russian; expanded report remains accessible without service fields", () => {
	const raw = "Goal audit rejected.\nAuditor model: private/model\nGoal id: g1\n\nFull finding at line 42.\n<disapproved/>";
	const message = { content: raw, details: { phase: "rejected", goalId: "g1" } as GoalAuditEventDetails };
	const compact = renderGoalAuditEvent(message, { expanded: false }, theme).render(90).join("\n");
	assert.match(compact, /Результат.*Отклонено/);
	assert.match(compact, /Состояние/);
	assert.match(compact, /Далее/);
	assert.doesNotMatch(compact, /Full finding|Goal id|Auditor model|<disapproved/);
	const expanded = renderGoalAuditEvent(message, { expanded: true }, theme).render(90).join("\n");
	assert.match(expanded, /Подробный отчёт/);
	assert.match(expanded, /Full finding at line 42/);
	assert.doesNotMatch(expanded, /Goal id|Auditor model|<disapproved/);
	assert.equal(message.content, raw);
	assert.deepEqual(parseAuditorDecision(message.content), { approved: false, disapproved: true });
});

test("display strips inline tags but parser still demands exact final-line marker", () => {
	for (const [raw, approved, disapproved] of [
		["Verified\n<approved/>", true, false],
		["Missing evidence\n<disapproved/>", false, true],
		["Maybe <approved/> inline", false, false],
		["<approved/>\nMore text", false, false],
		["Unknown", false, false],
		["Malformed\n<approved />", false, false],
	] as const) {
		assert.deepEqual(parseAuditorDecision(raw), { approved, disapproved });
		assert.doesNotMatch(auditReportForDisplay(raw), /<(?:approved|disapproved)\s*\/>/);
	}
});

test("four results are distinct and unknown never receives success styling", () => {
	const rendered = new Set<string>();
	for (const verdict of ["approved", "disapproved", "error", "unknown"] as const) {
		const colors: string[] = [];
		const styled = { fg: (color: string, value: string) => { colors.push(color); return value; }, bold: (value: string) => value } as never;
		for (const width of [20, 40, 80, 140]) {
			const lines = renderAuditResultCard(deriveAuditResultCard(verdict, "report <approved/>"), styled, width);
			assert.ok(lines.every((line) => visibleWidth(line) <= width));
			if (width === 80) rendered.add(lines.join("\n"));
		}
		if (verdict === "unknown") assert.ok(!colors.includes("success"));
	}
	assert.equal(rendered.size, 4);
	const unknown = deriveAuditorDashboardModel({ phase: "done", elapsedMs: 0, recentOutput: [] });
	assert.equal(unknown.checks.find((check) => check.id === "decision")?.state, "pending");
	assert.ok(unknown.checks.every((check) => check.state === "pending"));
});

test("missing event phase is unknown rather than approved or started", () => {
	const text = renderGoalAuditEvent({ content: "<approved/>" }, { expanded: true }, theme).render(80).join("\n");
	assert.match(text, /Неизвестно/);
	assert.doesNotMatch(text, /<approved/);
});

test("tool result uses explicit phase without modifying machine content", () => {
	const result = { content: [{ type: "text", text: "Goal audit approved.\nDetailed proof\n<approved/>" }], details: { auditPhase: "approved" } };
	const compact = renderGoalResult(result, {}, theme).render(80).join("\n");
	assert.match(compact, /Одобрено/);
	assert.doesNotMatch(compact, /Detailed proof|approved\//);
	const expanded = renderGoalResult(result, { expanded: true }, theme).render(80).join("\n");
	assert.match(expanded, /Detailed proof/);
	assert.doesNotMatch(expanded, /<approved/);
	assert.equal(parseAuditorDecision(result.content[0]!.text).approved, true);
});
