import { App, Modal } from "obsidian";
import { mount, unmount } from "svelte";
import TestSvelteModal from "./components/TestSvelteModal.svelte";

export class SvelteModal extends Modal {
	component: ReturnType<typeof mount> | null = null;

	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		this.component = mount(TestSvelteModal as any, {
			target: contentEl,
			props: {
				app: this.app,
			},
		});
	}

	onClose() {
		const { contentEl } = this;
		if (this.component) {
			void unmount(this.component);
		}
		contentEl.empty();
	}
}
