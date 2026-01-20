<script lang="ts">
	import { timeRemaining, session, draftName, draftMinutes, draftSeconds } from "../stores";
	import { formatDuration } from "@/utils/time-utils";

	let showNameInput = false;

	function toggleNameInput() {
		showNameInput = !showNameInput;
	}

	function formatDisplay(val: number): string {
		return val.toString().padStart(2, "0");
	}

	function handleMinutesInput(e: Event & { currentTarget: HTMLInputElement }) {
		const input = e.currentTarget.value.replace(/[^0-9]/g, "");
		let val = parseInt(input, 10);
		if (isNaN(val)) val = 0;
		if (val > 99) val = 99;
		$draftMinutes = val;
		// Force update input value to ensure formatting
		e.currentTarget.value = formatDisplay(val);
	}

	function handleSecondsInput(e: Event & { currentTarget: HTMLInputElement }) {
		const input = e.currentTarget.value.replace(/[^0-9]/g, "");
		let val = parseInt(input, 10);
		if (isNaN(val)) val = 0;
		if (val > 59) val = 59;
		$draftSeconds = val;
		e.currentTarget.value = formatDisplay(val);
	}
</script>

<div class="session-timer">
	{#if $session}
		<div class="time-display" class:is-overtime={$timeRemaining < 0}>
			{formatDuration($timeRemaining)}
		</div>
		<div class="progress-bar-container">
			<div
				class="progress-bar"
				style="width: {Math.min(100, ($session.elapsed / $session.duration) * 100)}%"
			></div>
		</div>
	{:else}
		<div class="custom-timer-container">
			{#if showNameInput}
				<input
					type="text"
					class="fs-timer-name-input"
					bind:value={$draftName}
					placeholder="Session Name"
					on:blur={() => (showNameInput = false)}
				/>
			{:else}
				<div
					class="fs-timer-name-display"
					on:click={toggleNameInput}
					role="button"
					tabindex="0"
					on:keypress={(e) => e.key === "Enter" && toggleNameInput()}
				>
					{$draftName}
				</div>
			{/if}

			<div class="fs-timer-inputs">
				<input
					type="text"
					inputmode="numeric"
					value={formatDisplay($draftMinutes)}
					on:input={handleMinutesInput}
					class="fs-timer-input"
				/>
				<span class="fs-timer-separator">:</span>
				<input
					type="text"
					inputmode="numeric"
					value={formatDisplay($draftSeconds)}
					on:input={handleSecondsInput}
					on:focus={(e) => e.currentTarget.select()}
					class="fs-timer-input"
				/>
			</div>
		</div>
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

	/* Custom Timer Styles */
	.custom-timer-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.fs-timer-name-display {
		font-size: 1.2em;
		color: var(--text-muted);
		cursor: pointer;
		border-bottom: 1px dashed transparent;
		transition:
			border-color 0.2s,
			color 0.2s;
	}

	.fs-timer-name-display:hover {
		border-bottom-color: var(--text-muted);
		color: var(--text-normal);
	}

	.fs-timer-name-input {
		font-size: 1.2em;
		text-align: center;
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--interactive-accent);
		color: var(--text-normal);
		width: 200px;
	}

	.fs-timer-inputs {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
	}

	.fs-timer-input {
		font-size: 3em;
		font-family: var(--font-monospace);
		font-weight: bold;
		color: var(--text-normal);
		background: transparent;
		border: none;
		width: 5rem; /* Approx width for 2 digits */
		height: 4rem;
		text-align: center;
		padding: 0;
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.fs-timer-input:hover {
		color: var(--interactive-accent);
	}

	.fs-timer-input::-webkit-outer-spin-button,
	.fs-timer-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.fs-timer-input:focus {
		outline: none;
		box-shadow: none;
		color: var(--interactive-accent);
	}

	.fs-timer-separator {
		font-size: 3em;
		font-family: var(--font-monospace);
		font-weight: bold;
		color: var(--text-normal);
		margin-bottom: 0.5rem; /* Optical alignment */
	}
</style>
