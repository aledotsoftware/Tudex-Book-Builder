const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverTitle = document.getElementById('game-over-title');

const audio = new AudioController();

// Game State
let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
let score = 0;
let lastTime = 0;

// Game Objects
const paddle = {
    width: 100,
    height: 15,
    x: 0,
    y: 0,
    color: '#0ff',
    speed: 0
};

const ball = {
    x: 0,
    y: 0,
    radius: 8,
    dx: 0,
    dy: 0,
    speed: 500, // pixels per second
    color: '#fff',
    active: false
};

const particles = [];
const bricks = [];

const COLS = 6;
const ROWS = 5;
const BRICK_GAP = 10;
let BRICK_WIDTH = 0;
let BRICK_HEIGHT = 25;

// Resize handling
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Reset paddle pos
    paddle.y = canvas.height - 50;
    paddle.x = canvas.width / 2 - paddle.width / 2;

    BRICK_WIDTH = (canvas.width - (COLS + 1) * BRICK_GAP) / COLS;

    // If resizing during game, we might need to reposition bricks?
    // For simplicity, we just rebuild bricks on start, but during resize maybe just clear or ignore.
    // Ideally we would scale positions.
}
window.addEventListener('resize', resize);
resize();

// Input handling
let inputX = canvas.width / 2;
let isDragging = false;

function handleInput(x) {
    inputX = x;
    // Clamp
    if (inputX < paddle.width / 2) inputX = paddle.width / 2;
    if (inputX > canvas.width - paddle.width / 2) inputX = canvas.width - paddle.width / 2;

    paddle.x = inputX - paddle.width / 2;

    if (!ball.active && gameState === 'PLAYING') {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius - 2;
    }
}

function onTouch(e) {
    if (gameState !== 'PLAYING') return;
    const touch = e.touches[0];
    handleInput(touch.clientX);

    // Launch ball on tap if not active
    if (!ball.active) {
        ball.active = true;
        ball.dx = (Math.random() - 0.5) * ball.speed;
        ball.dy = -ball.speed;
        // Ensure minimum x speed
        if (Math.abs(ball.dx) < 100) ball.dx = Math.sign(ball.dx || 1) * 100;
    }
}

function onMouse(e) {
    if (gameState !== 'PLAYING') return;
    handleInput(e.clientX);
}

function onClick(e) {
    if (gameState !== 'PLAYING') return;
    if (!ball.active) {
        audio.init(); // Ensure audio context is ready
        ball.active = true;
        ball.dx = (Math.random() - 0.5) * ball.speed;
        ball.dy = -ball.speed;
    }
}

canvas.addEventListener('touchmove', onTouch, {passive: false});
canvas.addEventListener('touchstart', onTouch, {passive: false});
canvas.addEventListener('mousemove', onMouse);
canvas.addEventListener('mousedown', onClick);

// Game Logic
function initGame() {
    score = 0;
    scoreEl.textContent = score;
    createBricks();
    resetBall();
    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    lastTime = performance.now();
    audio.init();
    requestAnimationFrame(gameLoop);
}

function createBricks() {
    bricks.length = 0;
    const colors = ['#f0f', '#f00', '#ff0', '#0f0', '#00f'];

    // Center bricks area
    const totalWidth = COLS * BRICK_WIDTH + (COLS - 1) * BRICK_GAP;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = 80;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            bricks.push({
                x: startX + c * (BRICK_WIDTH + BRICK_GAP),
                y: startY + r * (BRICK_HEIGHT + BRICK_GAP),
                w: BRICK_WIDTH,
                h: BRICK_HEIGHT,
                color: colors[r % colors.length],
                active: true
            });
        }
    }
}

function resetBall() {
    ball.active = false;
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius - 2;
    ball.dx = 0;
    ball.dy = 0;
}

function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 200,
            dy: (Math.random() - 0.5) * 200,
            life: 1.0,
            color: color
        });
    }
}

function update(dt) {
    if (!ball.active) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius - 2;
        return;
    }

    // Ball movement
    let nextX = ball.x + ball.dx * dt;
    let nextY = ball.y + ball.dy * dt;

    // Wall collisions
    if (nextX < ball.radius) {
        nextX = ball.radius;
        ball.dx *= -1;
        audio.playWallHit();
    } else if (nextX > canvas.width - ball.radius) {
        nextX = canvas.width - ball.radius;
        ball.dx *= -1;
        audio.playWallHit();
    }

    if (nextY < ball.radius) {
        nextY = ball.radius;
        ball.dy *= -1;
        audio.playWallHit();
    } else if (nextY > canvas.height) {
        // Game Over
        gameState = 'GAMEOVER';
        gameOverTitle.textContent = "GAME OVER";
        finalScoreEl.textContent = score;
        gameOverScreen.classList.remove('hidden');
        audio.playLose();
        return;
    }

    // Paddle collision
    // Simple AABB for paddle
    if (ball.dy > 0 &&
        nextY + ball.radius >= paddle.y &&
        nextY - ball.radius <= paddle.y + paddle.height &&
        nextX >= paddle.x &&
        nextX <= paddle.x + paddle.width) {

        ball.dy *= -1;
        nextY = paddle.y - ball.radius - 1;

        // Add some english based on hit position
        const hitPoint = (nextX - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        ball.dx = hitPoint * ball.speed * 1.5; // Max angle speed

        audio.playPaddleHit();
        createParticles(nextX, nextY, '#0ff');
    }

    // Brick collision
    let hitBrick = false;
    let activeBricks = 0;
    for (let b of bricks) {
        if (!b.active) continue;
        activeBricks++;

        // Simple AABB
        if (nextX > b.x && nextX < b.x + b.w &&
            nextY > b.y && nextY < b.y + b.h) {

            b.active = false;
            ball.dy *= -1;
            hitBrick = true;
            score += 10;
            scoreEl.textContent = score;
            createParticles(b.x + b.w/2, b.y + b.h/2, b.color);
            audio.playBrickHit();
            break; // Resolve one collision per frame to prevent weirdness
        }
    }

    if (hitBrick && activeBricks === 1) { // We just destroyed one, so if count was 1 inclusive...
        // Win condition? Or next level?
        // Let's just reset bricks for endless
        createBricks();
        ball.speed += 50;
        audio.playWin();
    }

    ball.x = nextX;
    ball.y = nextY;

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.dx * dt;
        p.y += p.dy * dt;
        p.life -= dt * 2;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function draw() {
    // Clear with trail effect
    ctx.fillStyle = 'rgba(5, 5, 5, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Bricks
    for (let b of bricks) {
        if (b.active) {
            ctx.fillStyle = b.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = b.color;
            ctx.fillRect(b.x, b.y, b.w, b.h);
        }
    }

    // Draw Paddle
    ctx.fillStyle = paddle.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.fill();
    ctx.closePath();

    // Draw Particles
    for (let p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 4, 4);
        ctx.globalAlpha = 1;
    }

    ctx.shadowBlur = 0;
}

function gameLoop(timestamp) {
    if (gameState !== 'PLAYING') return;

    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);
}

// Event Listeners
startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
