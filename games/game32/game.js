const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const startScreen = document.getElementById('start-screen');
const winScreen = document.getElementById('win-screen');
const finalMovesEl = document.getElementById('final-moves');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const audio = new AudioController();

let tiles = [];
let emptyIndex = 8;
let moves = 0;
const SIZE = 3;

function initGame() {
    moves = 0;
    movesEl.textContent = moves;
    startScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    audio.init();

    // Create ordered state
    tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 is empty
    emptyIndex = 8;

    shuffle(100);
    render();
}

function shuffle(steps) {
    // Random valid moves
    for (let i = 0; i < steps; i++) {
        const neighbors = getNeighbors(emptyIndex);
        const rand = neighbors[Math.floor(Math.random() * neighbors.length)];
        swap(emptyIndex, rand, false);
    }
}

function getNeighbors(idx) {
    const neighbors = [];
    const r = Math.floor(idx / SIZE);
    const c = idx % SIZE;

    if (r > 0) neighbors.push(idx - SIZE);
    if (r < SIZE - 1) neighbors.push(idx + SIZE);
    if (c > 0) neighbors.push(idx - 1);
    if (c < SIZE - 1) neighbors.push(idx + 1);

    return neighbors;
}

function swap(i, j, sound=true) {
    const temp = tiles[i];
    tiles[i] = tiles[j];
    tiles[j] = temp;
    emptyIndex = j;
    if (sound) audio.playSlide();
}

function checkWin() {
    for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] !== i + 1) return false;
    }
    return true;
}

function handleInput(index) {
    // Check if neighbor to empty
    const neighbors = getNeighbors(emptyIndex);
    if (neighbors.includes(index)) {
        swap(index, emptyIndex);
        moves++;
        movesEl.textContent = moves;
        render();

        if (checkWin()) {
            setTimeout(() => {
                audio.playWin();
                finalMovesEl.textContent = moves;
                winScreen.classList.remove('hidden');
            }, 200);
        }
    }
}

function render() {
    board.innerHTML = '';
    tiles.forEach((val, idx) => {
        const el = document.createElement('div');
        el.className = 'tile';
        if (val === 0) {
            el.classList.add('empty');
        } else {
            el.textContent = val;
            if (val === idx + 1) el.classList.add('correct');
            el.addEventListener('mousedown', () => handleInput(idx));
            el.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(idx); });
        }
        board.appendChild(el);
    });
}

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
