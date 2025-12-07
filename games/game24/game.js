const grid = document.getElementById('grid');
const levelEl = document.getElementById('level');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalLevelEl = document.getElementById('final-level');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const audio = new AudioController();

let level = 1;
let sequence = [];
let playerSequence = [];
let isPlayingSequence = false;
let cells = [];

// Create Grid
for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('mousedown', () => handleInput(i));
    cell.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(i); });
    grid.appendChild(cell);
    cells.push(cell);
}

function initGame() {
    level = 1;
    sequence = [];
    levelEl.textContent = level;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    audio.init();

    setTimeout(nextLevel, 1000);
}

function nextLevel() {
    playerSequence = [];
    levelEl.textContent = level;

    // Add random step
    sequence.push(Math.floor(Math.random() * 9));

    playSequence();
}

function playSequence() {
    isPlayingSequence = true;
    let i = 0;
    const interval = setInterval(() => {
        if (i >= sequence.length) {
            clearInterval(interval);
            isPlayingSequence = false;
            return;
        }

        const idx = sequence[i];
        activateCell(idx);
        i++;
    }, 600); // Speed
}

function activateCell(index) {
    const cell = cells[index];
    cell.classList.add('active');
    audio.playNote(index);
    setTimeout(() => {
        cell.classList.remove('active');
    }, 300);
}

function handleInput(index) {
    if (isPlayingSequence) return;

    // Visual feedback
    const cell = cells[index];
    cell.classList.add('active');
    audio.playNote(index);
    setTimeout(() => cell.classList.remove('active'), 200);

    // Check logic
    const currentStep = playerSequence.length;
    if (sequence[currentStep] === index) {
        playerSequence.push(index);

        if (playerSequence.length === sequence.length) {
            level++;
            setTimeout(nextLevel, 1000);
        }
    } else {
        // Wrong
        cell.classList.add('wrong');
        audio.playFail();
        setTimeout(() => cell.classList.remove('wrong'), 500);
        gameOver();
    }
}

function gameOver() {
    finalLevelEl.textContent = level;
    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 500);
}

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
