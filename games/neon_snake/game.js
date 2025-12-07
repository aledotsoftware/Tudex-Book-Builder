
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 0;
let dy = 0;
let score = 0;
let gridSize = 20;
let tileCount = 20;
let gameLoop;
let isGameOver = false;

function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    canvas.width = size;
    canvas.height = size;
    gridSize = size / tileCount;
}
window.addEventListener('resize', resize);
resize();

function startGame() {
    snake = [{x: 10, y: 10}];
    dx = 1; dy = 0;
    score = 0;
    isGameOver = false;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').innerText = '0';
    if(gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 100);
    AudioController.playStart();
}

function update() {
    if(isGameOver) return;
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if(head.x < 0) head.x = tileCount - 1;
    if(head.x >= tileCount) head.x = 0;
    if(head.y < 0) head.y = tileCount - 1;
    if(head.y >= tileCount) head.y = 0;

    for(let i=0; i<snake.length; i++) {
        if(head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').innerText = score;
        AudioController.playScore();
        placeFood();
    } else {
        snake.pop();
    }
    draw();
}

function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    // Check collision with snake
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff00';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff00';
    snake.forEach(part => {
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });

    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    ctx.shadowBlur = 0;
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-screen').classList.add('active');
    AudioController.playLose();
}

// Touch Controls
let touchStartX = 0;
let touchStartY = 0;
document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, {passive: false});

document.addEventListener('touchmove', e => {
    e.preventDefault();
}, {passive: false});

document.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if(Math.abs(diffX) > Math.abs(diffY)) {
        if(diffX > 0 && dx !== -1) { dx = 1; dy = 0; }
        else if(diffX < 0 && dx !== 1) { dx = -1; dy = 0; }
    } else {
        if(diffY > 0 && dy !== -1) { dx = 0; dy = 1; }
        else if(diffY < 0 && dy !== 1) { dx = 0; dy = -1; }
    }
});

document.getElementById('game-container').addEventListener('click', () => {
    if(document.getElementById('start-screen').classList.contains('active')) startGame();
});
document.getElementById('restart-btn').addEventListener('click', startGame);
