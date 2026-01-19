<script lang="ts">
	import { session, plugin } from "../stores";
	import { setIcon } from "obsidian";

	function icon(node: HTMLElement, iconName: string) {
		setIcon(node, iconName);
		return {
			update(newIconName: string) {
				node.empty();
				setIcon(node, newIconName);
			},
		};
	}

	function startSession(name: string) {
		$plugin?.sessionManager.startSession(name);
	}

	function stopSession() {
		$plugin?.sessionManager.stopSession();
	}

	function pauseSession() {
		$plugin?.sessionManager.pauseSession();
	}

	function resumeSession() {
		$plugin?.sessionManager.resumeSession();
	}

	function addTime(minutes: number) {
		$plugin?.sessionManager.addTime(minutes);
	}
</script>

<div class="fs-controls">
	<div class="fs-controls-row">
		{#if $session}
			{#if $session.status === "completed"}
				<div class="fs-status-msg">Session Completed</div>
				<button class="fs-control-btn fs-primary" aria-label="Finish" on:click={stopSession}>
					<div use:icon={"check"}></div>
				</button>
			{:else}
				<button class="fs-control-btn fs-secondary" aria-label="Stop Session" on:click={stopSession}>
					<div use:icon={"square"}></div>
				</button>

				{#if $session.status === "running"}
					<button class="fs-control-btn fs-primary" aria-label="Pause" on:click={pauseSession}>
						<div use:icon={"pause"}></div>
					</button>
				{:else}
					<button class="fs-control-btn fs-primary" aria-label="Resume" on:click={resumeSession}>
						<div use:icon={"play"}></div>
					</button>
				{/if}
			{/if}
		{:else}
			<!-- Idle State -->
			<button
				class="fs-control-btn fs-secondary"
				aria-label="Short Break"
				on:click={() => startSession("Short Break")}
			>
				<div use:icon={"coffee"}></div>
			</button>

			<button
				class="fs-control-btn fs-primary"
				aria-label="Start Focus"
				on:click={() => startSession("Deep Work")}
			>
				<div use:icon={"play"}></div>
			</button>

			<button
				class="fs-control-btn fs-secondary"
				aria-label="Long Break"
				on:click={() => startSession("Long Break")}
			>
				<div use:icon={"armchair"}></div>
			</button>
		{/if}
	</div>

	<!-- Active Session Controls (Add Time) -->
	{#if $session && ($session.status === "running" || $session.status === "paused")}
		<div class="fs-controls-row fs-mt-2">
			<button class="fs-control-text-btn" on:click={() => addTime(0.5)}>+30s</button>
			<button class="fs-control-text-btn" on:click={() => addTime(1)}>+1m</button>
			<button class="fs-control-text-btn" on:click={() => addTime(5)}>+5m</button>
		</div>
	{/if}
</div>

<style>
	.fs-controls {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.fs-controls-row {
		display: flex;
		gap: 1rem;
		align-items: center;
		justify-content: center;
	}

	.fs-mt-2 {
		margin-top: 0.5rem;
	}

	.fs-control-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: none;
		cursor: pointer;
		background-color: var(--interactive-normal);
		color: var(--text-normal);
		transition: background-color 0.2s;
		padding: 0;
	}

	.fs-control-btn:hover {
		background-color: var(--interactive-hover);
	}

	.fs-control-btn.fs-primary {
		background-color: var(--interactive-accent);
		color: var(--text-on-accent);
	}

	.fs-control-btn.fs-primary:hover {
		background-color: var(--interactive-accent-hover);
	}

	.fs-control-text-btn {
		background: none;
		border: 1px solid var(--background-modifier-border);
		padding: 4px 8px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.8em;
		color: var(--text-muted);
	}

	.fs-control-text-btn:hover {
		background-color: var(--background-modifier-hover);
		color: var(--text-normal);
	}

	.fs-status-msg {
		font-weight: bold;
		color: var(--text-success);
		margin-right: 1rem;
	}
</style>
