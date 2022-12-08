import { BehaviorSubject } from "rxjs";
import { Cell, ICell } from "src/models/cell";
import { CellTypes } from "src/models/cell-type";
import { IDirections, IDirectionOpening } from "src/models/directions";
import { IPlay } from "src/models/play";
import { IPosition } from "src/models/position";


export class Play implements IPlay {
    cells: ICell[][];
    visibleRange: number;
    mouseAt = new BehaviorSubject<IPosition | undefined>(undefined);
    get mouseCurrentlyAt(): IPosition | undefined { return this.mouseAt.value }
    private directions: IDirections[] = [
        {
            min: { row: -1, col: -1 },
            max: { row: -1, col: 1 }
        },
        {
            min: { row: -1, col: 1 },
            max: { row: 1, col: 1 }
        },
        {
            min: { row: 1, col: -1 },
            max: { row: 1, col: 1 }
        },
        {
            min: { row: -1, col: -1 },
            max: { row: 1, col: -1 }
        }
    ];
    constructor(cells: ICell[][], center: IPosition, visibleRange: number) {
        this.cells = cells;
        this.visibleRange = visibleRange;
        this.mouseAt.next(center);
    }
    moveTo(pos: IPosition) {
        this.mouseAt.next(pos);
    }
    moveNext() {
        if (!this.mouseCurrentlyAt) return;
        const dwo = this.getDirectionWiseOpenings().sort((a, b) => b.openings - a.openings);
        if (dwo.length > 0) {
            const direction = dwo[0];
            const rd = (direction.min.row + direction.max.row) / 2;
            const cd = (direction.min.col + direction.max.col) / 2;
            console.log('direction = [' + rd + '][' + cd + ']');
            this.mouseAt.next({
                row: this.mouseCurrentlyAt.row + rd,
                col: this.mouseCurrentlyAt.col + cd
            });
        }
    }
    private getDirectionWiseOpenings(): IDirectionOpening[] {
        let dinfo: IDirectionOpening[] = [];
        if (!this.mouseCurrentlyAt) return [];
        this.directions.forEach(d => {
            let openings = 0;
            loop_depth:
            for (let k = 1; k <= this.visibleRange; k++) {
                if (!this.mouseCurrentlyAt) return;
                const rs = this.mouseCurrentlyAt.row + (d.min.row * k);
                const re = this.mouseCurrentlyAt.row + (d.max.row * k);
                const cs = this.mouseCurrentlyAt.col + (d.min.col * k);
                const ce = this.mouseCurrentlyAt.col + (d.max.col * k);
                loop_row:
                for (let i = rs; i <= re; i++) {
                    loop_col:
                    for (let j = cs; j <= ce; j++) {
                        try {
                            if (this.cells[i][j].type === CellTypes.path_history) {
                                openings = 0;
                                break loop_depth;
                            }
                            if (this.cells[i][j].isAvailableForTravel()) {
                                openings++;
                            }
                        } catch (er) { }
                    }
                }
            }
            if (openings > 0)
                dinfo.push(Object.assign({
                    openings: openings
                }, d));
        });
        return dinfo;
    }
}