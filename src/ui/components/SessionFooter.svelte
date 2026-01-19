<script lang="ts">
	import { plugin } from "../stores";
</script>

<div class="session-footer">
	<small>v{$plugin?.manifest.version}</small>
</div>

<style>
	.session-footer {
		margin-top: auto;
		padding-top: 1rem;
		text-align: center;
		color: var(--text-faint);
		border-top: 1px solid var(--background-modifier-border);
	}
</style>
