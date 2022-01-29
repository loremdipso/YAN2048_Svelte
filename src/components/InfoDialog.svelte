<script lang="ts">
	import Button from "smelte/src/components/Button";

	import FancyDialog from "../common/FancyDialog.svelte";

	export let showDialog = true;
</script>

<FancyDialog small bind:showDialog>
	<h5 slot="title">Welcome!</h5>

	<p>
		This is a simple clone of <a
			href="https://en.wikipedia.org/wiki/2048_(video_game)">2048</a
		> that I used to test out Svelte. The only real difference with the original
		is that this one will let you grow or shrink the board if you'd like. Careful,
		though - growing the board keeps your score and tiles intact, while shrinking
		the board resets them. Have fun!
	</p>

	<div slot="actions">
		<Button text on:click={() => (showDialog = false)}>Thanks!</Button>
	</div>
</FancyDialog>
