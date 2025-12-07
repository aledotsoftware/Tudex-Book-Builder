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

const player = {
    x: 0,
    y: 0,
    radius: 15,
    color: '#00ffaa'
};

let balls = [];
let ballSpawnTimer = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
}
window.addEventListener('resize', resize);
resize();

function initGame() {
    score = 0;
    scoreEl.textContent = '0.0';
    balls = [];
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    // Initial balls
    for(let i=0; i<3; i++) spawnBall();

    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    audio.init();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function spawnBall() {
    const r = 10 + Math.random() * 10;
    // Spawn at edge
    let x, y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -r : canvas.width + r;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? -r : canvas.height + r;
    }

    const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x) + (Math.random() - 0.5);
    const speed = 200 + Math.random() * 200;

    balls.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: r,
        color: '#ff0055'
    });
}

// Input
let targetX = 0;
let targetY = 0;
let isDragging = false;

function handleInput(x, y) {
    targetX = x;
    targetY = y;
}

function onTouch(e) {
    if (gameState !== 'PLAYING') return;
    e.preventDefault();
    isDragging = true;
    handleInput(e.touches[0].clientX, e.touches[0].clientY);
}
function onTouchMove(e) {
    if (gameState !== 'PLAYING') return;
    e.preventDefault();
    handleInput(e.touches[0].clientX, e.touches[0].clientY);
}
function onMouse(e) {
    if (gameState !== 'PLAYING') return;
    isDragging = true;
    handleInput(e.clientX, e.clientY);
}
function onMouseMove(e) {
    if (gameState !== 'PLAYING' || !isDragging) return;
    handleInput(e.clientX, e.clientY);
}
function onUp() { isDragging = false; }

canvas.addEventListener('touchstart', onTouch, {passive: false});
canvas.addEventListener('touchmove', onTouchMove, {passive: false});
canvas.addEventListener('touchend', onUp);
canvas.addEventListener('mousedown', onMouse);
canvas.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onUp);

function update(dt) {
    if (gameState !== 'PLAYING') return;

    score += dt;
    scoreEl.textContent = score.toFixed(1);

    // Move Player
    if (isDragging) {
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const speed = 400;

        if (dist > 5) {
            player.x += (dx / dist) * speed * dt;
            player.y += (dy / dist) * speed * dt;
        }
    }

    // Clamp player
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    // Spawn Balls
    ballSpawnTimer += dt;
    if (ballSpawnTimer > 3.0) {
        spawnBall();
        ballSpawnTimer = 0;
    }

    // Update Balls
    for (let b of balls) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Bounce off walls
        if (b.x < b.radius || b.x > canvas.width - b.radius) {
            b.vx *= -1;
            b.x = Math.max(b.radius, Math.min(canvas.width - b.radius, b.x));
            audio.playBounce();
        }
        if (b.y < b.radius || b.y > canvas.height - b.radius) {
            b.vy *= -1;
            b.y = Math.max(b.radius, Math.min(canvas.height - b.radius, b.y));
            audio.playBounce();
        }

        // Collision
        const dx = player.x - b.x;
        const dy = player.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < player.radius + b.radius) {
            gameOver();
            return;
        }
    }
}

function gameOver() {
    gameState = 'GAMEOVER';
    finalScoreEl.textContent = score.toFixed(1);
    gameOverScreen.classList.remove('hidden');
    audio.playHit();
}

function draw() {
    // Trails
    ctx.fillStyle = 'rgba(51, 51, 51, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Arena border
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI*2);
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = player.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Balls
    for (let b of balls) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2);
        ctx.fillStyle = b.color;
        ctx.fill();
    }
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
