const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const audio = new AudioController();

let gameState = 'MENU';
let score = 0;
let lastTime = 0;

const BLOCK_HEIGHT = 40;
const INITIAL_WIDTH = 200;
let currentWidth = INITIAL_WIDTH;
let speed = 200; // px per second

const blocks = [];
let currentBlock = null;
let direction = 1; // 1 or -1
let offset = 0; // vertical offset for camera

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initGame() {
    score = 0;
    currentWidth = INITIAL_WIDTH;
    speed = 200;
    direction = 1;
    offset = 0;
    scoreEl.textContent = score;

    blocks.length = 0;
    // Base block
    blocks.push({
        x: (canvas.width - INITIAL_WIDTH) / 2,
        y: canvas.height - 100,
        w: INITIAL_WIDTH,
        h: BLOCK_HEIGHT,
        color: `hsl(0, 70%, 60%)`
    });

    spawnNextBlock();

    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    audio.init();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function spawnNextBlock() {
    const prevBlock = blocks[blocks.length - 1];
    const y = prevBlock.y - BLOCK_HEIGHT;

    currentBlock = {
        x: 0, // start from left
        y: y,
        w: currentWidth,
        h: BLOCK_HEIGHT,
        color: `hsl(${score * 10}, 70%, 60%)`
    };

    // Randomize start side
    if (Math.random() > 0.5) {
        currentBlock.x = -currentWidth;
        direction = 1;
    } else {
        currentBlock.x = canvas.width;
        direction = -1;
    }
}

function placeBlock() {
    if (!currentBlock) return;

    const prevBlock = blocks[blocks.length - 1];
    const diff = currentBlock.x - prevBlock.x;

    if (Math.abs(diff) > currentWidth) {
        // Missed completely
        gameOver();
        return;
    }

    let perfect = false;
    if (Math.abs(diff) < 5) {
        // Perfect placement snap
        currentBlock.x = prevBlock.x;
        perfect = true;
        audio.playPerfect();
    } else {
        // Trim
        audio.playPlace();
        if (diff > 0) {
            // Overhang right
            currentBlock.w -= diff;
        } else {
            // Overhang left
            currentBlock.w += diff;
            currentBlock.x = prevBlock.x;
        }
        currentWidth = currentBlock.w;
    }

    blocks.push(currentBlock);
    score++;
    scoreEl.textContent = score;
    speed += 5;

    spawnNextBlock();
}

function gameOver() {
    gameState = 'GAMEOVER';
    audio.playFail();
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function update(dt) {
    if (gameState !== 'PLAYING') return;

    currentBlock.x += speed * direction * dt;

    // Bounce off walls (technically game logic usually wraps or reverses, let's reverse)
    if (currentBlock.x > canvas.width + 100 && direction === 1) {
        direction = -1;
    } else if (currentBlock.x < -currentBlock.w - 100 && direction === -1) {
        direction = 1;
    }

    // Camera target
    const targetOffset = Math.max(0, (blocks.length * BLOCK_HEIGHT) - (canvas.height / 2));
    offset += (targetOffset - offset) * 5 * dt;
}

function draw() {
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(0, offset);

    // Draw Blocks
    for (let b of blocks) {
        ctx.fillStyle = b.color;
        // Simple 3D effect
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(b.x, b.y, b.w, 5); // highlight top
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(b.x + b.w - 5, b.y, 5, b.h); // shadow right
    }

    // Draw Current Block
    if (currentBlock) {
        ctx.fillStyle = currentBlock.color;
        ctx.fillRect(currentBlock.x, currentBlock.y, currentBlock.w, currentBlock.h);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(currentBlock.x, currentBlock.y, currentBlock.w, 5);
    }

    ctx.restore();
}

function gameLoop(timestamp) {
    if (gameState !== 'PLAYING') return;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}

function onInput(e) {
    e.preventDefault();
    if (gameState === 'PLAYING') {
        placeBlock();
    }
}

canvas.addEventListener('mousedown', onInput);
canvas.addEventListener('touchstart', onInput, {passive: false});

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
