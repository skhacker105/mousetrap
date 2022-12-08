import { BehaviorSubject } from "rxjs";
import { ICell } from "./cell";
import { IPosition } from "./position";

export interface IPlay {
    cells: ICell[][];
    visibleRange: number;
    mouseAt: BehaviorSubject<IPosition | undefined>;
    moveNext(): void;
}