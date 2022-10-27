import CellState from "./CellState.js";
import Cell from "./Cell.js";
import Player from "./Player.js";
import Winner from "./Winner.js";

export default class Gekitai {
    constructor() {
        this.rows = 6;
        this.cols = 6;
        this.qtt = 3;
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(CellState.EMPTY));
        this.turn = Player.PLAYER1;
        this.player1Pieces = 8;
        this.player2Pieces = 8;
    }
    getBoard() {
        return this.board;
    }
    move(cell) {
        let { x, y } = cell;
        if (!cell) {
            throw new Error("The cell does not exist.");
        }
        if (!this.onBoard(cell)) {
            throw new Error("The cell is not on the board.");
        }
        if (this.board[x][y] !== CellState.EMPTY) {
            throw new Error("The cell is not empty.");
        }
        this.board[x][y] = (this.turn === Player.PLAYER1) ? CellState.PLAYER1 : CellState.PLAYER2;
        let piecesToMove = this.movePieces(cell);
        if (this.turn === Player.PLAYER1) {
            this.player1Pieces--;
            this.turn = Player.PLAYER2;
        } else {
            this.player2Pieces--;
            this.turn = Player.PLAYER1;
        }
        let obj = this.endOfGame();
        obj.toMove = piecesToMove;
        return obj;
    }
    movePieces(cell) {
        let toMove = [];
        let { x: row, y: col } = cell;
        let cells = [{ x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
        for (let { x, y } of cells) {
            let c1 = new Cell(row + x, col + y);
            let c2 = new Cell(row + 2 * x, col + 2 * y);
            if (!this.onBoard(c1)) {
                continue;
            }
            if (this.board[c1.x][c1.y] !== CellState.EMPTY && !this.onBoard(c2)) {
                this.board[c1.x][c1.y] === CellState.PLAYER1 ? this.player1Pieces++ : this.player2Pieces++;
                this.board[c1.x][c1.y] = CellState.EMPTY;
                toMove.push([c1]);
                continue;
            }
            if (this.board[c1.x][c1.y] !== CellState.EMPTY && this.board[c2.x][c2.y] === CellState.EMPTY) {
                this.board[c2.x][c2.y] = this.board[c1.x][c1.y];
                this.board[c1.x][c1.y] = CellState.EMPTY;
                toMove.push([c1, c2]);
            }
        }
        return toMove;
    }
    endOfGame(matrix = this.board) {
        let check = (i, j) => {
            let piece = matrix[i][j];
            if (piece === CellState.EMPTY) {
                return false;
            }
            let cells = [{ x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
            for (let { x, y } of cells) {
                let sequence = [new Cell(i, j)];
                for (let k = 1; ; k++) {
                    let row = i + k * x, col = j + k * y;
                    let cell = new Cell(row, col);
                    if (!this.onBoard(cell)) {
                        break;
                    }
                    if (piece !== matrix[row][col]) {
                        break;
                    }
                    sequence.push(cell);
                    if (sequence.length === this.qtt) {
                        return sequence;
                    }
                }
            }
            return false;
        };
        let p1Sequence = null, p2Sequence = null;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let sequence = check(i, j);
                if (sequence) {
                    if (matrix[i][j] === CellState.PLAYER1) {
                        p1Sequence = sequence;
                    }
                    if (matrix[i][j] === CellState.PLAYER2) {
                        p2Sequence = sequence;
                    }
                }
            }
        }
        if (p1Sequence && p2Sequence) {
            return { sequence: [p1Sequence, p2Sequence], winner: Winner.DRAW };
        }
        if (p1Sequence) {
            return { sequence: [p1Sequence], winner: Winner.PLAYER1 };
        }
        if (p2Sequence) {
            return { sequence: [p2Sequence], winner: Winner.PLAYER2 };
        }
        return { sequence: null, winner: this.player1Pieces == 0 ? Winner.PLAYER1 : this.player2Pieces == 0 ? Winner.PLAYER2 : Winner.NONE };
    }
    getTurn() {
        return this.turn;
    }
    onBoard({ x, y }) {
        let inLimit = (value, limit) => value >= 0 && value < limit;
        return inLimit(x, this.rows) && inLimit(y, this.cols);
    }
}