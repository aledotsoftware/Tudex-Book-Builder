const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelEl = document.getElementById('level');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalLevelEl = document.getElementById('final-level');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const audio = new AudioController();

let gameState = 'MENU';
let level = 1;
let lastTime = 0;

const player = {
    x: 50,
    y: 50,
    radius: 8,
    color: '#fff'
};

let walls = [];
let goal = { x: 0, y: 0, radius: 15 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initGame() {
    level = 1;
    levelEl.textContent = level;
    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    audio.init();

    startLevel();

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function startLevel() {
    player.x = 50;
    player.y = canvas.height / 2;

    goal.x = canvas.width - 50;
    goal.y = canvas.height / 2;

    generateMaze();
}

function generateMaze() {
    walls = [];
    const numWalls = 5 + level * 2;

    // Add border walls
    walls.push({x: 0, y: 0, w: canvas.width, h: 20});
    walls.push({x: 0, y: canvas.height - 20, w: canvas.width, h: 20});
    walls.push({x: 0, y: 0, w: 20, h: canvas.height});
    walls.push({x: canvas.width - 20, y: 0, w: 20, h: canvas.height});

    // Random moving obstacles
    for (let i = 0; i < numWalls; i++) {
        const w = 20 + Math.random() * 80;
        const h = 50 + Math.random() * 150;
        const x = 100 + Math.random() * (canvas.width - 200);
        const y = 20 + Math.random() * (canvas.height - h - 40);

        walls.push({
            x: x,
            y: y,
            w: w,
            h: h,
            vx: 0,
            vy: (Math.random() - 0.5) * (50 + level * 10),
            move: true
        });
    }
}

// Input
let targetX = player.x;
let targetY = player.y;
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

    // Move Player towards finger
    if (isDragging) {
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const speed = 300;

        if (dist > 5) {
            player.x += (dx / dist) * speed * dt;
            player.y += (dy / dist) * speed * dt;
        }
    }

    // Move Walls
    for (let w of walls) {
        if (w.move) {
            w.y += w.vy * dt;
            if (w.y < 20 || w.y + w.h > canvas.height - 20) {
                w.vy *= -1;
            }
        }

        // Collision
        if (player.x + player.radius > w.x && player.x - player.radius < w.x + w.w &&
            player.y + player.radius > w.y && player.y - player.radius < w.y + w.h) {
            gameOver();
            return;
        }
    }

    // Goal
    const dx = player.x - goal.x;
    const dy = player.y - goal.y;
    if (Math.sqrt(dx*dx + dy*dy) < player.radius + goal.radius) {
        level++;
        levelEl.textContent = level;
        audio.playWin();
        startLevel();
    }
}

function gameOver() {
    gameState = 'GAMEOVER';
    finalLevelEl.textContent = level;
    gameOverScreen.classList.remove('hidden');
    audio.playFail();
}

function draw() {
    // BG
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#003300';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for(let i=0; i<canvas.height; i+=40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Walls
    ctx.fillStyle = '#0f0';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#0f0';
    for (let w of walls) {
        ctx.fillRect(w.x, w.y, w.w, w.h);
    }

    // Goal
    ctx.beginPath();
    ctx.arc(goal.x, goal.y, goal.radius, 0, Math.PI*2);
    ctx.fillStyle = '#00f';
    ctx.shadowColor = '#00f';
    ctx.fill();

    // Player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.fill();

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

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
