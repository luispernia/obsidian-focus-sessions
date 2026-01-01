import { ItemView, WorkspaceLeaf } from "obsidian";

export const TEMPLATE_VIEW_TYPE = "template-view";

export class TemplateView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return TEMPLATE_VIEW_TYPE;
	}

	getDisplayText() {
		return "Template view";
	}

	async onOpen() {
		const container = this.contentEl;
		container.empty();
		container.createEl("h4", { text: "Template view" });
		container.createEl("p", { text: "This is a template view in the side panel." });
	}

	async onClose() {
		// Nothing to clean up.
	}
}
