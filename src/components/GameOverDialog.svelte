<script lang="ts">
	import Button from "smelte/src/components/Button";

	import FancyDialog from "../common/FancyDialog.svelte";

	export let showDialog = true;
	export let score: number;
</script>

<FancyDialog small bind:showDialog>
	<h5 slot="title">Game Over</h5>

	<p>
		The game might be over but the fun doesn't have to be. Your final score
		was <b>{score}</b>. Will you play again?
	</p>

	<div slot="actions">
		<Button text on:click={() => (showDialog = false)}>Yes!</Button>
		<Button text on:click={() => (showDialog = false)}>Absolutely!</Button>
	</div>
</FancyDialog>
