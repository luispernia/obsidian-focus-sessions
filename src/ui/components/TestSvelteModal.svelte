<script lang="ts">
	import { onMount } from "svelte";
	import { App, Notice } from "obsidian";

	let { app }: { app: App } = $props();

	let count = $state(0);
	let message = "Hello Svelte 5!";

	function increment() {
		count += 1;
		new Notice(`Count is now ${count}`);
	}

	onMount(() => {
		console.log("Svelte 5 component mounted in app:", app);
	});
</script>

<div class="svelte-modal-content">
	<h2>{message}</h2>
	<p>This is a reactive Svelte 5 component using Runes.</p>

	<div class="counter-section">
		<p>Count: <strong>{count}</strong></p>
		<button onclick={increment}>Increment</button>
	</div>

	<style>
		.svelte-modal-content {
			padding: 1rem;
			text-align: center;
		}
		.counter-section {
			margin-top: 2rem;
			padding: 1rem;
			background-color: var(--background-secondary);
			border-radius: 8px;
		}
		button {
			margin-top: 1rem;
			cursor: pointer;
		}
	</style>
</div>
