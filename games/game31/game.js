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

const center = { x: 0, y: 0 };
const radius = 100;
let angle = 0;
let speed = 2.0; // rad/s
let targets = [];
let nextTargetAngle = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    center.x = canvas.width / 2;
    center.y = canvas.height / 2;
}
window.addEventListener('resize', resize);
resize();

function initGame() {
    score = 0;
    scoreEl.textContent = score;
    angle = 0;
    speed = 2.0;
    targets = [];
    spawnTarget();

    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    audio.init();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function spawnTarget() {
    // Spawn ahead of current angle
    const offset = Math.PI/2 + Math.random() * Math.PI;
    let tAngle = angle + offset;
    // Normalize
    // We keep tAngle > angle for easier math
    targets.push({
        angle: tAngle,
        hit: false,
        width: 0.3 // arc width in radians
    });
}

function update(dt) {
    if (gameState !== 'PLAYING') return;

    angle += speed * dt;

    // Check missed targets
    if (targets.length > 0) {
        if (angle > targets[0].angle + targets[0].width) {
             // Missed
             gameOver();
        }
    }
}

function handleInput() {
    if (gameState !== 'PLAYING') return;

    if (targets.length === 0) return;

    const t = targets[0];
    // Check if cursor angle is within target
    if (angle >= t.angle - t.width/2 && angle <= t.angle + t.width/2) {
        // Hit
        targets.shift();
        score++;
        scoreEl.textContent = score;
        speed += 0.1;
        audio.playHit();
        spawnTarget();

        // Visual Hit effect
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius + 20, 0, Math.PI*2);
        ctx.fill();
    } else {
        // Miss (clicked too early)
        gameOver();
    }
}

function gameOver() {
    gameState = 'GAMEOVER';
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
    audio.playMiss();
}

function draw() {
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Circle track
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Targets
    for (let t of targets) {
        ctx.strokeStyle = '#e91e63';
        ctx.lineWidth = 10;
        ctx.beginPath();
        // Visual angle needs to wrap 0-2PI for arc drawing?
        // Actually arc takes any radians.
        // We draw relative to center.
        ctx.arc(center.x, center.y, radius, t.angle - t.width/2, t.angle + t.width/2);
        ctx.stroke();
    }

    // Player Cursor
    const px = center.x + Math.cos(angle) * radius;
    const py = center.y + Math.sin(angle) * radius;

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI*2);
    ctx.fill();

    // Beat Line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(px, py);
    ctx.stroke();
}

function gameLoop(timestamp) {
    if (gameState !== 'PLAYING') return;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}

// Input
canvas.addEventListener('mousedown', (e) => { e.preventDefault(); handleInput(); });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(); }, {passive: false});

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
