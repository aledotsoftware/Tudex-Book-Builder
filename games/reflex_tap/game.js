
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let isGameOver = false;
let circles = [];
let spawnRate = 1000;
let lastSpawn = 0;
let gameLoop;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);

function startGame() {
    score = 0;
    circles = [];
    spawnRate = 1000;
    isGameOver = false;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').innerText = '0';
    if(gameLoop) cancelAnimationFrame(gameLoop);
    update();
    AudioController.playStart();
}

function update(time) {
    if(isGameOver) return;

    if(time - lastSpawn > spawnRate) {
        spawnCircle();
        lastSpawn = time;
        if(spawnRate > 400) spawnRate -= 10;
    }

    ctx.clearRect(0,0, canvas.width, canvas.height);

    for(let i=circles.length-1; i>=0; i--) {
        let c = circles[i];
        c.r -= 0.5;
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
        ctx.fill();

        if(c.r <= 0) {
            circles.splice(i, 1);
            gameOver();
        }
    }

    gameLoop = requestAnimationFrame(update);
}

function spawnCircle() {
    let r = 50 + Math.random() * 30;
    circles.push({
        x: r + Math.random() * (canvas.width - r*2),
        y: 100 + Math.random() * (canvas.height - 100 - r*2),
        r: r,
        color: `hsl(${Math.random()*360}, 70%, 50%)`
    });
}

canvas.addEventListener('touchstart', handleInput, {passive: false});
canvas.addEventListener('mousedown', handleInput);

function handleInput(e) {
    e.preventDefault();
    if(isGameOver) return;

    let ex = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    let ey = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    let hit = false;
    for(let i=circles.length-1; i>=0; i--) {
        let c = circles[i];
        let d = Math.sqrt((ex-c.x)**2 + (ey-c.y)**2);
        if(d < c.r) {
            circles.splice(i, 1);
            score++;
            document.getElementById('score').innerText = score;
            AudioController.playScore();
            hit = true;
            break;
        }
    }

    if(!hit) AudioController.playClick();
}

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
