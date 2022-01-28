<script lang="ts">
	import { valueToColor } from "../helpers";
	import type { ICell } from "../helpers";

	export let cell: ICell;
	$: color = valueToColor(cell.value);
</script>

<div class="container">
	{#if cell.value > 0}
		<div class="cell" style="background-color: {color}">{cell.value}</div>
	{:else}
		<div class="cell empty" />
	{/if}
</div>

<style lang="scss">
	.container {
		background-color: #111;
		width: 100%;
		height: 100%;
		color: #fff;
		font-weight: 700;
		font-size: 7vmin;
		display: flex;

		&:first-child {
			// TODO: what does this do, exactly?
			grid-row: 1/1;
			grid-column: 1/1;
		}

		.cell {
			flex-grow: 1;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.empty {
			background-color: black;
		}
	}
</style>
