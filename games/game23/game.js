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
let speed = 400;

const player = {
    x: 100,
    y: 0,
    width: 30,
    height: 30,
    vy: 0,
    gravityDir: 1, // 1 for down, -1 for up
    onGround: false,
    color: '#0ff'
};

const platforms = [];
const spikes = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.y = canvas.height / 2;
}
window.addEventListener('resize', resize);
resize();

function initGame() {
    score = 0;
    speed = 400;
    scoreEl.textContent = '0m';

    player.y = canvas.height / 2;
    player.vy = 0;
    player.gravityDir = 1;
    player.onGround = false;

    platforms.length = 0;
    spikes.length = 0;

    // Initial Platform
    platforms.push({
        x: 0,
        y: canvas.height - 100,
        w: canvas.width * 2,
        h: 100
    });
    // Ceiling
    platforms.push({
        x: 0,
        y: 0,
        w: canvas.width * 2,
        h: 100
    });

    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    audio.init();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function spawnSegment() {
    const lastPlat = platforms[platforms.length - 1];
    const newX = Math.max(lastPlat ? lastPlat.x + lastPlat.w : 0, canvas.width + 100);

    // Create random floor/ceiling segments
    const w = 200 + Math.random() * 400;
    const gap = 100 + Math.random() * 150;

    // Floor
    if (Math.random() > 0.3) {
         platforms.push({
            x: newX + gap,
            y: canvas.height - 100,
            w: w,
            h: 100
         });

         // Maybe spike
         if (Math.random() > 0.5) {
             spikes.push({
                 x: newX + gap + w/2,
                 y: canvas.height - 100 - 20,
                 w: 20,
                 h: 20,
                 dir: 1
             });
         }
    }

    // Ceiling
    if (Math.random() > 0.3) {
        platforms.push({
            x: newX + gap,
            y: 0,
            w: w,
            h: 100
        });

        if (Math.random() > 0.5) {
             spikes.push({
                 x: newX + gap + w/2,
                 y: 100,
                 w: 20,
                 h: 20,
                 dir: -1
             });
         }
    }
}

function flipGravity() {
    if (player.onGround) {
        player.gravityDir *= -1;
        player.onGround = false;
        player.vy = 0; // Reset velocity
        audio.playJump();
    }
}

function update(dt) {
    if (gameState !== 'PLAYING') return;

    score += speed * dt / 100;
    scoreEl.textContent = Math.floor(score) + 'm';
    speed += dt * 10;

    // Physics
    const GRAVITY = 2000;
    player.vy += GRAVITY * player.gravityDir * dt;
    player.y += player.vy * dt;

    // Move world
    const dx = speed * dt;

    // Clean up
    if (platforms.length > 0 && platforms[0].x + platforms[0].w < -100) platforms.shift();
    if (spikes.length > 0 && spikes[0].x < -100) spikes.shift();

    // Spawn
    if (platforms.length < 10) spawnSegment();

    for (let p of platforms) p.x -= dx;
    for (let s of spikes) s.x -= dx;

    // Collision
    player.onGround = false;

    // Check Platforms
    for (let p of platforms) {
        if (player.x < p.x + p.w && player.x + player.width > p.x &&
            player.y < p.y + p.h && player.y + player.height > p.y) {

            // Resolve collision
            // Since we only move vertically, just clamp Y
            if (player.vy > 0) { // Moving down
                player.y = p.y - player.height;
                if (player.gravityDir === 1) player.onGround = true;
            } else { // Moving up
                player.y = p.y + p.h;
                if (player.gravityDir === -1) player.onGround = true;
            }
            player.vy = 0;
            // audio.playLand(); // Too spammy if called every frame
        }
    }

    // Check Spikes
    for (let s of spikes) {
        // Simple AABB
        if (player.x < s.x + s.w && player.x + player.width > s.x &&
            player.y < s.y + s.h && player.y + player.height > s.y) {
            gameOver();
            return;
        }
    }

    // Check out of bounds
    if (player.y > canvas.height + 100 || player.y < -100) {
        gameOver();
    }
}

function gameOver() {
    gameState = 'GAMEOVER';
    audio.playCrash();
    finalScoreEl.textContent = Math.floor(score);
    gameOverScreen.classList.remove('hidden');
}

function draw() {
    // BG
    ctx.fillStyle = '#202028';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Platforms
    ctx.fillStyle = '#444';
    for (let p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        // Highlight edge
        ctx.fillStyle = '#0ff';
        if (p.y > canvas.height/2) ctx.fillRect(p.x, p.y, p.w, 4); // floor
        else ctx.fillRect(p.x, p.y + p.h - 4, p.w, 4); // ceiling
        ctx.fillStyle = '#444';
    }

    // Spikes
    ctx.fillStyle = '#f00';
    for (let s of spikes) {
        ctx.beginPath();
        if (s.dir === 1) { // Up pointing
            ctx.moveTo(s.x, s.y + s.h);
            ctx.lineTo(s.x + s.w/2, s.y);
            ctx.lineTo(s.x + s.w, s.y + s.h);
        } else { // Down pointing
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x + s.w/2, s.y + s.h);
            ctx.lineTo(s.x + s.w, s.y);
        }
        ctx.fill();
    }

    // Player
    ctx.shadowBlur = 10;
    ctx.shadowColor = player.color;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
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

// Input
function onInput(e) {
    if (gameState === 'PLAYING') {
        e.preventDefault();
        flipGravity();
    }
}
canvas.addEventListener('mousedown', onInput);
canvas.addEventListener('touchstart', onInput, {passive: false});

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
