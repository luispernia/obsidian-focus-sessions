import { Editor, MarkdownView } from "obsidian";
import { TemplateModal } from "../ui/sample-modal";
import { getFormattedDate } from "../utils/helpers";
import ObsidianStarterPlugin from "../main";

export function registerCommands(plugin: ObsidianStarterPlugin) {
	plugin.addCommand({
		id: "insert-today-date",
		name: "Insert today's date",
		editorCallback: (editor: Editor, view: MarkdownView) => {
			const dateFormat = plugin.settings.dateFormat;
			const dateString = getFormattedDate(dateFormat);
			editor.replaceSelection(dateString);
		},
	});

	plugin.addCommand({
		id: "open-sample-modal",
		name: "Open template modal",
		callback: () => {
			new TemplateModal(plugin.app).open();
		},
	});
}
