import { App, Modal } from "obsidian";

export class TemplateModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah! This is a template modal.");

		contentEl.createEl("h2", { text: "Plugin stats" });
		contentEl.createEl("p", { text: "This plugin is active and running." });
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
