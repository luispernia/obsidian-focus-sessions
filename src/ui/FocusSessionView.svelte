<script lang="ts">
	import SessionHeader from "./components/SessionHeader.svelte";
	import SessionTimer from "./components/SessionTimer.svelte";
	import SessionControls from "./components/SessionControls.svelte";
	import SessionFooter from "./components/SessionFooter.svelte";
	import SessionHistory from "./components/SessionHistory.svelte";
</script>

<div class="focus-session-container">
	<SessionHeader />
	<SessionTimer />
	<SessionControls />
	<SessionHistory />
	<SessionFooter />
</div>

<style>
	.focus-session-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 1rem;
	}
</style>
