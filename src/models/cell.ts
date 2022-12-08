import { CellTypes } from "./cell-type";

export interface ICell {
    type: CellTypes;
    originalType: CellTypes;
    click(): void;
    reset(): void;
    getsTheMouse(): void;
    setAsPathHistory(): void;
    isAvailableForTravel(): boolean;
}

export abstract class Cell implements ICell {
    public type: CellTypes;
    public originalType: CellTypes;
    constructor(type: CellTypes) {
        this.type = type;
        this.originalType = type;
    }
    reset(): void {
        this.type = this.originalType;
    }
    setAsPathHistory() {
        this.type = CellTypes.path_history;
    }
    abstract click(): void;
    abstract getsTheMouse(): void;
    abstract isAvailableForTravel(): boolean;
}

export class EmptyCell extends Cell {
    selectedAsPath = false;
    constructor() {
        super(CellTypes.empty);
        this.originalType = CellTypes.empty;
    }
    isAvailableForTravel(): boolean {
        return !this.selectedAsPath;
    }
    click(): void {
        if (this.selectedAsPath) {
            this.type = this.originalType;
            this.selectedAsPath = false;
        }
        else {
            this.type = CellTypes.path;
            this.selectedAsPath = true;
        }
    }
    getsTheMouse(): void {
        this.type = CellTypes.mouse;
    }
}

export class WallCell extends Cell {
    constructor() {
        super(CellTypes.wall);
    }
    click(): void { // do nothing
    }
    isAvailableForTravel(): boolean {
        return false;
    }
    getsTheMouse(): void { // do nothing
    }
}