/** Presentation only: never pass sanitized text back to the verdict parser. */
export function auditReportForDisplay(report: string): string {
	return report.replace(/<(?:approved|disapproved)\s*\/>/gi, "")
		.split(/\r?\n/)
		.filter((line) => !/^(?:Goal id|Auditor model|Auditor error):/i.test(line.trim()))
		.filter((line) => !/^(?:Goal audit (?:approved|rejected)\.|Goal completion rejected by independent auditor\.|Auditor:)/i.test(line.trim()))
		.join("\n").trim();
}

export type DisplayAuditState = "approved" | "disapproved" | "error" | "unknown" | "started" | "skipped";

export function auditPresentation(state: DisplayAuditState): { result: string; state: string; next: string; color: "success" | "error" | "muted" | "accent" } {
	switch (state) {
		case "approved": return { result: "Одобрено", state: "Проверка пройдена", next: "Завершить цель", color: "success" };
		case "disapproved": return { result: "Отклонено", state: "Нужны исправления", next: "Исправить замечания", color: "error" };
		case "error": return { result: "Ошибка", state: "Проверка не выполнена", next: "Устранить ошибку и повторить аудит", color: "error" };
		case "started": return { result: "Проверяется", state: "Аудит выполняется", next: "Дождаться результата", color: "accent" };
		case "skipped": return { result: "Пропущено", state: "Без независимой проверки", next: "Проверить основания пропуска", color: "muted" };
		default: return { result: "Неизвестно", state: "Нет достоверного решения", next: "Повторить аудит", color: "muted" };
	}
}

export function auditTable(state: DisplayAuditState): string[] {
	const view = auditPresentation(state);
	return [`Результат | ${view.result}`, `Состояние | ${view.state}`, `Далее     | ${view.next}`];
}
