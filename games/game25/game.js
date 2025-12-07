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
let bubbles = [];
let spawnTimer = 0;
let missedCount = 0;
const MAX_MISSED = 5;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initGame() {
    score = 0;
    missedCount = 0;
    bubbles = [];
    scoreEl.textContent = score;
    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    audio.init();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function spawnBubble() {
    const radius = 30 + Math.random() * 30;
    bubbles.push({
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: canvas.height + radius,
        radius: radius,
        speed: 50 + Math.random() * 100 + (score * 2), // Speed up over time
        wobbleOffset: Math.random() * Math.PI * 2,
        color: `hsla(${Math.random() * 360}, 70%, 60%, 0.6)`
    });
}

function update(dt) {
    if (gameState !== 'PLAYING') return;

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnBubble();
        spawnTimer = Math.max(0.2, 1.0 - score * 0.01);
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
        let b = bubbles[i];
        b.y -= b.speed * dt;
        b.x += Math.sin(Date.now() / 500 + b.wobbleOffset) * 20 * dt;

        if (b.y < -b.radius) {
            bubbles.splice(i, 1);
            missedCount++;
            if (missedCount >= MAX_MISSED) {
                gameOver();
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let b of bubbles) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Shine
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fill();
    }

    // UI - Missed indicators
    ctx.fillStyle = 'red';
    for (let i = 0; i < MAX_MISSED - missedCount; i++) {
        ctx.beginPath();
        ctx.arc(canvas.width - 30 - (i * 25), 30, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

function checkPop(x, y) {
    for (let i = bubbles.length - 1; i >= 0; i--) {
        let b = bubbles[i];
        const dx = b.x - x;
        const dy = b.y - y;
        if (dx*dx + dy*dy < b.radius * b.radius) {
            bubbles.splice(i, 1);
            score++;
            scoreEl.textContent = score;
            audio.playPop();
            return true;
        }
    }
    return false;
}

function onTouch(e) {
    if (gameState !== 'PLAYING') return;
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
        checkPop(e.touches[i].clientX, e.touches[i].clientY);
    }
}

function onMouse(e) {
    if (gameState !== 'PLAYING') return;
    checkPop(e.clientX, e.clientY);
}

canvas.addEventListener('touchstart', onTouch, {passive: false});
canvas.addEventListener('mousedown', onMouse);

function gameOver() {
    gameState = 'GAMEOVER';
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
    audio.playFail();
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
