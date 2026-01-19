<script lang="ts">
	import { timeRemaining, session } from "../stores";
	import { formatDuration } from "@/utils/time-utils";
</script>

<div class="session-timer">
	{#if $session}
		<div class="time-display">
			{formatDuration($timeRemaining)}
		</div>
		<div class="progress-bar-container">
			<div
				class="progress-bar"
				style="width: {($session.elapsed / ($session.durationMinutes * 60)) * 100}%"
			></div>
		</div>
	{:else}
		<div class="time-display placeholder">--:--</div>
	{/if}
</div>

<style>
	.session-timer {
		text-align: center;
		margin: 2rem 0;
	}

	.time-display {
		font-size: 3em;
		font-family: var(--font-monospace);
		font-weight: bold;
		color: var(--text-normal);
	}

	.time-display.placeholder {
		opacity: 0.5;
	}

	.progress-bar-container {
		height: 4px;
		background-color: var(--background-modifier-border);
		border-radius: 2px;
		margin-top: 1rem;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background-color: var(--interactive-accent);
		transition: width 1s linear;
	}
</style>
