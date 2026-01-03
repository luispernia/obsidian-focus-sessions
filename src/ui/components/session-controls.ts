import { setIcon } from "obsidian";
import { SessionManager } from "@/services/session-manager";

export class SessionControls {
	private container: HTMLElement;
	private sessionManager: SessionManager;
	private playBtn: HTMLElement | null = null;
	private onUpdate: () => void;

	constructor(container: HTMLElement, sessionManager: SessionManager, onUpdate: () => void) {
		this.container = container;
		this.sessionManager = sessionManager;
		this.onUpdate = onUpdate;
	}

	update() {
		if (!this.playBtn) return;
		const session = this.sessionManager.getActiveSession();
		const isRunning = session && session.status === "running";

		this.playBtn.empty();
		setIcon(this.playBtn, isRunning ? "pause" : "play");
	}

	render() {
		const controls = this.container.createDiv({ cls: "fs-controls" });

		// Reset Button
		const resetBtn = controls.createDiv({ cls: "fs-control-btn fs-secondary" });
		setIcon(resetBtn, "rotate-ccw");
		resetBtn.onclick = () => {
			this.sessionManager.resetSession();
		};

		// Play/Pause Button
		this.playBtn = controls.createDiv({ cls: "fs-control-btn fs-primary" });
		this.playBtn.onclick = () => {
			const session = this.sessionManager.getActiveSession();
			if (session) {
				if (session.status === "running") {
					this.sessionManager.pauseSession();
				} else {
					this.sessionManager.resumeSession();
				}
			} else {
				this.sessionManager.startSession("Deep Work");
			}
		};

		// Short Break Button
		const shortBreakBtn = controls.createDiv({ cls: "fs-control-btn fs-secondary" });
		shortBreakBtn.setAttribute("aria-label", "Short break");
		setIcon(shortBreakBtn, "coffee");
		shortBreakBtn.onclick = () => {
			this.sessionManager.stopSession(); // Ensure stopped first
			this.sessionManager.startSession("Short Break");
		};

		// Long Break Button
		const longBreakBtn = controls.createDiv({ cls: "fs-control-btn fs-secondary" });
		longBreakBtn.setAttribute("aria-label", "Long break");
		setIcon(longBreakBtn, "armchair"); // or another icon
		longBreakBtn.onclick = () => {
			this.sessionManager.stopSession();
			this.sessionManager.startSession("Long Break");
		};

		// Add Time Button (+5m)
		const addTimeBtn = controls.createDiv({ cls: "fs-control-btn fs-secondary" });
		addTimeBtn.setAttribute("aria-label", "Add 5m");
		setIcon(addTimeBtn, "plus");
		addTimeBtn.onclick = () => {
			this.sessionManager.addTime(5);
		};

		this.update();
	}
}
