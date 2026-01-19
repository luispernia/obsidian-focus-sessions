<script lang="ts">
	import { session } from "../stores";
</script>

<div class="session-header">
	{#if $session}
		<h3>{$session.name}</h3>
		<span class="status-tag {$session.status}">{$session.status}</span>
	{:else}
		<h3>No active session</h3>
	{/if}
</div>

<style>
	.session-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--background-modifier-border);
	}

	h3 {
		margin: 0;
	}

	.status-tag {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.8em;
		text-transform: uppercase;
		font-weight: bold;
	}

	.status-tag.running {
		background-color: var(--interactive-accent);
		color: var(--text-on-accent);
	}

	.status-tag.paused {
		background-color: var(--background-modifier-warning);
		color: var(--text-normal);
	}

	.status-tag.completed {
		background-color: var(--background-modifier-success);
		color: var(--text-on-accent);
	}
</style>
