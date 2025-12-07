
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let bubbles = [];
let score = 0;
let isGameOver = false;
let gameLoop;
let shooter = {x: 0, y: 0, angle: 0, nextColor: ''};
const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f'];
let grid = [];
const r = 20;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    shooter.x = canvas.width/2;
    shooter.y = canvas.height - 50;
}
window.addEventListener('resize', resize);

function startGame() {
    score = 0;
    bubbles = []; // Flying bubbles
    grid = []; // Static grid
    isGameOver = false;

    // Init Grid
    for(let i=0; i<5; i++) {
        for(let j=0; j<Math.floor(canvas.width/(r*2)); j++) {
            grid.push({
                x: r + j * r * 2 + (i%2)*r,
                y: r + i * r * 2,
                c: colors[Math.floor(Math.random()*colors.length)],
                active: true
            });
        }
    }

    shooter.nextColor = colors[Math.floor(Math.random()*colors.length)];

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

    // Draw Grid
    grid.forEach(b => {
        if(b.active) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, r-2, 0, Math.PI*2);
            ctx.fillStyle = b.c;
            ctx.fill();
        }
    });

    // Draw Projectiles
    for(let i=bubbles.length-1; i>=0; i--) {
        let b = bubbles[i];
        b.x += Math.cos(b.angle) * 10;
        b.y += Math.sin(b.angle) * 10;

        ctx.beginPath();
        ctx.arc(b.x, b.y, r-2, 0, Math.PI*2);
        ctx.fillStyle = b.c;
        ctx.fill();

        // Wall Bounce
        if(b.x < r || b.x > canvas.width - r) b.angle = Math.PI - b.angle;

        // Collision with grid
        let hit = false;
        if(b.y < r) hit = true;

        for(let g of grid) {
            if(g.active) {
                let dist = Math.sqrt((b.x-g.x)**2 + (b.y-g.y)**2);
                if(dist < r*2) {
                    hit = true;
                    break;
                }
            }
        }

        if(hit) {
            grid.push({x: b.x, y: b.y, c: b.c, active: true});
            bubbles.splice(i, 1);
            AudioController.playClick();
            checkMatches();
            if(b.y > canvas.height - 100) gameOver();
        }
    }

    // Shooter
    ctx.beginPath();
    ctx.arc(shooter.x, shooter.y, r, 0, Math.PI*2);
    ctx.fillStyle = shooter.nextColor;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(shooter.x, shooter.y);
    ctx.lineTo(shooter.x + Math.cos(shooter.angle)*50, shooter.y + Math.sin(shooter.angle)*50);
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    gameLoop = requestAnimationFrame(update);
}

function checkMatches() {
    // Simple mock match for performance (DFS is complex to write in one block)
    // Just remove the last added + matching neighbors immediately
    // Real implementation requires recursion.
    // Simplifying: If hit same color, remove both.
    let last = grid[grid.length-1];
    let toRemove = [last];

    // Simple proximity check for 1 layer
    for(let g of grid) {
        if(g !== last && g.active && g.c === last.c) {
             let dist = Math.sqrt((last.x-g.x)**2 + (last.y-g.y)**2);
             if(dist < r*2.5) toRemove.push(g);
        }
    }

    if(toRemove.length > 1) {
        toRemove.forEach(b => b.active = false);
        score += toRemove.length * 10;
        document.getElementById('score').innerText = score;
        AudioController.playScore();
    }
}


canvas.addEventListener('touchstart', handleInput, {passive: false});
canvas.addEventListener('mousedown', handleInput);

function handleInput(e) {
    e.preventDefault();
    if(isGameOver) return;

    let ex = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    let ey = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    let angle = Math.atan2(ey - shooter.y, ex - shooter.x);
    shooter.angle = angle;

    bubbles.push({
        x: shooter.x,
        y: shooter.y,
        angle: angle,
        c: shooter.nextColor
    });

    shooter.nextColor = colors[Math.floor(Math.random()*colors.length)];
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
