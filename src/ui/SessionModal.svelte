<script lang="ts">
	import { session, timeRemaining, plugin } from "./stores";
	import { formatDuration } from "@/utils/time-utils";

	let { close } = $props();

	function stop() {
		$plugin?.sessionManager.stopSession();
		close();
	}
</script>

<div class="session-modal-content">
	{#if $session}
		<h2>{$session.name}</h2>
		<div class="stats">
			<p>Duration: {$session.durationMinutes} minutes</p>
			<p>Time remaining: {formatDuration($timeRemaining)}</p>
		</div>
		<button class="mod-warning" onclick={stop}>Stop session</button>
	{:else}
		<h2>No active session</h2>
		<p>Go to the side panel to start a new session.</p>
	{/if}
</div>

<style>
	.session-modal-content {
		text-align: center;
		padding: 1rem;
	}

	.stats {
		margin: 1.5rem 0;
		font-size: 1.1em;
	}

	button {
		cursor: pointer;
	}
</style>
