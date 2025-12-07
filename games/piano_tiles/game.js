
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let tiles = [];
let score = 0;
let isGameOver = false;
let gameLoop;
let speed = 5;
let laneWidth = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    laneWidth = canvas.width / 4;
}
window.addEventListener('resize', resize);

function startGame() {
    score = 0;
    speed = 5;
    tiles = [];
    isGameOver = false;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').innerText = '0';
    spawnTile(0);
    spawnTile(-150);
    spawnTile(-300);
    if(gameLoop) cancelAnimationFrame(gameLoop);
    update();
    AudioController.playStart();
}

function spawnTile(offsetY) {
    let lane = Math.floor(Math.random() * 4);
    tiles.push({
        lane: lane,
        y: offsetY || -150,
        h: 150,
        clicked: false,
        note: 200 + Math.random() * 400
    });
}

function update() {
    if(isGameOver) return;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0, canvas.width, canvas.height);

    // Lines
    ctx.strokeStyle = '#ccc';
    for(let i=1; i<4; i++) {
        ctx.beginPath();
        ctx.moveTo(i*laneWidth, 0);
        ctx.lineTo(i*laneWidth, canvas.height);
        ctx.stroke();
    }

    tiles.forEach((t, i) => {
        t.y += speed;
        if(!t.clicked) {
            ctx.fillStyle = '#000';
            ctx.fillRect(t.lane * laneWidth, t.y, laneWidth, t.h);
        } else {
             ctx.fillStyle = '#aaa';
             ctx.fillRect(t.lane * laneWidth, t.y, laneWidth, t.h);
        }

        if(t.y > canvas.height) {
            if(!t.clicked) gameOver();
            else tiles.splice(i, 1);
        }
    });

    if(tiles[tiles.length-1].y > -10) {
        spawnTile(-150);
    }

    speed = 5 + (score * 0.1);

    gameLoop = requestAnimationFrame(update);
}

canvas.addEventListener('touchstart', handleInput, {passive: false});
canvas.addEventListener('mousedown', handleInput);

function handleInput(e) {
    e.preventDefault();
    if(isGameOver) return;

    let ex = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    let ey = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    let lane = Math.floor(ex / laneWidth);

    let hit = false;
    for(let t of tiles) {
        if(!t.clicked && t.lane === lane && ey > t.y && ey < t.y + t.h) {
            t.clicked = true;
            score++;
            document.getElementById('score').innerText = score;
            AudioController.playTone(t.note, 'triangle', 0.2); // Music
            hit = true;
            break;
        }
    }

    if(!hit) {
        // Tapped wrong lane
        gameOver();
    }
}

// Custom Tone


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
