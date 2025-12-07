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
let speed = 300;

// Colors: Red, Blue, Yellow
const COLORS = ['#FF0000', '#0000FF', '#FFFF00'];
let playerColorIndex = 0;

const player = {
    y: 0, // set in resize
    radius: 20
};

const obstacles = [];
let spawnTimer = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.y = canvas.height - 100;
}
window.addEventListener('resize', resize);
resize();

function initGame() {
    score = 0;
    speed = 300;
    obstacles.length = 0;
    playerColorIndex = 0;
    scoreEl.textContent = score;
    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    audio.init();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function spawnObstacle() {
    const colorIndex = Math.floor(Math.random() * COLORS.length);
    obstacles.push({
        y: -50,
        colorIndex: colorIndex,
        passed: false,
        width: canvas.width / 3, // Just a visual strip
        height: 40
    });
}

function switchColor() {
    playerColorIndex = (playerColorIndex + 1) % COLORS.length;
    audio.playSwitch();
}

function update(dt) {
    if (gameState !== 'PLAYING') return;

    // Spawn logic
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnObstacle();
        spawnTimer = 2.0 - Math.min(score * 0.05, 1.5); // Increase spawn rate
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let ob = obstacles[i];
        ob.y += speed * dt;

        // Collision
        if (ob.y + ob.height > player.y - player.radius &&
            ob.y < player.y + player.radius) {

            // Check color match
            if (ob.colorIndex !== playerColorIndex) {
                gameState = 'GAMEOVER';
                audio.playCrash();
                finalScoreEl.textContent = score;
                gameOverScreen.classList.remove('hidden');
                return;
            }
        }

        if (ob.y > player.y + player.radius && !ob.passed) {
            ob.passed = true;
            score++;
            scoreEl.textContent = score;
            speed += 10;
            audio.playScore();
        }

        if (ob.y > canvas.height) {
            obstacles.splice(i, 1);
        }
    }
}

function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Lane lines
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width/3, 0);
    ctx.lineTo(canvas.width/3, canvas.height);
    ctx.moveTo(canvas.width*2/3, 0);
    ctx.lineTo(canvas.width*2/3, canvas.height);
    ctx.stroke();

    // Draw Obstacles (Gate style)
    for (let ob of obstacles) {
        ctx.fillStyle = COLORS[ob.colorIndex];
        ctx.fillRect(0, ob.y, canvas.width, ob.height);
    }

    // Draw Player
    ctx.beginPath();
    ctx.arc(canvas.width/2, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = COLORS[playerColorIndex];
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.closePath();
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
        switchColor();
    }
}
canvas.addEventListener('mousedown', onInput);
canvas.addEventListener('touchstart', onInput, {passive: false});

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
