import Gekitai from "./Gekitai.js";
import Cell from "./Cell.js";
import CellState from "./CellState.js";

class GUI {
    constructor() {
        this.game = null;
        this.images = { PLAYER1: "Black-Piece.svg", PLAYER2: "Red-Piece.svg" };
    }
    coordinates(cell) {
        return new Cell(cell.parentNode.rowIndex, cell.cellIndex);
    }
    printBoard(board) {
        let tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
        for (let i = 0; i < board.length; i++) {
            let tr = document.createElement("tr");
            tbody.appendChild(tr);
            for (let j = 0; j < board[i].length; j++) {
                let td = document.createElement("td");
                if (board[i][j] !== CellState.EMPTY) {
                    td.innerHTML = `<img src="images/${this.images[board[i][j]]}" alt="" />`;
                }
                tr.appendChild(td);
                td.onclick = this.play.bind(this);
            }
        }
    }
    printPath(paths) {
        if (!paths) {
            return;
        }
        let table = document.querySelector("table");
        paths.forEach(path => {
            path.forEach(({ x, y }) => {
                table.rows[x].cells[y].style.animationName = "path";
            });
        });
    }
    disableEvents() {
        let tds = document.querySelectorAll("td");
        tds.forEach(td => td.onclick = undefined);
    }
    changeMessage(m) {
        let objs = { DRAW: "Draw!", PLAYER2: "Red's win!", PLAYER1: "Black's win!" };
        if (m && objs[m.winner]) {
            this.setMessage(`Game Over! ${objs[m.winner]}`);
            this.disableEvents();
            this.printPath(m.sequence);
        } else {
            let msgs = { PLAYER1: "Black's turn.", PLAYER2: "Red's turn." };
            this.setMessage(msgs[this.game.getTurn()]);
        }
    }
    setMessage(message) {
        let msg = document.getElementById("message");
        msg.textContent = message;
    }
    init() {
        let iStart = document.getElementById("start");
        iStart.onclick = this.init.bind(this);
        this.game = new Gekitai();
        let board = this.game.getBoard();
        this.printBoard(board);
        this.changeMessage();
    }
    getTableDate({ x, y }) {
        let table = document.querySelector("table");
        return table.rows[x].cells[y];
    }
    play(evt) {
        let origin = evt.currentTarget;
        try {
            let turn = this.game.getTurn();
            let mr = this.game.move(this.coordinates(origin));
            let image = document.createElement("img");
            image.src = `images/${this.images[turn]}`;
            origin.appendChild(image);
            let toMove = mr.toMove;
            if (toMove) {
                for (let obj of toMove) {
                    let td1 = this.getTableDate(obj[0]);
                    let img = td1.firstChild;
                    if (obj.length === 1) {
                        let anim = img.animate([{ opacity: 1 }, { opacity: 0 }], 1000);
                        anim.onfinish = () => img.parentNode.removeChild(img);
                    }
                    if (obj.length === 2) {
                        let { x: or, y: oc } = obj[0];
                        let td2 = this.getTableDate(obj[1]);
                        let { x: dr, y: dc } = obj[1];
                        let anim = img.animate([{ top: 0, left: 0 }, { top: `${(dr - or) * 58}px`, left: `${(dc - oc) * 58}px` }], 1000);
                        anim.onfinish = () => td2.appendChild(img);
                    }
                }
            }
            this.changeMessage(mr);
        } catch (ex) {
            this.setMessage(ex.message);
        }
    }
}
let gui = new GUI();
gui.init();