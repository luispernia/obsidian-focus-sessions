export interface FocusSession {
	name: string;
	duration: number; // duration in seconds
	startTime: number;
	status: "running" | "paused" | "completed";
	elapsed: number; // accumulated time in seconds
	lastResumed: number; // timestamp when last resumed/started
}

import type { FocusSessionSettings } from "@/settings";
import { AudioService } from "@/services/audio-service";
import { getRemainingTime } from "@/utils/time-utils";
import type { HubService } from "./hub-service";

export interface FocusSession {
	name: string;
	duration: number; // duration in seconds
	startTime: number;
	status: "running" | "paused" | "completed";
	elapsed: number; // accumulated time in seconds
	lastResumed: number; // timestamp when last resumed/started
}

export class SessionManager {
	private activeSession: FocusSession | null = null;
	private listeners: (() => void)[] = [];
	private completionListeners: ((session: FocusSession) => void)[] = [];
	private settings: FocusSessionSettings;
	private audioService: AudioService;
	private hubService: HubService;

	private customDuration: number;

	constructor(settings: FocusSessionSettings, audioService: AudioService, hubService: HubService) {
		this.settings = settings;
		this.audioService = audioService;
		this.hubService = hubService;
		this.audioService.setEnabled(settings.enableSound !== false); // Default true if undefined
		this.customDuration = settings.focusDuration;

		// Attempt to restore session from Hub
		void this.restoreSession();
	}

	private async restoreSession() {
		// Retry a few times if Hub is not available immediately (race condition on load)
		for (let i = 0; i < 10; i++) {
			if (this.hubService.isAvailable()) {
				const hubSession = await this.hubService.asyncRecoverActiveSession();
				if (hubSession) {
					// Assume continuous running for now as Hub doesn't track pauses
					this.activeSession = {
						name: hubSession.name || "Focus Session",
						duration: hubSession.duration * 60,
						startTime: hubSession.startTime,
						status: "running",
						elapsed: 0,
						lastResumed: hubSession.startTime,
					};
					// console.log("[FocusSessions] Restored session from Hub:", this.activeSession);
					this.notifyListeners();
				}
				return;
			}
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}

	setCustomDuration(minutes: number) {
		this.customDuration = Math.max(1, minutes); // Minimum 1 minute
		this.notifyListeners();
	}

	getCustomDuration(): number {
		return this.customDuration;
	}

	async startSession(name: string, durationSeconds?: number) {
		const now = Date.now();
		let duration = durationSeconds;

		if (duration === undefined) {
			// Determine default duration based on name or default to focus duration
			if (name === "Short Break") {
				duration = this.settings.shortBreakDuration * 60;
			} else if (name === "Long Break") {
				duration = this.settings.longBreakDuration * 60;
			} else {
				duration = this.customDuration * 60;
			}
		}

		this.activeSession = {
			name,
			duration: duration,
			startTime: now,
			status: "running",
			elapsed: 0,
			lastResumed: now,
		};

		// Sync with Hub
		if (this.hubService.isAvailable()) {
			await this.hubService.startSession(name, Math.ceil(duration / 60));
		}

		this.audioService.playStart();
		this.notifyListeners();
	}

	pauseSession() {
		if (this.activeSession && this.activeSession.status === "running") {
			const now = Date.now();
			const elapsedSinceLastResume = Math.floor((now - this.activeSession.lastResumed) / 1000);
			this.activeSession.elapsed += elapsedSinceLastResume;
			this.activeSession.status = "paused";
			this.audioService.playPause();
			this.notifyListeners();

			// Note: Hub doesn't support pause yet, so we don't notify it.
		}
	}

	resumeSession() {
		if (this.activeSession && this.activeSession.status === "paused") {
			this.activeSession.status = "running";
			this.activeSession.lastResumed = Date.now();
			this.audioService.playResume();
			this.notifyListeners();
		}
	}

	async stopSession() {
		this.audioService.stopAlarm();
		this.activeSession = null;

		// Sync with Hub
		if (this.hubService.isAvailable()) {
			await this.hubService.endSession();
		}

		this.notifyListeners();
	}

	resetSession() {
		if (this.activeSession) {
			this.audioService.stopAlarm();
			const now = Date.now();
			this.activeSession.elapsed = 0;
			this.activeSession.lastResumed = now;
			this.activeSession.startTime = now; // Technically a new start
			this.activeSession.status = "running";
			this.notifyListeners();

			// For Hub, this is tricky. We should probably restart the session there too if we want accurate logs.
			// But for now keeping it simple. Maybe todo for later.
		}
	}

	addTime(minutes: number) {
		if (this.activeSession) {
			this.activeSession.duration += minutes * 60;

			// If adding time to a completed session, resume it
			if (this.activeSession.status === "completed") {
				this.audioService.stopAlarm();
				this.activeSession.status = "running";
				this.activeSession.lastResumed = Date.now();
			}

			this.notifyListeners();
		}
	}

	tick() {
		if (this.activeSession && this.activeSession.status === "running") {
			const remaining = getRemainingTime(
				this.activeSession.duration,
				this.activeSession.elapsed,
				this.activeSession.status,
				this.activeSession.lastResumed,
			);

			if (remaining <= 0) {
				void this.completeSession();
			}
		}
	}

	private async completeSession() {
		if (this.activeSession) {
			// Capture session reference before nulling it (though we just change status here)
			const session = this.activeSession;

			session.status = "completed";
			this.audioService.playComplete(true); // Loop: true
			this.notifyListeners();
			this.notifyCompletion(session);

			// Sync with Hub - End the session
			if (this.hubService.isAvailable()) {
				await this.hubService.endSession();
			}
		}
	}

	getActiveSession(): FocusSession | null {
		return this.activeSession;
	}

	async getSessionHistory(limit: number = 10): Promise<any[]> {
		if (!this.hubService.isAvailable()) return [];
		return this.hubService.getRecentSessions(limit);
	}

	onChange(callback: () => void) {
		this.listeners.push(callback);
	}

	onSessionComplete(callback: (session: FocusSession) => void) {
		this.completionListeners.push(callback);
	}

	removeListener(callback: () => void) {
		this.listeners = this.listeners.filter((l) => l !== callback);
	}

	private notifyListeners() {
		this.listeners.forEach((callback) => callback());
	}

	private notifyCompletion(session: FocusSession) {
		this.completionListeners.forEach((callback) => callback(session));
	}
}
