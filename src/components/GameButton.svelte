<script lang="ts">
	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();

	import Icon from "smelte/src/components/Icon";

	export let icon: string;
</script>

<div on:click={() => dispatch("click")}>
	<Icon>{icon}</Icon>
</div>

<style>
	div {
		cursor: pointer;
		display: flex;
		background-color: black;
		color: white;
		justify-content: center;
		align-items: center;
		padding: 0.5rem;
	}
</style>
