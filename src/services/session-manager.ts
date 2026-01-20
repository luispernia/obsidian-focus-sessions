export interface FocusSession {
	name: string;
	duration: number; // duration in seconds
	startTime: number;
	status: "running" | "paused" | "completed";
	elapsed: number; // accumulated time in seconds
	lastResumed: number; // timestamp when last resumed/started
	isOvertime?: boolean;
}

import type { FocusSessionSettings } from "@/settings";
import { AudioService } from "@/services/audio-service";
import { getRemainingTime } from "@/utils/time-utils";
import type { HubService } from "./hub-service";
import { App } from "obsidian";

export class SessionManager {
	private activeSession: FocusSession | null = null;
	private listeners: (() => void)[] = [];
	private completionListeners: ((session: FocusSession, source?: string) => void)[] = [];
	private settings: FocusSessionSettings;
	private audioService: AudioService;
	private hubService: HubService;

	private customDuration: number;

	private app: App;

	constructor(app: App, settings: FocusSessionSettings, audioService: AudioService, hubService: HubService) {
		this.app = app;
		this.settings = settings;
		this.audioService = audioService;
		this.hubService = hubService;
		this.audioService.setEnabled(settings.enableSound !== false); // Default true if undefined
		this.customDuration = settings.focusDuration;

		// Attempt to restore session from Hub
		this.app.workspace.onLayoutReady(() => {
			void this.restoreSession();
		});
	}

	private async restoreSession() {
		// Retry a few times if Hub is not available immediately (race condition on load)
		// Even with onLayoutReady, other plugins might initialize async.
		for (let i = 0; i < 20; i++) {
			if (this.hubService.isAvailable()) {
				const hubSession = await this.hubService.asyncRecoverActiveSession();
				if (hubSession) {
					// Check if session is already completed in Hub (unlikely if activeSession is set)
					// Calculate elapsed based on startTime
					// Calculate elapsed based on startTime
					// If Hub session start time is in the future (drift?), handle gracefully? No, assume correct.

					this.activeSession = {
						name: hubSession.name || "Focus Session",
						duration: hubSession.duration * 60,
						startTime: hubSession.startTime,
						status: "running",
						elapsed: 0,
						lastResumed: hubSession.startTime,
					};
					// Check for immediate completion/overtime on restore
					// tick() will handle this on next interval, but we can set initial state
					const remaining = getRemainingTime(
						this.activeSession.duration,
						0, // elapsed is 0 relative to lastResumed=startTime
						"running",
						this.activeSession.startTime,
					);

					if (remaining <= 0) {
						this.activeSession.isOvertime = true;
					}

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
			await this.hubService.startSession(name, Math.ceil(duration / 60), duration);
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

	async stopSession(source?: string) {
		this.audioService.stopAlarm();
		if (this.activeSession) {
			this.activeSession.status = "completed";

			// Sync with Hub
			if (this.hubService.isAvailable()) {
				await this.hubService.endSession();
			}

			this.notifyCompletion(this.activeSession, source);
			this.activeSession = null;
			this.notifyListeners();
		}
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

			// If adding time to a completed or paused session, resume it
			if (this.activeSession.status === "completed" || this.activeSession.status === "paused") {
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

			if (remaining <= 0 && !this.activeSession.isOvertime) {
				this.activeSession.isOvertime = true;
				this.audioService.playComplete(true); // Loop: true
				this.notifyListeners();
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

	onSessionComplete(callback: (session: FocusSession, source?: string) => void) {
		this.completionListeners.push(callback);
	}

	removeListener(callback: () => void) {
		this.listeners = this.listeners.filter((l) => l !== callback);
	}

	private notifyListeners() {
		this.listeners.forEach((callback) => callback());
	}

	private notifyCompletion(session: FocusSession, source?: string) {
		this.completionListeners.forEach((callback) => callback(session, source));
	}
}
