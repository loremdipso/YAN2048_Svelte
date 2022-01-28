import { shuffleArray } from "./common/utils";

export interface ICell {
	id: number;
	value: number;
	shouldAppear?: boolean;
	wasMerged?: boolean;
}

const newCellValues = [1, 2, 4];

export function generateCells(totalCells: number, nonEmptyCells): ICell[] {
	let cells: ICell[] = [];
	for (let i = 0; i < totalCells; i++) {
		if (i < nonEmptyCells) {
			cells.push(generateRandomCell());
		} else {
			cells.push(generateEmptyCell());
		}
	}
	shuffleArray(cells);
	return cells;
}

export function generateEmptyCell(): ICell {
	return {
		id: getCellId(),
		value: 0
	};
}

export function generateRandomCell(): ICell {
	return {
		id: getCellId(),
		value: getRandomStartingValue(),
	};
}

export function getRandomStartingValue(): number {
	return getRandomElement(newCellValues);
}

export function getRandomElement<T>(arr: T[]): T {
	return arr[getRandomInt(0, arr.length) % arr.length];
}

function getRandomInt(min: number, maxExclusive: number): number {
	return min + Math.floor(Math.random() * maxExclusive);
}

export const getCellId = (() => {
	let id = 0;
	return () => {
		return id++;
	};
})();

export interface ICell {
	id: number;
	value: number;
}

const COLORS = [
	"#79867c",
	"#926d6f",
	"#9c1ce3",
	"#4f0af5",
	"#18a1e7",
	"#3e66c1",
	"#9edb24",
	"#48c639",
	"#ead515",
	"#f96d06",
	"#ff0700",
	"#ff00cc"

	// "#001f3f",
	// "#0074D9",
	// "#7FDBFF",
	// "#39CCCC",
	// "#3D9970",
	// "#2ECC40",
	// "#01FF70",
	// "#FFDC00",
	// "#FF851B",
	// "#FF4136",
	// "#85144b",
	// "#F012BE",
	// "#B10DC9",
	// "#111111",
	// "#AAAAAA",
	// "#DDDDDD"
];

export function valueToColor(value: number): string {
	return COLORS[value % COLORS.length];
}
