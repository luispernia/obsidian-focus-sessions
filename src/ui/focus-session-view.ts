import { ItemView, WorkspaceLeaf } from "obsidian";
import { mount, unmount } from "svelte";
import { SessionManager } from "@/services/session-manager";
import FocusSessionViewComponent from "./FocusSessionView.svelte";

export const FOCUS_SESSION_VIEW_TYPE = "focus-session-view";

export class FocusSessionView extends ItemView {
	private sessionManager: SessionManager;
	private pluginVersion: string;
	component: ReturnType<typeof mount> | null = null;

	constructor(leaf: WorkspaceLeaf, sessionManager: SessionManager, pluginVersion: string) {
		super(leaf);
		this.sessionManager = sessionManager;
		this.pluginVersion = pluginVersion;
	}

	getViewType() {
		return FOCUS_SESSION_VIEW_TYPE;
	}

	getDisplayText() {
		return "Focus sessions";
	}

	async onOpen() {
		const container = this.contentEl;
		container.empty();
		container.addClass("focus-session-view");

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		this.component = mount(FocusSessionViewComponent as any, {
			target: container,
		});
	}

	async onClose() {
		if (this.component) {
			void unmount(this.component);
		}
	}
}
