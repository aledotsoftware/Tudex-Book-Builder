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
let cameraY = 0;

const player = {
    x: 0,
    y: 0,
    w: 20,
    h: 20,
    vx: 0,
    vy: 0,
    onGround: false
};

const platforms = [];
const GRAVITY = 1200;
const JUMP_FORCE = -750;
const MOVE_SPEED = 400;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initGame() {
    score = 0;
    cameraY = 0;
    scoreEl.textContent = score;

    player.x = canvas.width / 2 - 10;
    player.y = canvas.height - 150;
    player.vx = 0;
    player.vy = 0;

    platforms.length = 0;
    // Ground
    platforms.push({x: 0, y: canvas.height - 50, w: canvas.width, h: 50, type: 'normal'});

    generatePlatforms(canvas.height - 200);

    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    audio.init();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function generatePlatforms(startY) {
    let y = startY;
    while (y > cameraY - canvas.height) { // Gen ahead
        const w = 60 + Math.random() * 80;
        const x = Math.random() * (canvas.width - w);
        platforms.push({
            x: x,
            y: y,
            w: w,
            h: 15,
            type: 'normal'
        });
        y -= 80 + Math.random() * 60;
    }
}

// Input
let inputDir = 0;

function handleTouch(e) {
    if (gameState !== 'PLAYING') return;
    const x = e.touches[0].clientX;
    if (x < canvas.width / 2) inputDir = -1;
    else inputDir = 1;
}

function handleTouchEnd() {
    inputDir = 0;
}

// Keyboard for testing
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') inputDir = -1;
    if (e.key === 'ArrowRight') inputDir = 1;
});
window.addEventListener('keyup', () => { inputDir = 0; });

canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchend', handleTouchEnd);
canvas.addEventListener('mousedown', (e) => {
     if (gameState !== 'PLAYING') return;
     if (e.clientX < canvas.width / 2) inputDir = -1;
     else inputDir = 1;
});
canvas.addEventListener('mouseup', () => inputDir = 0);

function update(dt) {
    if (gameState !== 'PLAYING') return;

    // Horizontal Movement
    player.vx = inputDir * MOVE_SPEED;
    player.x += player.vx * dt;

    // Wrap around
    if (player.x + player.w < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = -player.w;

    // Vertical Movement
    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;

    // Platforms collision (only falling down)
    if (player.vy > 0) {
        for (let p of platforms) {
            if (player.x + player.w > p.x && player.x < p.x + p.w &&
                player.y + player.h >= p.y && player.y + player.h <= p.y + p.h + 10 && // +10 leniency
                player.y + player.h - player.vy * dt <= p.y + 10 // was above?
               ) {
                player.y = p.y - player.h;
                player.vy = JUMP_FORCE;
                audio.playJump();
                audio.playLand();
            }
        }
    }

    // Camera
    if (player.y < canvas.height / 2 + cameraY) {
        cameraY = player.y - canvas.height / 2;
        score = Math.floor(Math.abs(cameraY));
        scoreEl.textContent = score;

        generatePlatforms(platforms[platforms.length-1].y - 100);
    }

    // Cleanup platforms
    if (platforms.length > 0 && platforms[0].y > cameraY + canvas.height + 100) {
        platforms.shift();
    }

    // Game Over
    if (player.y > cameraY + canvas.height + 100) {
        gameOver();
    }
}

function gameOver() {
    gameState = 'GAMEOVER';
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
    audio.playDead();
}

function draw() {
    // BG
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(0, -cameraY);

    // Platforms
    ctx.fillStyle = '#0f0';
    for (let p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
    }

    // Player
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    // Eyes
    ctx.fillStyle = '#000';
    if (inputDir === -1) {
         ctx.fillRect(player.x + 4, player.y + 4, 4, 4);
    } else {
         ctx.fillRect(player.x + 12, player.y + 4, 4, 4);
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

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
