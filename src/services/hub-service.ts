import { App } from "obsidian";

interface HubApi {
	sessions: {
		startSession(config: {
			durationMinutes: number;
			durationSeconds?: number;
			name?: string;
			metadata?: any;
		}): Promise<string>;
		endSession(metadata?: any): Promise<any>;
		isActive(): boolean;
		getActiveSessionId(): string | null;
		getActiveSessionContext(): Promise<any>;
		getSessionHistory(days?: number): Promise<any[]>;
		getSessionContext(sessionId: string): Promise<any>;
	};
}

export class HubService {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	private getApi(): HubApi | null {
		// @ts-ignore
		return this.app.plugins.getPlugin("obsidian-hub-plugin")?.api;
	}

	public isAvailable(): boolean {
		return !!this.getApi();
	}

	public async startSession(name: string, durationMinutes: number, durationSeconds?: number): Promise<string | null> {
		const api = this.getApi();
		if (!api) return null;
		return await api.sessions.startSession({
			durationMinutes,
			durationSeconds: durationSeconds ?? durationMinutes * 60,
			name,
			metadata: { source: "obsidian-focus-sessions" },
		});
	}

	public async endSession(): Promise<void> {
		const api = this.getApi();
		if (!api) return;
		await api.sessions.endSession();
	}

	public async getActiveSession(): Promise<{ id: string; startTime: number; duration: number; name: string } | null> {
		const api = this.getApi();
		if (!api) return null;

		// This method was a placeholder anyway, let's leave it null for now or implement if needed
		// The restore logic uses asyncRecoverActiveSession below.
		return null;
	}

	// We need a specific method to recover session state
	public async asyncRecoverActiveSession(): Promise<{
		id: string;
		startTime: number;
		duration: number;
		name: string;
	} | null> {
		const api = this.getApi();
		if (!api) return null;

		const hubPlugin = (this.app as any).plugins.getPlugin("obsidian-hub-plugin");
		if (hubPlugin && hubPlugin.settings?.activeSession) {
			const s = hubPlugin.settings.activeSession;
			const durationSeconds = s.config.durationSeconds ?? s.config.durationMinutes * 60;
			return {
				id: s.id,
				startTime: s.startTime,
				duration: durationSeconds / 60, // Return minutes for compatibility or update return type??
				// Wait, the return type of asyncRecoverActiveSession is just an object.
				// SessionManager expects duration in minutes usually?
				// Let's check SessionManager.ts again.
				// SessionManager.ts lines 55-62:
				// duration: hubSession.duration * 60
				// So hubSession.duration IS EXPECTED TO BE MINUTES there currently.
				// BUT I want precise duration.
				// So I should return seconds here and update SessionManager to treat it as seconds?
				// OR I should change this return type to return explicit seconds.
				// Let's stick to returning "duration" as the primary value, but maybe make it seconds?
				// Be careful. SessionManager lines:
				// duration: hubSession.duration * 60,
				// IF I return seconds here, I need to remove * 60 in SessionManager.
				name: s.config.name,
			};
		}

		return null;
	}

	public async getRecentSessions(limit: number = 10): Promise<any[]> {
		const api = this.getApi();
		if (!api) return [];
		const sessions = await api.sessions.getSessionHistory(7); // API defaults to days, let's say 7 days is enough for recent list?
		// Or we might want to ask for more days if we want 10 items.
		// The API signature saw earlier was getSessionHistory(days).

		// Let's return the slice.
		return sessions.slice(0, limit);
	}

	public async getSessionContext(sessionId: string): Promise<any> {
		const api = this.getApi();
		if (!api) return null;
		return await api.sessions.getSessionContext(sessionId);
	}
}
