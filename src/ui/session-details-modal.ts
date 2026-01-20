import { App, Modal } from "obsidian";
import { mount, unmount } from "svelte";
import SessionDetails from "./components/SessionDetails.svelte";
import type { SessionManager } from "../services/session-manager";

export class SessionDetailsModal extends Modal {
	private sessionData: any;
	private sessionManager?: SessionManager;
	private component: ReturnType<typeof mount> | null = null;

	// Overload constructor to accept SessionManager if possible, or just accept it optionally
	// Existing calls might only pass app and sessionData (from session-history).
	// But we need SessionManager to fetch full context if it's not fully populated.
	// Actually, sessionData passed from SessionHistory comes from `history` array which probably lacks context.
	// So we should try to import plugin instance or pass sessionManager.

	constructor(app: App, sessionData: any, sessionManager?: SessionManager) {
		super(app);
		this.sessionData = sessionData;
		this.sessionManager = sessionManager;
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("session-details-modal");
		this.titleEl.innerText = "Session details";

		// Default to passed data
		let contextData = this.sessionData;

		// Check if we need to fetch full context
		// The list view usually provides a summary object.
		// Detailed context should have 'activity_logs' populated with 'timeline' etc.
		const needsFetch = !contextData.activity_logs || !contextData.git;

		if (needsFetch && this.sessionData.id && this.sessionManager) {
			const loadingEl = contentEl.createEl("div", {
				text: "Loading full context...",
				cls: "loading-msg",
				attr: { style: "padding: 20px; text-align: center; color: var(--text-muted);" },
			});

			try {
				const fullContext = await this.sessionManager.getSessionContext(this.sessionData.id as string);
				if (fullContext) {
					// Merge or replace. Usually fullContext is significantly richer.
					// If fullContext is just null (not found), we stick to what we have.
					contextData = fullContext;
				}
			} catch (e) {
				console.error("Failed to fetch context", e);
				contentEl.createEl("div", { text: "Error loading context.", cls: "error-msg" });
			} finally {
				loadingEl.remove();
			}
		}

		// @ts-ignore
		this.component = mount(SessionDetails, {
			target: contentEl,
			props: {
				session: contextData,
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
