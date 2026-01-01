import { App, PluginSettingTab, Setting } from "obsidian";
import ObsidianStarterPlugin from "./main";

export interface TemplatePluginSettings {
	dateFormat: string;
}

export const DEFAULT_SETTINGS: TemplatePluginSettings = {
	dateFormat: "YYYY-MM-DD",
};

export class TemplateSettingTab extends PluginSettingTab {
	plugin: ObsidianStarterPlugin;

	constructor(app: App, plugin: ObsidianStarterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Date format")
			.setDesc("M moment.js compatible date format")
			.addText((text) =>
				text
					// eslint-disable-next-line obsidianmd/ui/sentence-case
					.setPlaceholder("YYYY-MM-DD")
					.setValue(this.plugin.settings.dateFormat)
					.onChange(async (value) => {
						this.plugin.settings.dateFormat = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
