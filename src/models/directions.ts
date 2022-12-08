import { IPosition } from "./position";

export interface IDirections {
    min: IPosition,
    max: IPosition
}

export interface IDirectionOpening extends IDirections {
    openings: number;
}