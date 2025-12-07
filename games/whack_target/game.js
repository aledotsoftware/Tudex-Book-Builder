
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let isGameOver = false;
let targets = [];
let spawnTimer = 0;
let gameLoop;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);

function startGame() {
    score = 0;
    isGameOver = false;
    targets = [];
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').innerText = '0';
    if(gameLoop) cancelAnimationFrame(gameLoop);
    update();
    AudioController.playStart();
}

function update() {
    if(isGameOver) return;

    spawnTimer++;
    if(spawnTimer > 40) { // Spawn rate
        spawnTimer = 0;
        let r = 30 + Math.random() * 20;
        targets.push({
            x: Math.random() * (canvas.width - 2*r) + r,
            y: canvas.height + r,
            r: r,
            dy: -(Math.random() * 5 + 3),
            dx: Math.random() * 4 - 2,
            c: `hsl(${Math.random()*360}, 70%, 50%)`
        });
    }

    ctx.clearRect(0,0, canvas.width, canvas.height);

    for(let i=targets.length-1; i>=0; i--) {
        let t = targets[i];
        t.y += t.dy;
        t.x += t.dx;
        t.dy += 0.1;

        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI*2);
        ctx.fillStyle = t.c;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        if(t.y > canvas.height + 50) {
            targets.splice(i, 1);
            gameOver();
        }
    }

    gameLoop = requestAnimationFrame(update);
}

canvas.addEventListener('touchstart', handleInput, {passive: false});
canvas.addEventListener('mousedown', handleInput);

function handleInput(e) {
    e.preventDefault();
    if(isGameOver) return;

    let ex = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    let ey = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    for(let i=targets.length-1; i>=0; i--) {
        let t = targets[i];
        let d = Math.sqrt((ex - t.x)**2 + (ey - t.y)**2);
        if(d < t.r) {
            targets.splice(i, 1);
            score++;
            document.getElementById('score').innerText = score;
            AudioController.playClick();
            // AudioController.playScore(); // too noisy
            return;
        }
    }
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
