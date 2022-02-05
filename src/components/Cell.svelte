<script lang="ts">
	import type { ICell } from "../behavior/interfaces";
	import { valueToColor } from "../behavior/helpers";

	export let cell: ICell;
	export let cellSize: number;

	$: color = valueToColor(cell.value);

	let classes;
	$: {
		classes = "cell";
		if (cell.shouldAppear) {
			classes = classes += " tile-new";
		}
		if (cell.wasMerged) {
			classes += " tile-merged";
		}
		if (cell.value >= 1000 && cellSize > 5) {
			classes += " four-digits";
		}
		classes = classes;
	}

	let styles: string;
	$: {
		let tempStyles = `font-size: ${cellSize}vmin;`;
		tempStyles += `background-color: ${color};`;
		styles = tempStyles;
	}
</script>

<div class="container">
	{#if cell.value > 0}
		<div class={classes} style={styles}>
			{cell.value}
		</div>
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
			user-select: none;

			&.tile-new {
				animation: pop 300ms;
			}

			&.tile-merged {
				animation: appear 200ms;
			}

			&.four-digits {
				font-size: 5vmin;
			}

			@keyframes appear {
				0% {
					opacity: 0;
					transform: scale(0);
				}
				100% {
					opacity: 1;
					transform: scale(1);
				}
			}

			@keyframes pop {
				0% {
					transform: scale(0);
				}
				50% {
					transform: scale(0);
				}
				75% {
					transform: scale(1.2);
				}
				100% {
					transform: scale(1);
				}
			}
		}

		.empty {
			background-color: black;
		}
	}
</style>
