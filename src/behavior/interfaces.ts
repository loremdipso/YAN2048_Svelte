
export interface ICell {
	id: number;
	value: number;
	shouldAppear?: boolean;
	wasMerged?: boolean;
}


export interface IAdjacentCellFn {
	(cells: ICell[], index: number): ICell | undefined;
}