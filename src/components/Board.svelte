<script lang="ts">
	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();

	import GameButton from "./GameButton.svelte";
	import Cell from "./Cell.svelte";
	import type { ICell } from "../behavior/interfaces";

	export let cells: ICell[];
</script>

<div class="board ml-auto mr-auto">
	<GameButton icon="expand_less" on:click={() => dispatch("up")} />
	<div class="center-region">
		<GameButton icon="chevron_left" on:click={() => dispatch("left")} />
		<div class="cells">
			{#each cells as cell (cell.id)}
				<Cell {cell} />
			{/each}
		</div>
		<GameButton icon="chevron_right" on:click={() => dispatch("right")} />
	</div>
	<GameButton icon="expand_more" on:click={() => dispatch("down")} />
</div>

<style>
	.board {
		width: min(100vw, 100vh);
		height: min(100vw, 100vh);
		display: flex;
		flex-direction: column;
	}

	.center-region {
		display: flex;
		flex-grow: 1;
	}
	.cells {
		flex-grow: 1;
		background-color: #28528f;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(
				0,
				1fr
			);
		grid-template-rows: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(
				0,
				1fr
			);
		padding: 10px;
		gap: 10px;
	}
</style>
