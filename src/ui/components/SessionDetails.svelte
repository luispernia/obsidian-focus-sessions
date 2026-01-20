<script lang="ts">
	export let session: any;

	function formatTime(ts: string | number) {
		if (!ts) return "-";
		if (typeof ts === "string") return ts; // "05:36 PM" format from logs
		return new Date(ts).toLocaleTimeString();
	}

	function getDurationString(minutes: number, seconds: number) {
		if (seconds) {
			const m = Math.floor(seconds / 60);
			const s = seconds % 60;
			return `${m}m ${s}s`;
		}
		return `${minutes}m`;
	}

	// Helper to safely access nested properties
	// The session object might be the full context wrapper { sessionId, context: { ... } }
	// or it might be the context itself { activity_logs, git } if flattened.
	// We check for both.

	$: context = session?.context || session || {};
	$: logs = context.activity_logs || session?.activity_logs;
	$: config = logs?.config || {};
	$: timeline = logs?.timeline || [];
	$: git = context.git || session?.git;
	$: changes = git?.changes || { added: [], modified: [], deleted: [] };
	$: filesCount = (changes.added?.length || 0) + (changes.modified?.length || 0) + (changes.deleted?.length || 0);

	let activeTab: "timeline" | "files" = "timeline";
</script>

<div class="session-details">
	{#if !session}
		<div class="empty-state">No context data available</div>
	{:else}
		<div class="header-card">
			<div class="title-row">
				<h2>{config.name || "Untitled Session"}</h2>
				<span class="status-badge">Completed</span>
			</div>
			<div class="meta-row">
				<div class="meta-item">
					<span class="label">Date</span>
					<span class="value">{logs?.period?.start ? String(logs.period.start).split(" ")[0] : "Today"}</span>
					<!-- Parsing date from period start is tricky if it's just time "05:36 PM". 
                         Usually session object has 'start' timestamp, but here we might only have context.
                         Let's assume the context viewer is mostly about what happened during the session. -->
				</div>
				<div class="meta-item">
					<span class="label">Duration</span>
					<span class="value">{getDurationString(config.durationMinutes, config.durationSeconds)}</span>
				</div>
				<div class="meta-item">
					<span class="label">Files Touched</span>
					<span class="value">{filesCount}</span>
				</div>
			</div>
			{#if config.metadata?.focus_area}
				<div class="meta-row">
					<div class="meta-item">
						<span class="label">Focus Area</span>
						<span class="value">{config.metadata.focus_area}</span>
					</div>
				</div>
			{/if}
		</div>

		<div class="tabs">
			<button class="tab-btn" class:active={activeTab === "timeline"} on:click={() => (activeTab = "timeline")}>
				Activity Timeline
			</button>
			<button class="tab-btn" class:active={activeTab === "files"} on:click={() => (activeTab = "files")}>
				File Changes ({filesCount})
			</button>
		</div>

		<div class="tab-content">
			{#if activeTab === "timeline"}
				<div class="timeline-list">
					{#each timeline as event}
						<div class="timeline-item">
							<div class="timeline-dot"></div>
							<div class="timeline-text">{event}</div>
						</div>
					{/each}
					{#if timeline.length === 0}
						<div class="empty-tab">No specific activity recorded.</div>
					{/if}
				</div>
			{:else if activeTab === "files"}
				<div class="changes-list">
					{#if changes.added?.length > 0}
						<div class="change-group added">
							<h4>Added ({changes.added.length})</h4>
							{#each changes.added as file}
								<div class="file-item">
									<span class="file-name">{file.file}</span>
									{#if file.diff}
										<details>
											<summary>View Diff</summary>
											<pre class="diff-view">{file.diff}</pre>
										</details>
									{/if}
								</div>
							{/each}
						</div>
					{/if}

					{#if changes.modified?.length > 0}
						<div class="change-group modified">
							<h4>Modified ({changes.modified.length})</h4>
							{#each changes.modified as file}
								<div class="file-item">
									<span class="file-name">{file.file}</span>
									{#if file.diff}
										<details>
											<summary>View Diff</summary>
											<pre class="diff-view">{file.diff}</pre>
										</details>
									{/if}
								</div>
							{/each}
						</div>
					{/if}

					{#if changes.deleted?.length > 0}
						<div class="change-group deleted">
							<h4>Deleted ({changes.deleted.length})</h4>
							{#each changes.deleted as file}
								<div class="file-item">
									<span class="file-name">{file.file}</span>
									{#if file.diff}
										<details>
											<summary>View Diff</summary>
											<pre class="diff-view">{file.diff}</pre>
										</details>
									{/if}
								</div>
							{/each}
						</div>
					{/if}

					{#if filesCount === 0}
						<div class="empty-tab">No file changes detected.</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.session-details {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow-y: auto;
		color: var(--text-normal);
	}

	.empty-state,
	.empty-tab {
		padding: 2rem;
		text-align: center;
		color: var(--text-muted);
		font-style: italic;
	}

	.header-card {
		padding: 1rem;
		background-color: var(--background-secondary);
		border-bottom: 1px solid var(--background-modifier-border);
		margin-bottom: 1rem;
	}

	.title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	h2 {
		margin: 0;
		font-size: 1.2rem;
	}

	.status-badge {
		font-size: 0.75rem;
		padding: 2px 6px;
		background-color: var(--interactive-accent);
		color: var(--text-on-accent);
		border-radius: 4px;
		text-transform: uppercase;
	}

	.meta-row {
		display: flex;
		gap: 1.5rem;
		margin-top: 0.5rem;
	}

	.meta-item {
		display: flex;
		flex-direction: column;
	}

	.label {
		font-size: 0.7rem;
		text-transform: uppercase;
		color: var(--text-muted);
		letter-spacing: 0.5px;
	}

	.value {
		font-size: 0.9rem;
		font-weight: 500;
	}

	.tabs {
		display: flex;
		gap: 1rem;
		padding: 0 1rem;
		border-bottom: 1px solid var(--background-modifier-border);
	}

	.tab-btn {
		background: none;
		border: none;
		padding: 0.5rem 0;
		font-size: 0.9rem;
		color: var(--text-muted);
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all 0.2s;
	}

	.tab-btn:hover {
		color: var(--text-normal);
	}

	.tab-btn.active {
		color: var(--interactive-accent);
		border-bottom-color: var(--interactive-accent);
	}

	.tab-content {
		padding: 1rem;
	}

	.timeline-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.timeline-item {
		display: flex;
		align-items: flex-start;
		gap: 0.8rem;
	}

	.timeline-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--background-modifier-border-hover);
		margin-top: 6px;
	}

	.timeline-text {
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.change-group {
		margin-bottom: 1.5rem;
	}

	.change-group h4 {
		margin: 0 0 0.5rem 0;
		font-size: 0.85rem;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.change-group.added h4 {
		color: var(--color-green);
	}
	.change-group.modified h4 {
		color: var(--color-orange);
	}
	.change-group.deleted h4 {
		color: var(--color-red);
	}

	.file-item {
		margin-bottom: 0.5rem;
		background-color: var(--background-primary);
		padding: 0.5rem;
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
	}

	.file-name {
		font-family: var(--font-monospace);
		font-size: 0.85rem;
		display: block;
		margin-bottom: 0.25rem;
	}

	summary {
		cursor: pointer;
		font-size: 0.8rem;
		color: var(--text-muted);
		outline: none;
	}

	.diff-view {
		background-color: var(--background-secondary);
		padding: 0.5rem;
		margin: 0.5rem 0 0 0;
		font-size: 0.75rem;
		overflow-x: auto;
		white-space: pre;
	}
</style>
