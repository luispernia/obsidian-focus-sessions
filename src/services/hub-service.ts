import { App } from "obsidian";

interface HubApi {
	sessions: {
		startSession(config: { durationMinutes: number; name?: string; metadata?: any }): Promise<string>;
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

	public async startSession(name: string, durationMinutes: number): Promise<string | null> {
		const api = this.getApi();
		if (!api) return null;
		return await api.sessions.startSession({
			durationMinutes,
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

		if (!api.sessions.isActive()) return null;

		// We might need to fetch context to get details if not directly available
		// But for now let's hope we can get enough info.
		// Actually SessionManager in Hub doesn't expose getActiveSession() full object directly publicly in the interface I saw?
		// Let's check the code again.
		// It has getActiveSessionId().
		// It has getActiveSessionContext().

		// Let's rely on what we saw in Hub's SessionManager:
		// public isActive(): boolean
		// public getActiveSessionContext(): Promise<any>
		// public getActiveSessionId(): string | null

		// To restore the timer, we need start time and duration.
		// The Hub plugin saves this in settings. But maybe we can access it via context or some other way.
		// Or we can just access the plugin settings directly if we really have to, but API is better.
		// context likely contains what we need if the aggregator puts it there.

		// Wait, looking at Hub's SessionManager again (from Step 8):
		// It saves to this.plugin.settings.activeSession
		// But doesn't expose a method to get the *config* of the active session easily except via context?
		// getActiveSessionContext calls aggregator.getSessionContext(id).

		// Let's assume getActiveSessionContext returns enough info.
		// If not, we might need to add a method to Hub or hack it.
		// For now, let's implement getRecentSessions first.

		return null; // Placeholder, see my thought process below
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
			return {
				id: s.id,
				startTime: s.startTime,
				duration: s.config.durationMinutes,
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
