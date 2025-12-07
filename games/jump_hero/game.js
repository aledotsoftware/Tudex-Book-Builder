
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let player = {x: 0, y: 0, w: 20, h: 20, dy: 0, dx: 0};
let platforms = [];
let score = 0;
let isGameOver = false;
let gameLoop;
let cameraY = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
}
window.addEventListener('resize', resize);

function startGame() {
    score = 0;
    isGameOver = false;
    cameraY = 0;
    platforms = [];

    // Initial Platforms
    for(let i=0; i<10; i++) {
        platforms.push({
            x: Math.random() * (canvas.width - 60),
            y: canvas.height - 50 - (i * 100),
            w: 60,
            h: 15
        });
    }

    player.x = platforms[0].x + 20;
    player.y = platforms[0].y - 30;
    player.dy = -10;

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
    player.dy += 0.4;
    player.y += player.dy;

    // Input Movement (tilt/touch)
    if(moveLeft) player.x -= 5;
    if(moveRight) player.x += 5;

    // Wrap
    if(player.x > canvas.width) player.x = 0;
    if(player.x < 0) player.x = canvas.width;

    // Camera
    if(player.y < canvas.height / 2) {
        let diff = (canvas.height / 2) - player.y;
        player.y += diff;
        platforms.forEach(p => {
            p.y += diff;
            if(p.y > canvas.height) {
                p.y = 0; // Recycle platform top
                p.x = Math.random() * (canvas.width - 60);
                score++;
                document.getElementById('score').innerText = score;
                if(score % 10 === 0) AudioController.playScore();
            }
        });
    }

    // Collision
    if(player.dy > 0) { // falling
        platforms.forEach(p => {
            if(player.x + player.w > p.x && player.x < p.x + p.w &&
               player.y + player.h > p.y && player.y + player.h < p.y + p.h + 10) {
                   player.dy = -12; // jump
                   AudioController.playBounce();
            }
        });
    }

    // Draw Platforms
    ctx.fillStyle = '#0f0';
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.w, p.h);
    });

    // Draw Player
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Game Over
    if(player.y > canvas.height) {
        gameOver();
    }

    gameLoop = requestAnimationFrame(update);
}

// Controls
let moveLeft = false;
let moveRight = false;

document.addEventListener('touchstart', e => {
    e.preventDefault();
    if(isGameOver) return;
    const x = e.touches[0].clientX;
    if(x < canvas.width / 2) { moveLeft = true; moveRight = false; }
    else { moveRight = true; moveLeft = false; }
}, {passive: false});

document.addEventListener('touchend', e => {
    moveLeft = false;
    moveRight = false;
});

function gameOver() {
    isGameOver = true;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-screen').classList.add('active');
    AudioController.playLose();
}

document.getElementById('game-container').addEventListener('click', () => {
    if(document.getElementById('start-screen').classList.contains('active')) startGame();
});
document.getElementById('restart-btn').addEventListener('click', startGame);
resize();
