import { App, Modal } from "obsidian";

export class SessionDetailsModal extends Modal {
	private sessionData: any;

	constructor(app: App, sessionData: any) {
		super(app);
		this.sessionData = sessionData;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.addClass("session-details-modal");
		contentEl.createEl("h2", { text: "Session details" });

		const pre = contentEl.createEl("pre");
		pre.createEl("code", {
			text: JSON.stringify(this.sessionData, null, 2),
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
