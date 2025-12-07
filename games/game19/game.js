const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const integrityEl = document.getElementById('shield-integrity');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const audio = new AudioController();

let gameState = 'MENU';
let score = 0;
let integrity = 100;
let lastTime = 0;

// Game State
const core = {
    x: 0,
    y: 0,
    radius: 30,
    pulse: 0
};

const shield = {
    angle: 0, // Radians
    distance: 80,
    arcLength: Math.PI / 2, // 90 degrees coverage
    thickness: 10,
    speed: 5
};

let enemies = [];
let particles = [];
let enemySpawnTimer = 0;
let enemySpawnRate = 1.5; // seconds

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    core.x = canvas.width / 2;
    core.y = canvas.height / 2;
}
window.addEventListener('resize', resize);
resize();

// Input
let rotateDir = 0; // -1 left, 1 right

function handleInput(x) {
    if (x < canvas.width / 2) {
        rotateDir = -1;
    } else {
        rotateDir = 1;
    }
}

function onTouchStart(e) {
    if (gameState !== 'PLAYING') return;
    handleInput(e.touches[0].clientX);
}

function onTouchEnd(e) {
    rotateDir = 0;
}

function onMouseDown(e) {
    if (gameState !== 'PLAYING') return;
    handleInput(e.clientX);
}
function onMouseUp() {
    rotateDir = 0;
}

canvas.addEventListener('touchstart', onTouchStart);
canvas.addEventListener('touchend', onTouchEnd);
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp);

function initGame() {
    score = 0;
    integrity = 100;
    enemies = [];
    particles = [];
    scoreEl.textContent = score;
    integrityEl.textContent = integrity + '%';
    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    audio.init();
    lastTime = performance.now();
    enemySpawnRate = 1.5;
    requestAnimationFrame(gameLoop);
}

function spawnEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(canvas.width, canvas.height) / 1.5 + 50;
    enemies.push({
        x: core.x + Math.cos(angle) * dist,
        y: core.y + Math.sin(angle) * dist,
        vx: -Math.cos(angle) * (100 + score), // Speed increases with score
        vy: -Math.sin(angle) * (100 + score),
        radius: 8,
        color: '#f00'
    });
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 100,
            vy: (Math.random() - 0.5) * 100,
            life: 1.0,
            color: color
        });
    }
}

function update(dt) {
    // Shield Rotation
    shield.angle += rotateDir * shield.speed * dt;

    // Normalize angle
    shield.angle = shield.angle % (Math.PI * 2);
    if (shield.angle < 0) shield.angle += Math.PI * 2;

    // Spawn Enemies
    enemySpawnTimer -= dt;
    if (enemySpawnTimer <= 0) {
        spawnEnemy();
        enemySpawnTimer = enemySpawnRate;
        if (enemySpawnRate > 0.5) enemySpawnRate -= 0.01;
    }

    // Update Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.x += e.vx * dt;
        e.y += e.vy * dt;

        const dx = e.x - core.x;
        const dy = e.y - core.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // Check Shield Collision
        // Shield is at distance `shield.distance` from core
        if (dist < shield.distance + shield.thickness && dist > shield.distance - shield.thickness) {
            let angleToEnemy = Math.atan2(dy, dx);
            if (angleToEnemy < 0) angleToEnemy += Math.PI * 2;

            // Check if angle is within shield arc
            // We need to handle the wrap around logic for angles
            let diff = Math.abs(angleToEnemy - shield.angle);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;

            if (diff < shield.arcLength / 2) {
                // Blocked
                audio.playBlock();
                createParticles(e.x, e.y, '#0f0', 5);
                enemies.splice(i, 1);
                score += 10;
                scoreEl.textContent = score;
                continue;
            }
        }

        // Check Core Collision
        if (dist < core.radius + e.radius) {
            audio.playCoreHit();
            createParticles(e.x, e.y, '#f00', 10);
            enemies.splice(i, 1);
            integrity -= 25;
            integrityEl.textContent = integrity + '%';
            if (integrity <= 0) {
                gameState = 'GAMEOVER';
                audio.playExplosion();
                finalScoreEl.textContent = score;
                gameOverScreen.classList.remove('hidden');
            }
            continue;
        }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 2;
        if (p.life <= 0) particles.splice(i, 1);
    }

    // Core Pulse
    core.pulse = Math.sin(Date.now() / 200) * 2;
}

function draw() {
    // Clear
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Core
    ctx.beginPath();
    ctx.arc(core.x, core.y, core.radius + core.pulse, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${120 - (100-integrity)}, 100%, 50%)`;
    ctx.shadowBlur = 20;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
    ctx.closePath();

    // Draw Shield
    ctx.beginPath();
    ctx.arc(core.x, core.y, shield.distance, shield.angle - shield.arcLength/2, shield.angle + shield.arcLength/2);
    ctx.lineWidth = shield.thickness;
    ctx.strokeStyle = '#0ff';
    ctx.stroke();
    ctx.closePath();

    // Draw Enemies
    for (let e of enemies) {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.closePath();
    }

    // Draw Particles
    for (let p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 3, 3);
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

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
