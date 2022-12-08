import { Component, OnInit } from '@angular/core';
import { EmptyCell, ICell, WallCell } from 'src/models/cell';
import { IPlay } from 'src/models/play';
import { IPosition } from 'src/models/position';
import { Play } from './game-plays/play-default';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'MouseTrap';
  rows = 100;
  cols = 100;
  passageWidth = 4;
  wallWidth = 0;
  complexity = 4;
  center: IPosition | undefined;
  cells: ICell[][] = [];
  visibleRange = 5;
  game: IPlay | undefined;

  ngOnInit(): void {
    this.generateField();
    this.applyCenter();
    this.generateWalls();
    this.setGame();
  }

  setGame() {
    if (!this.cells || !this.center) return;
    let gameStarted = false;
    this.game = new Play(this.cells, this.center, this.visibleRange);
    this.game.mouseAt.subscribe(p => {
      console.log('mouse position changed');
      if (p && gameStarted) this.updateMovedPosition(p);
      else gameStarted = true;
    });
  }

  nextMove() {
    this.game?.moveNext();
  }

  updateMovedPosition(pos: IPosition) {
    if (!this.center) return;
    console.log('mouse position updated');
    this.cells[this.center.row][this.center.col].setAsPathHistory();
    this.center = pos;
    this.applyCenter();
  }

  generateField() {
    let row_loops = Array.from({ length: this.rows }, (_, i) => i + 1);
    let col_loops = Array.from({ length: this.cols }, (_, i) => i + 1);
    this.resetField();
    row_loops.forEach(r => {
      let r_arr: any[] = [];
      col_loops.forEach(c => {
        r_arr.push(new EmptyCell());
      })
      this.cells.push(r_arr);
    })
  }

  resetField() {
    this.cells = [];
    this.center = this.findCenter();
  }

  findCenter(): IPosition {
    return {
      row: Math.ceil(this.rows / 2),
      col: Math.ceil(this.cols / 2)
    }
  }

  applyCenter() {
    if (!this.center) return;
    this.cells[this.center.row][this.center.col].getsTheMouse();
    // console.log('center = ', this.center)
  }

  generateWalls() {
    if (!this.center) return;
    let min = (this.rows < this.cols ? this.rows : this.cols) / 2;
    for (let radius = this.passageWidth; radius < min; radius = radius + this.wallWidth + this.passageWidth) {
      this.generateWall(radius);
    }
  }

  generateWall(radius: number) {
    if (!this.center) return;
    // leave passage of width from mouse in all direction and build first wall
    let start_row = this.center.row - radius;
    let end_row = this.center.row + radius;
    let start_col = this.center.col - radius;
    let end_col = this.center.col + radius;
    let openings: IPosition[] = this.getRandomOpenings(radius, start_row, end_row, start_col, end_col);
    let blocks: IPosition[] = this.getRandomBlock(radius, start_row, end_row, start_col, end_col);
    for (let i = start_row - this.wallWidth; i <= end_row + this.wallWidth; i++) {
      for (let j = start_col - this.wallWidth; j <= end_col + this.wallWidth; j++) {
        // draw boudry
        if ((i <= start_row || i >= end_row || j <= start_col || j >= end_col) && !openings.some(o => o.row === i && o.col === j)) {
          this.cells[i][j] = new WallCell();
        }
      }
    }
    blocks.forEach(b => {
      try {
        // check if any opening near given coordinate
        let foundOpening = openings.some(o =>
          b.row >= o.row - this.passageWidth &&
          b.row <= o.row + this.passageWidth &&
          b.col >= o.col - this.passageWidth &&
          b.col <= o.col + this.passageWidth
        );
        if (b.row > 0 && b.col > 0 && b.row < this.rows && b.col < this.cols && !foundOpening)
          this.cells[b.row][b.col] = new WallCell();
      } catch (er) {
        console.log('error = ', er)
        console.log('for = ', b)
      }
    });
  }

  getRandomOpenings(radius: number, start_row: number, end_row: number, start_col: number, end_col: number): IPosition[] {
    let o = Array.from({ length: this.complexity }, (_, i) => i + 1);
    let openings: IPosition[] = [];
    o.forEach(v => {
      let start: IPosition = { row: 0, col: 0 };
      let move: IPosition = { row: 0, col: 0 };
      switch (v % 4) {
        case 0: // top
          let t = Math.floor((Math.random() * this.cols) % (end_col - start_col));
          start = { row: start_row, col: start_col + t }
          move = { row: -1, col: 0 }
          break;
        case 1: // right
          let r = Math.floor((Math.random() * this.rows) % (end_row - start_row));
          start = { row: start_row + r, col: end_col }
          move = { row: 0, col: 1 }
          break;
        case 2:  // bottom
          let b = Math.floor((Math.random() * this.cols) % (end_col - start_col));
          start = { row: end_row, col: start_col + b }
          move = { row: 1, col: 0 }
          break;
        case 3: // left
          let l = Math.floor((Math.random() * this.rows) % (end_row - start_row));
          start = { row: start_row + l, col: start_col }
          move = { row: 0, col: -1 }
          break;
      }

      for (let k = 0; k <= this.wallWidth; k++) {
        openings.push({
          row: start.row + (move.row * k),
          col: start.col + (move.col * k)
        });
      }
    });
    return openings;
  }

  getRandomBlock(radius: number, start_row: number, end_row: number, start_col: number, end_col: number): IPosition[] {
    let o = Array.from({ length: this.complexity }, (_, i) => i + 1);
    let walls: IPosition[] = [];
    o.forEach(v => {
      let start: IPosition = { row: 0, col: 0 };
      let move: IPosition = { row: 0, col: 0 };
      switch (v % 4) {
        case 0: // top
          let t = Math.floor((Math.random() * this.cols) % (end_col - start_col));
          start = { row: start_row - this.wallWidth - 1, col: start_col + t }
          move = { row: -1, col: 0 }
          break;
        case 1: // right
          let r = Math.floor((Math.random() * this.rows) % (end_row - start_row));
          start = { row: start_row + r, col: end_col + this.wallWidth + 1 }
          move = { row: 0, col: 1 }
          break;
        case 2:  // bottom
          let b = Math.floor((Math.random() * this.cols) % (end_col - start_col));
          start = { row: end_row + this.wallWidth + 1, col: start_col + b }
          move = { row: 1, col: 0 }
          break;
        case 3: // left
          let l = Math.floor((Math.random() * this.rows) % (end_row - start_row));
          start = { row: start_row + l, col: start_col - this.wallWidth - 1 }
          move = { row: 0, col: -1 }
          break;
      }

      for (let k = 0; k < this.passageWidth; k++) {
        walls.push({
          row: start.row + (move.row * k),
          col: start.col + (move.col * k)
        });
      }
    });
    return walls;
  }

}
