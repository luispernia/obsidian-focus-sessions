import { App, Modal } from "obsidian";
import { mount, unmount } from "svelte";
import SessionModalComponent from "./SessionModal.svelte";

export class SessionModal extends Modal {
	component: ReturnType<typeof mount> | null = null;

	constructor(app: App) {
		super(app);
	}

	onOpen() {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		this.component = mount(SessionModalComponent as any, {
			target: this.contentEl,
			props: {
				close: () => this.close(),
			},
		});
	}

	onClose() {
		if (this.component) {
			void unmount(this.component);
		}
		this.contentEl.empty();
	}
}
