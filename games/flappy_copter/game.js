
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let bird = {x: 50, y: 0, dy: 0, r: 15};
let pipes = [];
let score = 0;
let frame = 0;
let gameLoop;
let isGameOver = false;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    bird.y = canvas.height / 2;
}
window.addEventListener('resize', resize);

function startGame() {
    bird.y = canvas.height / 2;
    bird.dy = 0;
    pipes = [];
    score = 0;
    frame = 0;
    isGameOver = false;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').innerText = '0';
    if(gameLoop) cancelAnimationFrame(gameLoop);
    update();
    AudioController.playStart();
}

function update() {
    if(isGameOver) return;

    ctx.clearRect(0,0, canvas.width, canvas.height);

    // Physics
    bird.dy += 0.5; // gravity
    bird.y += bird.dy;

    // Jump
    // Handled by listener

    // Draw Bird
    ctx.fillStyle = '#ff0099';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI*2);
    ctx.fill();

    // Pipes
    if(frame % 100 === 0) {
        const gap = 200;
        const topHeight = Math.random() * (canvas.height - gap - 100) + 50;
        pipes.push({
            x: canvas.width,
            top: topHeight,
            bottom: topHeight + gap,
            w: 50,
            passed: false
        });
    }

    for(let i=pipes.length-1; i>=0; i--) {
        let p = pipes[i];
        p.x -= 3;
        ctx.fillStyle = '#fff';
        ctx.fillRect(p.x, 0, p.w, p.top);
        ctx.fillRect(p.x, p.bottom, p.w, canvas.height - p.bottom);

        // Collision
        if(bird.x + bird.r > p.x && bird.x - bird.r < p.x + p.w) {
            if(bird.y - bird.r < p.top || bird.y + bird.r > p.bottom) {
                gameOver();
            }
        }

        // Pass
        if(p.x + p.w < bird.x && !p.passed) {
            score++;
            p.passed = true;
            document.getElementById('score').innerText = score;
            AudioController.playScore();
        }

        if(p.x < -50) pipes.splice(i, 1);
    }

    // Floor/Ceiling
    if(bird.y + bird.r > canvas.height || bird.y - bird.r < 0) {
        gameOver();
    }

    frame++;
    gameLoop = requestAnimationFrame(update);
}

function jump() {
    if(!isGameOver) {
        bird.dy = -8;
        AudioController.playBounce();
    }
}

function gameOver() {
    isGameOver = true;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-screen').classList.add('active');
    AudioController.playLose();
}

document.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Stop scrolling
    if(isGameOver) return;
    jump();
}, {passive: false});

document.getElementById('game-container').addEventListener('click', (e) => {
    if(document.getElementById('start-screen').classList.contains('active')) startGame();
    else if(!isGameOver && e.target.tagName !== 'BUTTON') jump();
});
document.getElementById('restart-btn').addEventListener('click', startGame);

resize();
