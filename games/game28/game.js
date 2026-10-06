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
let targets = [];
let spawnTimer = 0;
let spawnRate = 1.0;
let lives = 3;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initGame() {
    score = 0;
    lives = 3;
    scoreEl.textContent = score;
    targets = [];
    spawnRate = 1.0;
    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    audio.init();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function spawnTarget() {
    const radius = 30 + Math.random() * 20;
    targets.push({
        x: Math.random() * (canvas.width - 2*radius) + radius,
        y: Math.random() * (canvas.height - 2*radius) + radius,
        radius: radius,
        maxTime: 2.0 - Math.min(score * 0.05, 1.5),
        timer: 0,
        color: `hsl(${Math.random()*360}, 70%, 50%)`
    });
}

function update(dt) {
    if (gameState !== 'PLAYING') return;

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnTarget();
        spawnTimer = spawnRate;
        if (spawnRate > 0.4) spawnRate -= 0.01;
    }

    for (let i = targets.length - 1; i >= 0; i--) {
        let t = targets[i];
        t.timer += dt;
        if (t.timer >= t.maxTime) {
            targets.splice(i, 1);
            lives--;
            audio.playMiss();
            if (lives <= 0) gameOver();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw targets
    for (let t of targets) {
        const pct = 1 - (t.timer / t.maxTime);

        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius * pct, 0, Math.PI * 2);
        ctx.fillStyle = t.color;
        ctx.fill();

        // Ring
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Lives
    ctx.fillStyle = '#cb4b16';
    for (let i = 0; i < lives; i++) {
        ctx.beginPath();
        ctx.arc(canvas.width - 30 - i*25, 30, 8, 0, Math.PI*2);
        ctx.fill();
    }
}

function checkHit(x, y) {
    for (let i = targets.length - 1; i >= 0; i--) {
        let t = targets[i];
        const dx = t.x - x;
        const dy = t.y - y;
        if (dx*dx + dy*dy < t.radius*t.radius) {
            targets.splice(i, 1);
            score++;
            scoreEl.textContent = score;
            audio.playHit();
            return true;
        }
    }
    return false;
}

function onTouch(e) {
    if (gameState !== 'PLAYING') return;
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
        checkHit(e.touches[i].clientX, e.touches[i].clientY);
    }
}
function onMouse(e) {
    if (gameState !== 'PLAYING') return;
    checkHit(e.clientX, e.clientY);
}

canvas.addEventListener('touchstart', onTouch, {passive: false});
canvas.addEventListener('mousedown', onMouse);

function gameOver() {
    gameState = 'GAMEOVER';
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
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
