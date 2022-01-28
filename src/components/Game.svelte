<script lang="ts">
	import {
		generateCells,
		getRandomElement,
		getRandomStartingValue,
		ICell,
	} from "../helpers";
	import Board from "./Board.svelte";

	export const NUM_ROWS = 4;
	export const NUM_COLS = 4;

	let cells = generateCells(NUM_COLS * NUM_ROWS, 3);
	let score = 0;
	let isGameOver = false;

	interface IAdjacentCellFn {
		(cells: ICell[], index: number): ICell | undefined;
	}

	function handleKeydown(event) {
		const key = event.key;
		const keyCode = event.keyCode;

		switch (event.key) {
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

	function didMove() {
		if (addRandomCell()) {
			score += 1;
		}
	}

	function addRandomCell(): boolean {
		// clearTimeout(clearCellsCB);

		let empties = [];
		for (let cell of cells) {
			if (cell.value === 0) {
				empties.push(cell);
			}
			cell.shouldAppear = false;
		}

		if (empties.length === 0) {
			doGameOver();
			return false;
		} else {
			let randomCell = getRandomElement(empties);
			randomCell.value = getRandomStartingValue();
			randomCell.shouldAppear = true;

			// clearCellsCB = setTimeout(() => {
			// 	for (let cell of cells) {
			// 		cell.shouldAppear = false;
			// 		cell.wasMerged = false;
			// 	}
			// }, 200);

			return true;
		}
	}

	function doGameOver() {
		if (!isGameOver) {
			isGameOver = true;
			console.log("Game over");
			// 	dialog.closeAll();
			// 	let dialogRef = dialog.open(GameOverComponent);
			// 	dialogRef.afterClosed().subscribe((value) => {
			// 		isGameOver = false;
			// 		switch (value) {
			// 			case GAME_OVER_ACTIONS.reset:
			// 				reset();
			// 				break;
			// 			case GAME_OVER_ACTIONS.half:
			// 				half();
			// 				break;
			// 		}
			// 	});
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

	function getNextRow(cells: ICell[], index: number): ICell | undefined {
		return getCellAt(cells, index + NUM_COLS);
	}

	function getPreviousRow(cells: ICell[], index: number): ICell | undefined {
		return getCellAt(cells, index - NUM_COLS);
	}

	function getNextColumn(cells: ICell[], index: number): ICell | undefined {
		if ((index + 1) % NUM_COLS === 0) {
			// far right
			return null;
		}
		return getCellAt(cells, index + 1);
	}

	function getPreviousColumn(
		cells: ICell[],
		index: number
	): ICell | undefined {
		if (index % NUM_COLS === 0) {
			// far left
			return null;
		}
		return getCellAt(cells, index - 1);
	}

	function getCellAt(cells: ICell[], index: number): ICell | undefined {
		let cell = cells[index];
		return cell;
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
			doGameOver();
		} else {
			console.info("could move");
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
</script>

<svelte:window on:keydown={handleKeydown} />

<Board
	bind:cells
	on:up={() => moveUp()}
	on:down={() => moveDown()}
	on:left={() => moveLeft()}
	on:right={() => moveRight()}
/>
