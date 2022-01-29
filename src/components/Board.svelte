<script lang="ts">
	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();

	import GameButton from "./GameButton.svelte";
	import Cell from "./Cell.svelte";
	import type { ICell } from "../behavior/interfaces";
	import { Swiper } from "../common/swiper";

	export let cells: ICell[];
	export let numCols: number;
	export let numRows: number;

	let cellsDiv: HTMLElement;
	let swiper: Swiper | null;
	$: {
		// TODO: handle cleanup better, maybe
		if (swiper) {
			swiper.stop();
		}

		if (cellsDiv) {
			swiper = new Swiper(cellsDiv, (direction) => {
				dispatch(direction);
			});
		}
	}

	let cellSize = 7;

	let cellsStyles;
	$: {
		let tempStyles = "grid-template-columns:";
		for (let i = 0; i < numCols; i++) {
			tempStyles += "minmax(0, 1fr)";
		}

		tempStyles += ";grid-template-rows:";
		for (let i = 0; i < numRows; i++) {
			tempStyles += "minmax(0, 1fr)";
		}

		let spacing = 1;
		let numCells = numRows * numCols;
		if (numCells < 36) {
			spacing = 10;
		} else if (numCells < 64) {
			spacing = 5;
		} else if (numCells < 81) {
			spacing = 4;
			cellSize = 5;
		} else if (numCells < 144) {
			cellSize = 2;
		} else if (numCells < 676) {
			cellSize = 1;
		}

		tempStyles += `;padding: ${spacing}px; gap: ${spacing}px;`;
		cellsStyles = tempStyles;
	}
</script>

<div class="board ml-auto mr-auto">
	<div class="flex full-w">
		<GameButton
			icon="info"
			title="Show info"
			on:click={() => dispatch("showInfo")}
		/>
		<GameButton grow icon="expand_less" on:click={() => dispatch("up")} />
		<GameButton
			icon="refresh"
			title="Restart"
			on:click={() => dispatch("restart")}
		/>
	</div>
	<div class="center-region">
		<GameButton icon="chevron_left" on:click={() => dispatch("left")} />
		<div class="cells" style={cellsStyles} bind:this={cellsDiv}>
			{#each cells as cell (cell.id)}
				<Cell {cellSize} {cell} />
			{/each}
		</div>
		<GameButton icon="chevron_right" on:click={() => dispatch("right")} />
	</div>
	<div class="flex full-w">
		<GameButton
			icon="remove"
			title="Shrink board"
			on:click={() => dispatch("shrink")}
		/>
		<GameButton grow icon="expand_more" on:click={() => dispatch("down")} />
		<GameButton
			icon="add"
			title="Grow board"
			on:click={() => dispatch("grow")}
		/>
	</div>
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
	}
</style>
