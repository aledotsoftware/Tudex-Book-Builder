
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let ball = {x: 0, y: 0, dx: 4, dy: 4, radius: 8};
let p1 = {y: 0, h: 80, w: 10, score: 0};
let p2 = {y: 0, h: 80, w: 10, score: 0}; // AI
let isGameOver = false;
let gameLoop;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    p1.y = canvas.height/2 - p1.h/2;
    p2.y = canvas.height/2 - p2.h/2;
    resetBall();
}
window.addEventListener('resize', resize);

function resetBall() {
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.dx = (Math.random() > 0.5 ? 4 : -4);
    ball.dy = (Math.random() * 6) - 3;
}

function startGame() {
    p1.score = 0;
    p2.score = 0;
    isGameOver = false;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').innerText = '0 - 0';
    if(gameLoop) cancelAnimationFrame(gameLoop);
    update();
    AudioController.playStart();
}

function update() {
    if(isGameOver) return;
    ctx.clearRect(0,0, canvas.width, canvas.height);

    // Net
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(20, p1.y, p1.w, p1.h);
    ctx.fillRect(canvas.width - 30, p2.y, p2.w, p2.h);

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fill();

    // AI Logic
    const speed = 3.5;
    if(p2.y + p2.h/2 < ball.y - 10) p2.y += speed;
    else if(p2.y + p2.h/2 > ball.y + 10) p2.y -= speed;

    // Movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Bounce Top/Bot
    if(ball.y < 0 || ball.y > canvas.height) {
        ball.dy = -ball.dy;
        AudioController.playBounce();
    }

    // Paddle Hit
    // P1
    if(ball.x - ball.radius < 30 && ball.y > p1.y && ball.y < p1.y + p1.h) {
        ball.dx = -ball.dx * 1.1;
        ball.x = 30 + ball.radius;
        AudioController.playBounce();
    }
    // P2
    if(ball.x + ball.radius > canvas.width - 30 && ball.y > p2.y && ball.y < p2.y + p2.h) {
        ball.dx = -ball.dx * 1.1;
        ball.x = canvas.width - 30 - ball.radius;
        AudioController.playBounce();
    }

    // Score
    if(ball.x < 0) {
        p2.score++;
        AudioController.playLose(); // Point lost
        checkWin();
        resetBall();
    }
    if(ball.x > canvas.width) {
        p1.score++;
        AudioController.playScore();
        checkWin();
        resetBall();
    }
    document.getElementById('score').innerText = `${p1.score} - ${p2.score}`;

    gameLoop = requestAnimationFrame(update);
}

function checkWin() {
    if(p1.score >= 5 || p2.score >= 5) {
        isGameOver = true;
        document.getElementById('final-score').innerText = p1.score >= 5 ? "YOU WIN" : "YOU LOSE";
        document.getElementById('game-over-screen').classList.add('active');
    }
}

// Controls
canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touchY = e.touches[0].clientY;
    p1.y = touchY - p1.h/2;
}, {passive: false});

document.getElementById('game-container').addEventListener('click', () => {
    if(document.getElementById('start-screen').classList.contains('active')) startGame();
});
document.getElementById('restart-btn').addEventListener('click', startGame);

resize();
