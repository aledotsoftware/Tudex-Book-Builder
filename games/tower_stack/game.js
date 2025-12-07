
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let stack = [];
let currentBlock = null;
let direction = 1;
let speed = 4;
let score = 0;
let isGameOver = false;
let gameLoop;
const baseWidth = 200;
const height = 40;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);

function spawnBlock() {
    let y = canvas.height - 100 - (stack.length * height);
    let prev = stack.length > 0 ? stack[stack.length-1] : {w: baseWidth, x: (canvas.width - baseWidth)/2};

    currentBlock = {
        x: 0,
        y: y,
        w: prev.w,
        h: height,
        color: `hsl(${stack.length * 20}, 70%, 50%)`
    };
    // Center logic fix for first spawn
    if (stack.length === 0) currentBlock.x = (canvas.width - baseWidth)/2;
}

function startGame() {
    stack = [];
    score = 0;
    isGameOver = false;
    speed = 4;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').innerText = '0';

    // Base block
    stack.push({
        x: (window.innerWidth - baseWidth)/2,
        y: window.innerHeight - 60,
        w: baseWidth,
        h: height,
        color: '#fff'
    });

    spawnBlock();
    if(gameLoop) cancelAnimationFrame(gameLoop);
    update();
    AudioController.playStart();
}

function update() {
    if(isGameOver) return;
    ctx.clearRect(0,0, canvas.width, canvas.height);

    // Draw Stack
    stack.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    // Move Current
    currentBlock.x += speed * direction;
    if(currentBlock.x + currentBlock.w > canvas.width || currentBlock.x < 0) {
        direction *= -1;
    }

    ctx.fillStyle = currentBlock.color;
    ctx.fillRect(currentBlock.x, currentBlock.y, currentBlock.w, currentBlock.h);

    gameLoop = requestAnimationFrame(update);
}

function placeBlock() {
    if(isGameOver) return;

    let prev = stack[stack.length - 1];
    let curr = currentBlock;

    let diff = curr.x - prev.x;

    if(Math.abs(diff) >= curr.w) {
        gameOver();
        return;
    }

    // Trim
    let newWidth = curr.w - Math.abs(diff);
    let newX = curr.x;
    if(diff > 0) { // Overhang right
        newX = curr.x;
    } else { // Overhang left
        newX = prev.x;
    }

    curr.w = newWidth;
    curr.x = newX; // Align to previous
    if(diff > 0) curr.x = prev.x + diff; // Wait, actually logic:
    // If diff > 0, curr is to the right. Overlap is from curr.x to prev.x + prev.w
    // Correct math:
    // Overlap starts at max(curr.x, prev.x)
    // Ends at min(curr.x + curr.w, prev.x + prev.w)

    let overlapX = Math.max(curr.x, prev.x);
    let overlapEnd = Math.min(curr.x + curr.w, prev.x + prev.w);
    curr.w = overlapEnd - overlapX;
    curr.x = overlapX;

    stack.push(curr);
    score++;
    document.getElementById('score').innerText = score;
    AudioController.playScore();

    // Camera move if too high
    if(curr.y < 200) {
        stack.forEach(b => b.y += height);
    }

    spawnBlock();
}

function gameOver() {
    isGameOver = true;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-screen').classList.add('active');
    AudioController.playLose();
}

document.getElementById('game-container').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if(isGameOver) return;
    placeBlock();
});

document.getElementById('game-container').addEventListener('mousedown', (e) => {
    if(isGameOver) return;
    placeBlock();
});

document.getElementById('game-container').addEventListener('click', (e) => {
     if(document.getElementById('start-screen').classList.contains('active')) startGame();
});
document.getElementById('restart-btn').addEventListener('click', startGame);

resize();
