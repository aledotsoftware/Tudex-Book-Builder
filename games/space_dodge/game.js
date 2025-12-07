
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let player = {x: 0, y: 0, w: 30, h: 30};
let obstacles = [];
let stars = [];
let score = 0;
let speed = 5;
let gameLoop;
let isGameOver = false;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width/2;
    player.y = canvas.height - 100;
}
window.addEventListener('resize', resize);

function startGame() {
    score = 0;
    speed = 5;
    obstacles = [];
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

    // Bg
    ctx.fillStyle = '#121220';
    ctx.fillRect(0,0, canvas.width, canvas.height);

    // Stars
    if(Math.random() < 0.1) stars.push({x: Math.random()*canvas.width, y: 0, s: Math.random()*2});
    ctx.fillStyle = '#fff';
    stars.forEach((s, i) => {
        s.y += speed * 0.5;
        ctx.fillRect(s.x, s.y, s.s, s.s);
        if(s.y > canvas.height) stars.splice(i, 1);
    });

    // Spawn Obstacles
    if(Math.random() < 0.05) {
        const size = 30 + Math.random() * 50;
        obstacles.push({
            x: Math.random() * (canvas.width - size),
            y: -50,
            w: size,
            h: size,
            color: `hsl(${Math.random()*360}, 70%, 50%)`
        });
    }

    // Player
    ctx.fillStyle = '#0ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#0ff';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - 15, player.y + 30);
    ctx.lineTo(player.x + 15, player.y + 30);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Obstacles logic
    for(let i=obstacles.length-1; i>=0; i--) {
        let o = obstacles[i];
        o.y += speed;
        ctx.fillStyle = o.color;
        ctx.fillRect(o.x, o.y, o.w, o.h);

        // Collision
        if(player.x - 10 < o.x + o.w && player.x + 10 > o.x &&
           player.y < o.y + o.h && player.y + 30 > o.y) {
               gameOver();
        }

        if(o.y > canvas.height) {
            obstacles.splice(i, 1);
            score++;
            document.getElementById('score').innerText = score;
            if(score % 10 === 0) {
                speed += 1;
                AudioController.playScore();
            }
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

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY; // Allow Y movement too? Let's just do X
    player.x = touchX;
    // player.y = touchY - 50; // Optional
}, {passive: false});

document.getElementById('game-container').addEventListener('click', () => {
    if(document.getElementById('start-screen').classList.contains('active')) startGame();
});
document.getElementById('restart-btn').addEventListener('click', startGame);
resize();
