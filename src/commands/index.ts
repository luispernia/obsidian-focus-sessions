import MyPlugin from "../main";
import { registerCommands as registerExampleCommands } from "./example-command";

export function registerAllCommands(plugin: MyPlugin) {
	registerExampleCommands(plugin);
}
