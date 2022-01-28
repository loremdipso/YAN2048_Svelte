import type { ICell } from "./interfaces";

export const NUM_ROWS = 4;
export const NUM_COLS = 4;

export function getNextRow(
	cells: ICell[],
	index: number
): ICell | undefined {
	return getCellAt(cells, index + NUM_COLS);
}

export function getPreviousRow(
	cells: ICell[],
	index: number
): ICell | undefined {
	return getCellAt(cells, index - NUM_COLS);
}

export function getNextColumn(
	cells: ICell[],
	index: number
): ICell | undefined {
	if ((index + 1) % NUM_COLS === 0) {
		// far right
		return null;
	}
	return getCellAt(cells, index + 1);
}

export function getPreviousColumn(
	cells: ICell[],
	index: number
): ICell | undefined {
	if (index % NUM_COLS === 0) {
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
