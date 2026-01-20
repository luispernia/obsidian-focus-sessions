<script lang="ts">
	import { onMount } from "svelte";
	import type { SessionManager } from "../../services/session-manager";
	import SessionDetails from "./SessionDetails.svelte";

	export let sessions: SessionManager;

	let allSessions: any[] = [];
	let filteredSessions: any[] = [];
	let searchQuery = "";
	let selectedSessionId: string | null = null;
	let sessionContext: any = null;
	let loading = true;
	let loadingContext = false;

	onMount(async () => {
		try {
			allSessions = await sessions.getAllSessions();
			filterSessions();
		} catch (e) {
			console.error("Failed to load all sessions", e);
		} finally {
			loading = false;
		}
	});

	function filterSessions() {
		if (!searchQuery) {
			filteredSessions = allSessions;
			return;
		}
		const q = searchQuery.toLowerCase();
		filteredSessions = allSessions.filter(
			(s) => s.id.toLowerCase().includes(q) || (s.config?.name && s.config.name.toLowerCase().includes(q)),
		);
	}

	async function selectSession(id: string) {
		selectedSessionId = id;
		loadingContext = true;
		sessionContext = null;
		try {
			sessionContext = await sessions.getSessionContext(id);
		} catch (e) {
			console.error("Failed to load context", e);
			sessionContext = { error: "Failed to load context" };
		} finally {
			loadingContext = false;
		}
	}

	$: {
		// Run filter when searchQuery changes
		filterSessions();
		// reactivity trigger
		searchQuery;
	}
</script>

<div class="all-sessions-container">
	<div class="sidebar">
		<div class="search-box">
			<input type="text" placeholder="Search sessions..." bind:value={searchQuery} on:input={filterSessions} />
		</div>
		<div class="session-list">
			{#if loading}
				<div class="loading">Loading sessions...</div>
			{:else if filteredSessions.length === 0}
				<div class="empty">No sessions found</div>
			{:else}
				<ul class="session-ul">
					{#each filteredSessions as sess}
						<li class:selected={selectedSessionId === sess.id}>
							<button on:click={() => selectSession(sess.id)} class="session-item">
								<div class="sess-header">
									<span class="sess-name">{sess.config?.name || "Untitled"}</span>
									<span class="sess-date">{new Date(sess.start).toLocaleDateString()}</span>
								</div>
								<div class="sess-meta">
									<span class="sess-id">{sess.id}</span>
								</div>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>

	<div class="details">
		{#if selectedSessionId}
			<div class="details-header">
				<h3>Session Context: {selectedSessionId}</h3>
			</div>
			<div class="context-viewer">
				{#if loadingContext}
					<div class="loading">Loading context...</div>
				{:else if sessionContext}
					<SessionDetails session={sessionContext} />
				{:else}
					<div class="empty">No context available</div>
				{/if}
			</div>
		{:else}
			<div class="empty">Select a session to view details</div>
		{/if}
	</div>
</div>

<style>
	.all-sessions-container {
		display: flex;
		height: 600px;
		max-height: 80vh;
		gap: 20px;
	}

	.sidebar {
		flex: 0 0 300px;
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--background-modifier-border);
		padding-right: 10px;
	}

	.search-box {
		margin-bottom: 10px;
	}

	.search-box input {
		width: 100%;
	}

	.session-list {
		flex: 1;
		overflow-y: auto;
	}

	.session-ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		margin-bottom: 5px;
	}

	.session-item {
		width: 100%;
		text-align: left;
		background: none;
		border: 1px solid transparent;
		padding: 8px;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		flex-direction: column;
	}

	.session-item:hover {
		background-color: var(--background-modifier-hover);
	}

	.selected .session-item {
		background-color: var(--interactive-accent);
		color: var(--text-on-accent);
	}

	.selected .session-item .sess-id {
		color: var(--text-on-accent);
		opacity: 0.8;
	}

	.sess-header {
		display: flex;
		justify-content: space-between;
		font-weight: bold;
		margin-bottom: 4px;
	}

	.sess-meta {
		font-size: 0.8em;
		color: var(--text-muted);
	}

	.details {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.details-header {
		margin-bottom: 10px;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--background-modifier-border);
	}

	.details-header h3 {
		margin: 0;
	}

	.context-viewer {
		flex: 1;
		overflow: auto;
		background-color: var(--background-primary);
		padding: 10px;
		border-radius: 4px;
		border: 1px solid var(--background-modifier-border);
	}

	.loading,
	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--text-muted);
		font-style: italic;
	}
</style>
