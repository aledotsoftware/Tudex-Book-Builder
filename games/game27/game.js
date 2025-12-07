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

const snake = {
    x: 0,
    y: 0,
    angle: 0,
    speed: 150,
    radius: 8,
    body: []
};

const food = {
    x: 0,
    y: 0,
    radius: 6,
    active: true
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initGame() {
    score = 0;
    scoreEl.textContent = score;

    snake.x = canvas.width / 2;
    snake.y = canvas.height / 2;
    snake.angle = Math.random() * Math.PI * 2;
    snake.speed = 150;
    snake.body = [];
    // Init body
    for (let i = 0; i < 20; i++) {
        snake.body.push({x: snake.x, y: snake.y});
    }

    spawnFood();

    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    audio.init();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function spawnFood() {
    food.x = Math.random() * (canvas.width - 20) + 10;
    food.y = Math.random() * (canvas.height - 20) + 10;
    food.active = true;
}

// Input
let targetAngle = 0;
let isTouching = false;

function handleInput(x, y) {
    const dx = x - snake.x;
    const dy = y - snake.y;
    targetAngle = Math.atan2(dy, dx);
}

function onTouch(e) {
    if (gameState !== 'PLAYING') return;
    e.preventDefault();
    isTouching = true;
    handleInput(e.touches[0].clientX, e.touches[0].clientY);
}
function onTouchMove(e) {
    if (gameState !== 'PLAYING') return;
    e.preventDefault();
    handleInput(e.touches[0].clientX, e.touches[0].clientY);
}
function onMouse(e) {
    if (gameState !== 'PLAYING') return;
    isTouching = true;
    handleInput(e.clientX, e.clientY);
}
function onMouseMove(e) {
    if (gameState !== 'PLAYING' || !isTouching) return;
    handleInput(e.clientX, e.clientY);
}
function onUp() { isTouching = false; }

canvas.addEventListener('touchstart', onTouch, {passive: false});
canvas.addEventListener('touchmove', onTouchMove, {passive: false});
canvas.addEventListener('touchend', onUp);
canvas.addEventListener('mousedown', onMouse);
canvas.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onUp);

function update(dt) {
    if (gameState !== 'PLAYING') return;

    // Rotate towards target
    if (isTouching) {
        let diff = targetAngle - snake.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const turnSpeed = 4.0;
        if (Math.abs(diff) < turnSpeed * dt) snake.angle = targetAngle;
        else snake.angle += Math.sign(diff) * turnSpeed * dt;
    }

    // Move
    const moveDist = snake.speed * dt;
    snake.x += Math.cos(snake.angle) * moveDist;
    snake.y += Math.sin(snake.angle) * moveDist;

    // Wall wrap
    if (snake.x < 0) snake.x = canvas.width;
    if (snake.x > canvas.width) snake.x = 0;
    if (snake.y < 0) snake.y = canvas.height;
    if (snake.y > canvas.height) snake.y = 0;

    // Body follow
    snake.body.unshift({x: snake.x, y: snake.y});

    // Length management (grow based on score)
    const targetLength = 20 + score * 5;
    while (snake.body.length > targetLength) {
        snake.body.pop();
    }

    // Food Collision
    const dx = snake.x - food.x;
    const dy = snake.y - food.y;
    if (Math.sqrt(dx*dx + dy*dy) < snake.radius + food.radius) {
        score++;
        scoreEl.textContent = score;
        snake.speed += 2;
        audio.playEat();
        spawnFood();
    }

    // Self Collision
    // Check head against body (skip first few segments)
    for (let i = 10; i < snake.body.length; i += 2) {
        const seg = snake.body[i];
        const dist = Math.sqrt((snake.x - seg.x)**2 + (snake.y - seg.y)**2);
        if (dist < snake.radius) {
            gameOver();
            return;
        }
    }
}

function gameOver() {
    gameState = 'GAMEOVER';
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
    audio.playDie();
}

function draw() {
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Food
    ctx.beginPath();
    ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FF5722';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FF5722';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    ctx.beginPath();
    // Draw using spline or just points
    // Simple segments for performance
    ctx.strokeStyle = '#8BC34A';
    ctx.lineWidth = snake.radius * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(snake.x, snake.y);
    for (let i = 0; i < snake.body.length; i++) {
        // Handle wrap around visually is hard, so we just draw lines.
        // If distance is too big, don't draw line (wrap happened)
        const p = snake.body[i];
        const prev = i === 0 ? snake : snake.body[i-1];
        if (Math.abs(p.x - prev.x) > 100 || Math.abs(p.y - prev.y) > 100) {
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
        } else {
            ctx.lineTo(p.x, p.y);
        }
    }
    ctx.stroke();

    // Eyes
    ctx.fillStyle = 'white';
    const ex = snake.x + Math.cos(snake.angle + 0.5) * 5;
    const ey = snake.y + Math.sin(snake.angle + 0.5) * 5;
    const ex2 = snake.x + Math.cos(snake.angle - 0.5) * 5;
    const ey2 = snake.y + Math.sin(snake.angle - 0.5) * 5;

    ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex2, ey2, 3, 0, Math.PI*2); ctx.fill();
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
