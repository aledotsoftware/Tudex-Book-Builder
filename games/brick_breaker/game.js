
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let ball = {x: 0, y: 0, dx: 4, dy: -4, radius: 6};
let paddle = {x: 0, width: 80, height: 10};
let bricks = [];
let score = 0;
let gameLoop;
let isGameOver = false;
const rowCount = 5;
const colCount = 7;

function resize() {
    const w = Math.min(window.innerWidth, 400);
    const h = Math.min(window.innerHeight, 600);
    canvas.width = w;
    canvas.height = h;
    paddle.width = w * 0.2;
    resetLevel();
}
window.addEventListener('resize', resize);


function resetLevel() {
    bricks = [];
    const padding = 10;
    const offsetTop = 50;
    const offsetLeft = 35;
    const brickWidth = (canvas.width - (offsetLeft*2)) / colCount;
    const brickHeight = 20;

    for(let c=0; c<colCount; c++) {
        bricks[c] = [];
        for(let r=0; r<rowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
            bricks[c][r].x = (c*(brickWidth)) + offsetLeft;
            bricks[c][r].y = (r*(brickHeight+padding)) + offsetTop;
            bricks[c][r].w = brickWidth - padding;
            bricks[c][r].h = brickHeight;
        }
    }
    ball.x = canvas.width/2;
    ball.y = canvas.height - 30;
    paddle.x = (canvas.width - paddle.width)/2;
}

function startGame() {
    score = 0;
    isGameOver = false;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').innerText = '0';
    resetLevel();
    if(gameLoop) cancelAnimationFrame(gameLoop);
    update();
    AudioController.playStart();
}

function update() {
    if(isGameOver) return;

    ctx.clearRect(0,0, canvas.width, canvas.height);

    // Draw Bricks
    bricks.forEach(col => {
        col.forEach(b => {
            if(b.status === 1) {
                ctx.fillStyle = '#ffaa00';
                ctx.fillRect(b.x, b.y, b.w, b.h);
                // Collision
                if(ball.x > b.x && ball.x < b.x+b.w && ball.y > b.y && ball.y < b.y+b.h) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 10;
                    document.getElementById('score').innerText = score;
                    AudioController.playScore();
                }
            }
        });
    });

    // Draw Paddle
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, canvas.height - paddle.height - 10, paddle.width, paddle.height);

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();

    // Move Ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    if(ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
        AudioController.playBounce();
    }
    if(ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
        AudioController.playBounce();
    } else if(ball.y + ball.dy > canvas.height - ball.radius - 15) {
        if(ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy * 1.05; // speed up
            AudioController.playBounce();
        } else if(ball.y + ball.dy > canvas.height) {
            gameOver();
            return;
        }
    }

    gameLoop = requestAnimationFrame(update);
}

function gameOver() {
    isGameOver = true;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-screen').classList.add('active');
    AudioController.playLose();
}

// Controls
canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touchX = e.touches[0].clientX - canvas.offsetLeft;
    paddle.x = touchX - paddle.width/2;
    if(paddle.x < 0) paddle.x = 0;
    if(paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}, {passive: false});

document.getElementById('game-container').addEventListener('click', () => {
    if(document.getElementById('start-screen').classList.contains('active')) startGame();
});
document.getElementById('restart-btn').addEventListener('click', startGame);

resize();
