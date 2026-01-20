<script lang="ts">
	import { plugin } from "../stores";
	import { SessionDetailsModal } from "../session-details-modal";
	import { SessionHistoryModal } from "../session-history-modal";
	import { setIcon } from "obsidian";
	import { onMount } from "svelte";

	// Define interface for what specific fields we expect from Hub history
	// Hub returns raw objects. Usually { id, start: number, end: number, config: { name, durationMinutes }, ... }
	// Based on SessionManager of Hub:
	// session object has: id, start, end, config, metadata. // Wait, Step 19 (ActivityLogger) getRecentSessions returns: { id, start, end, ... }
	// And it seems ActivityLogger doesn't store 'config' in the lightweight session map in getRecentSessions?
	// Let's check ActivityLogger.ts getRecentSessions again (Step 19).
	/*
    public async getRecentSessions(days: number = 7): Promise<any[]> {
		const sessions: Map<string, any> = new Map();
        // ...
        // logs.type === "session_start" -> sessions.set(id, { ...existing, id, start: log.timestamp })
        // It doesn't seem to merge the full log event payload (which contains config) into the session object!
        // It only sets start/end/id.
    */

	// Ah, ActivityLogger.ts line 169:
	// sessions.set(log.sessionId, { ...existing, id: log.sessionId, start: log.timestamp });
	// This LOSES the `config` and `metadata` from the log event!
	// I need to fix Hub's ActivityLogger to include the config data if I want to display the Name.
	// OR I can use getSessionContext(id) for each session, but that is heavy.

	// NOTE: This reveals a "bug" or missing feature in Obsidian Hub's getRecentSessions.
	// I should check if I can modify Hub ActivityLogger to include more data.
	// Yes, I have access to modify Hub code.

	// Let's modify Hub ActivityLogger first to include the data.

	let history: any[] = [];

	// We will wait for the Hub fix. But let's assume we can get:
	// { id, start, end, config: { name, durationMinutes } }

	$: sessionManager = $plugin?.sessionManager;

	async function loadHistory() {
		if (sessionManager) {
			history = await sessionManager.getSessionHistory();
		}
	}

	// Reload when session manager is available or changes
	$: if (sessionManager) {
		loadHistory();

		// Also hook into session completion to refresh
		sessionManager.onSessionComplete(() => {
			setTimeout(loadHistory, 500);
		});
	}

	function openDetails(session: any) {
		new SessionDetailsModal($plugin!.app, session, sessionManager).open();
	}

	function openAllSessions() {
		if (sessionManager) {
			new SessionHistoryModal($plugin!.app, sessionManager).open();
		}
	}

	function formatTime(ts: number) {
		return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	}

	function formatDuration(session: any) {
		if (session.end && session.start) {
			const diffMs = session.end - session.start;
			const minutes = Math.round(diffMs / 1000 / 60);
			return `${minutes}m`;
		}
		return `${session.config?.durationMinutes || "?"}m`;
	}
</script>

<div class="fs-history">
	<div class="fs-history-header">Recent Sessions</div>

	<div class="fs-history-list">
		{#each history as session}
			<div
				class="fs-history-item"
				role="button"
				tabindex="0"
				on:click={() => openDetails(session)}
				on:keydown={(e) => (e.key === "Enter" || e.key === " ") && openDetails(session)}
			>
				<div class="fs-history-icon">
					<div
						class="fs-status-dot-sm"
						style="background-color: {session.end ? 'var(--text-muted)' : 'var(--interactive-accent)'}"
					></div>
				</div>
				<div class="fs-history-info">
					<div class="fs-history-name">{session.config?.name || "Untitled Session"}</div>
					<div class="fs-history-meta">
						{formatTime(session.start)} • {formatDuration(session)}
					</div>
				</div>
			</div>
		{:else}
			<div class="fs-history-empty">No recent sessions found</div>
		{/each}
	</div>

	<div class="fs-history-footer">
		<button class="fs-btn-link" on:click={openAllSessions}>See All Sessions</button>
	</div>
</div>

<style>
	.fs-history {
		margin-top: 24px;
		width: 100%;
		border-top: 1px solid var(--background-modifier-border);
		padding-top: 16px;
	}

	.fs-history-header {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-muted);
		letter-spacing: 0.5px;
		margin-bottom: 12px;
		text-transform: uppercase;
	}

	.fs-history-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.fs-history-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 12px;
		border-radius: 8px;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		cursor: pointer;
		transition: all 0.2s;
	}

	.fs-history-item:hover {
		background-color: var(--background-modifier-hover);
		border-color: var(--interactive-accent);
	}

	.fs-history-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.fs-history-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.fs-history-name {
		font-size: 13px;
		font-weight: 500;
		color: var(--text-normal);
	}

	.fs-history-meta {
		font-size: 11px;
		color: var(--text-muted);
	}

	.fs-history-empty {
		text-align: center;
		color: var(--text-muted);
		font-size: 13px;
		padding: 16px;
	}

	.fs-history-footer {
		margin-top: 12px;
		text-align: center;
	}

	.fs-btn-link {
		background: none;
		border: none;
		color: var(--text-muted);
		font-size: 12px;
		padding: 4px 8px;
		cursor: pointer;
		text-decoration: underline;
		opacity: 0.8;
		transition: opacity 0.2s;
	}

	.fs-btn-link:hover {
		opacity: 1;
		color: var(--text-normal);
	}
</style>
