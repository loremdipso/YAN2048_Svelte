<script lang="ts">
	import { getRandomElement } from "../common/utils";
	import type {
		IAdjacentCellFn,
		ICell,
		IIteratorFn,
	} from "../behavior/interfaces";
	import { generateCells, getRandomStartingValue } from "../behavior/helpers";
	import Board from "./Board.svelte";
	import InfoDialog from "./InfoDialog.svelte";
	import GameOverDialog from "./GameOverDialog.svelte";
	import { tick } from "svelte";

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
				clearAndMove(moveUp);
				break;
			case "ArrowDown":
				clearAndMove(moveDown);
				break;
			case "ArrowLeft":
				clearAndMove(moveLeft);
				break;
			case "ArrowRight":
				clearAndMove(moveRight);
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

	async function clearAndMove<T>(callback: () => any) {
		// NOTE: ideally we'd use `tick()` here, but sometimes animation events get lost,
		// so we're stuck with this hacky setTimeout thing
		clearStyles();
		setTimeout(() => {
			callback();
		});
	}

	function clearStyles() {
		for (let cell of cells) {
			cell.wasMerged = false;
			cell.shouldAppear = false;
		}
		cells = cells;
	}

	function moveUp(commit: boolean = true): boolean {
		return doMove(getPreviousRow, getNextRow, forwardIterator, commit);
	}

	function moveDown(commit: boolean = true): boolean {
		return doMove(getNextRow, getPreviousRow, backwardIterator, commit);
	}

	function moveLeft(commit: boolean = true): boolean {
		return doMove(
			getPreviousColumn,
			getNextColumn,
			forwardIterator,
			commit
		);
	}

	function moveRight(commit: boolean = true): boolean {
		return doMove(
			getNextColumn,
			getPreviousColumn,
			backwardIterator,
			commit
		);
	}

	function doMove(
		nextCellFunction: IAdjacentCellFn,
		previousCellFunction: IAdjacentCellFn,
		iterator: IIteratorFn,
		commit: boolean
	): boolean {
		let didMove = false;

		// slide
		didMove =
			doSlide(nextCellFunction, previousCellFunction, iterator, commit) ||
			didMove;

		if (didMove && !commit) {
			return didMove;
		}

		// merge
		let didMerge = false;
		for (let i of iterator(cells)) {
			let cell = cells[i];
			// if (cell.value !== 0 && !cell.wasMerged) {
			if (cell.value !== 0) {
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
				doSlide(
					nextCellFunction,
					previousCellFunction,
					iterator,
					commit
				) || didMove;
		}

		if (!commit) {
			return didMove;
		}

		if (didMove) {
			addRandomCell();
			cells = cells;
		} else if (!couldMove()) {
			isGameOver = true;
		}

		return didMove;
	}

	function doSlide(
		nextCellFunction: IAdjacentCellFn,
		previousCellFunction: IAdjacentCellFn,
		iterator: IIteratorFn,
		commit: boolean
	): boolean {
		let didMove = false;
		while (true) {
			let didSlide = false;
			for (const i of iterator(cells)) {
				let cell = cells[i];
				if (cell.value !== 0) {
					let nextCell = nextCellFunction(cells, i);
					if (nextCell && nextCell.value === 0) {
						if (commit) {
							didSlide = true;
							didMove = true;
							nextCell.value = cell.value;
							nextCell.wasMerged = cell.wasMerged;
							cell.wasMerged = false;
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

	export function* forwardIterator(cells: ICell[]) {
		for (let i = 0; i < cells.length; i++) {
			yield i;
		}
	}

	export function* backwardIterator(cells: ICell[]) {
		for (let i = cells.length - 1; i >= 0; i--) {
			yield i;
		}
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
	on:up={() => clearAndMove(moveUp)}
	on:down={() => clearAndMove(moveDown)}
	on:left={() => clearAndMove(moveLeft)}
	on:right={() => clearAndMove(moveRight)}
	on:restart={() => restart()}
	on:shrink={() => shrink()}
	on:grow={() => grow()}
	on:showInfo={() => (showInfo = true)}
/>

<InfoDialog bind:showDialog={showInfo} />
<GameOverDialog bind:showDialog={isGameOver} {score} />
