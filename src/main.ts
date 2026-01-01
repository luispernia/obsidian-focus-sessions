import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, TemplatePluginSettings, TemplateSettingTab } from "./settings";
import { registerAllCommands } from "./commands";
import { TEMPLATE_VIEW_TYPE, TemplateView } from "./ui/example-view";
import { WorkspaceLeaf } from "obsidian";

export default class ObsidianStarterPlugin extends Plugin {
	settings: TemplatePluginSettings;

	async onload() {
		await this.loadSettings();

		// Register commands from the commands module
		registerAllCommands(this);

		this.registerView(TEMPLATE_VIEW_TYPE, (leaf) => new TemplateView(leaf));

		this.addRibbonIcon("dice", "Activate template view", () => {
			void this.activateView();
		});

		// Add settings tab
		this.addSettingTab(new TemplateSettingTab(this.app, this));
	}

	onunload() {}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(TEMPLATE_VIEW_TYPE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0] as WorkspaceLeaf;
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
				await leaf.setViewState({ type: TEMPLATE_VIEW_TYPE, active: true });
			} else {
				// If no right leaf exists, create a new leaf in the main workspace
				leaf = workspace.getLeaf(true);
				await leaf.setViewState({ type: TEMPLATE_VIEW_TYPE, active: true });
			}
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf) {
			await workspace.revealLeaf(leaf);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
