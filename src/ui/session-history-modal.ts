import { App, Modal } from "obsidian";
import { mount, unmount } from "svelte";
import AllSessionsModalContent from "./components/AllSessionsModal.svelte";
import type { SessionManager } from "../services/session-manager";

export class SessionHistoryModal extends Modal {
	private component: ReturnType<typeof mount> | null = null;
	private sessionManager: SessionManager;

	constructor(app: App, sessionManager: SessionManager) {
		super(app);
		this.sessionManager = sessionManager;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		this.titleEl.innerText = "All sessions";
		this.modalEl.addClass("fs-sessions-modal");

		// @ts-ignore
		this.component = mount(AllSessionsModalContent, {
			target: contentEl,
			props: {
				sessions: this.sessionManager,
			},
		});
	}

	onClose() {
		if (this.component) {
			void unmount(this.component);
		}
		const { contentEl } = this;
		contentEl.empty();
	}
}
