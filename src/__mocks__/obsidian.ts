export class ItemView {
	public contentEl: HTMLElement;

	constructor(public leaf: any) {
		this.contentEl = document.createElement("div");
	}

	getViewType(): string {
		return "view";
	}

	getDisplayText(): string {
		return "View";
	}

	async onOpen(): Promise<void> {}
	async onClose(): Promise<void> {}
	addAction(icon: string, title: string, callback: (evt: MouseEvent) => any): void {}
}

export class WorkspaceLeaf {
	view: any;
}

export class Plugin {
	async loadData(): Promise<any> {
		return {};
	}
	async saveData(data: any): Promise<void> {}
	addRibbonIcon(icon: string, title: string, callback: (evt: MouseEvent) => any): void {}
	addStatusBarItem(): HTMLElement {
		return document.createElement("div");
	}
	registerView(type: string, viewCreator: any): void {}
	addCommand(command: any): void {}
	registerInterval(id: number): void {}
}

export class Notice {
	constructor(message: string, duration?: number) {}
}

export class TFile {
	basename: string;
	extension: string;
	path: string;
}

export class TFolder {}

export class Vault {
	on(event: string, callback: any): void {}
}

export class Component {
	onload(): void {}
	onunload(): void {}
	registerInterval(id: number): void {}
}
