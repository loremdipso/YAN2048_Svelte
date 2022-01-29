<script lang="ts">
	import { getRandomElement } from "../common/utils";
	import type { IAdjacentCellFn, ICell } from "../behavior/interfaces";
	import { generateCells, getRandomStartingValue } from "../behavior/helpers";
	import Board from "./Board.svelte";
	import InfoDialog from "./InfoDialog.svelte";
	import GameOverDialog from "./GameOverDialog.svelte";

	let cells: ICell[] = [];
	let score = 0;
	let isGameOver = false;
	let showInfo = false;

	let numCols = 4;
	let numRows = 4;

	function shrink() {
		if (numCols > 1 && numRows > 1) {
			numCols -= 1;
			numRows -= 1;
			restart();
		}
	}

	function grow() {
		numCols += 1;
		numRows += 1;

		// maintain as much old state as possible
		let oldCells = cells;
		let newCells = generateCells(numRows * numCols, 0);

		let oldNumCols = numCols - 1;
		let oldNumRows = numRows - 1;
		let oldCellIndex = -1;
		let row = 0;
		let col = -1;
		for (let i = 0; i < newCells.length; i++) {
			col += 1;
			if (col >= numCols) {
				col = 0;
				row += 1;
			}

			if (row >= oldNumRows || col >= oldNumCols) {
				continue;
			}

			oldCellIndex += 1;
			newCells[i].value = oldCells[oldCellIndex].value;
		}
		cells = newCells;
	}

	function restart() {
		cells = generateCells(numRows * numCols, 3);
		score = 0;
		isGameOver = false;
	}

	$: {
		if (isGameOver === false) {
			restart();
		}
	}

	function handleKeydown(event) {
		const key = event.key;
		const keyCode = event.keyCode;

		switch (key) {
			case "r":
				restart();
				break;
			case "ArrowUp":
				moveUp();
				break;
			case "ArrowDown":
				moveDown();
				break;
			case "ArrowLeft":
				moveLeft();
				break;
			case "ArrowRight":
				moveRight();
				break;
		}
	}

	function addRandomCell(): boolean {
		let empties = [];
		for (let cell of cells) {
			if (cell.value === 0) {
				empties.push(cell);
			}
			cell.shouldAppear = false;
		}

		if (empties.length === 0) {
			isGameOver = true;
			return false;
		} else {
			let randomCell = getRandomElement(empties);
			randomCell.value = getRandomStartingValue();
			randomCell.shouldAppear = true;
			return true;
		}
	}

	function couldMove(): boolean {
		// TODO: make less hacky
		return (
			moveUp(false) ||
			moveDown(false) ||
			moveRight(false) ||
			moveLeft(false)
		);
	}

	function moveUp(commit: boolean = true): boolean {
		return doMove(getPreviousRow, getNextRow, commit);
	}

	function moveDown(commit: boolean = true): boolean {
		return doMove(getNextRow, getPreviousRow, commit);
	}

	function moveLeft(commit: boolean = true): boolean {
		return doMove(getPreviousColumn, getNextColumn, commit);
	}

	function moveRight(commit: boolean = true): boolean {
		return doMove(getNextColumn, getPreviousColumn, commit);
	}

	function doMove(
		nextCellFunction: IAdjacentCellFn,
		previousCellFunction: IAdjacentCellFn,
		commit: boolean
	): boolean {
		let didMove = false;

		if (commit) {
			for (let cell of cells) {
				cell.wasMerged = false;
			}
		}

		// slide
		didMove =
			doSlide(nextCellFunction, previousCellFunction, commit) || didMove;

		if (didMove && !commit) {
			return didMove;
		}

		// merge
		let didMerge = false;
		for (let i = 0; i < cells.length; i++) {
			let cell = cells[i];
			if (cell.value !== 0 && !cell.wasMerged) {
				let previousCell = previousCellFunction(cells, i);
				if (previousCell && previousCell.value === cell.value) {
					if (commit) {
						didMerge = true;
						didMove = true;
						cell.wasMerged = true;
						cell.value += previousCell.value;
						previousCell.value = 0;
						score += cell.value;
					} else {
						return true;
					}
				}
			}
		}

		// slide again, if necessary
		if (didMerge) {
			didMove =
				doSlide(nextCellFunction, previousCellFunction, commit) ||
				didMove;
		}

		if (!commit) {
			return didMove;
		}

		if (didMove) {
			addRandomCell();
		} else if (!couldMove()) {
			isGameOver = true;
		}

		if (didMove) {
			cells = cells;
		}
		return didMove;
	}

	function doSlide(
		nextCellFunction: IAdjacentCellFn,
		previousCellFunction: IAdjacentCellFn,
		commit: boolean
	): boolean {
		let didMove = false;
		while (true) {
			let didSlide = false;
			for (let i = 0; i < cells.length; i++) {
				let cell = cells[i];
				if (cell.value !== 0) {
					let nextCell = nextCellFunction(cells, i);
					if (nextCell && nextCell.value === 0) {
						if (commit) {
							didSlide = true;
							didMove = true;
							nextCell.value = cell.value;
							cell.value = 0;
						} else {
							return true;
						}
					}
				}
			}

			if (!didSlide) {
				break;
			}
		}

		return didMove;
	}

	export function getNextRow(
		cells: ICell[],
		index: number
	): ICell | undefined {
		return getCellAt(cells, index + numCols);
	}

	export function getPreviousRow(
		cells: ICell[],
		index: number
	): ICell | undefined {
		return getCellAt(cells, index - numRows);
	}

	export function getNextColumn(
		cells: ICell[],
		index: number
	): ICell | undefined {
		if ((index + 1) % numCols === 0) {
			// far right
			return null;
		}
		return getCellAt(cells, index + 1);
	}

	export function getPreviousColumn(
		cells: ICell[],
		index: number
	): ICell | undefined {
		if (index % numCols === 0) {
			// far left
			return null;
		}
		return getCellAt(cells, index - 1);
	}

	export function getCellAt(
		cells: ICell[],
		index: number
	): ICell | undefined {
		let cell = cells[index];
		return cell;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<Board
	bind:cells
	bind:numCols
	bind:numRows
	on:up={() => moveUp()}
	on:down={() => moveDown()}
	on:left={() => moveLeft()}
	on:right={() => moveRight()}
	on:restart={() => restart()}
	on:shrink={() => shrink()}
	on:grow={() => grow()}
	on:showInfo={() => (showInfo = true)}
/>

<InfoDialog bind:showDialog={showInfo} />
<GameOverDialog bind:showDialog={isGameOver} {score} />
