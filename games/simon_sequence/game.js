
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let isGameOver = false;
let sequence = [];
let playerSeq = [];
let pads = [];
let isShowing = false;

const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
const lightColors = ['#ff8888', '#88ff88', '#8888ff', '#ffff88'];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let s = Math.min(canvas.width, canvas.height) * 0.4;
    let cx = canvas.width/2;
    let cy = canvas.height/2;
    pads = [
        {id: 0, x: cx - s, y: cy - s, w: s, h: s, c: colors[0], l: lightColors[0]},
        {id: 1, x: cx, y: cy - s, w: s, h: s, c: colors[1], l: lightColors[1]},
        {id: 2, x: cx, y: cy, w: s, h: s, c: colors[2], l: lightColors[2]},
        {id: 3, x: cx - s, y: cy, w: s, h: s, c: colors[3], l: lightColors[3]}
    ];
    draw();
}
window.addEventListener('resize', resize);

function draw(litId = -1) {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    pads.forEach(p => {
        ctx.fillStyle = (p.id === litId) ? p.l : p.c;
        ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, p.h - 4);
    });
}

function startGame() {
    score = 0;
    sequence = [];
    isGameOver = false;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').innerText = '0';
    AudioController.playStart();
    nextRound();
}

function nextRound() {
    playerSeq = [];
    sequence.push(Math.floor(Math.random() * 4));
    score = sequence.length - 1;
    document.getElementById('score').innerText = score;
    isShowing = true;
    let i = 0;
    let interval = setInterval(() => {
        if(i >= sequence.length) {
            clearInterval(interval);
            isShowing = false;
            draw();
            return;
        }
        flash(sequence[i]);
        i++;
    }, 800);
}

function flash(id) {
    draw(id);
    playPadSound(id);
    setTimeout(() => draw(), 400);
}

function playPadSound(id) {
    let freqs = [300, 400, 500, 600];
    AudioController.playTone(freqs[id], 'sine', 0.3);
}

// Attach a custom playTone to AudioController for this game

canvas.addEventListener('touchstart', handleInput, {passive: false});
canvas.addEventListener('mousedown', handleInput);

function handleInput(e) {
    e.preventDefault();
    if(isGameOver || isShowing) return;

    let ex = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    let ey = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    pads.forEach(p => {
        if(ex > p.x && ex < p.x+p.w && ey > p.y && ey < p.y+p.h) {
            flash(p.id);
            playerSeq.push(p.id);

            // Check
            let idx = playerSeq.length - 1;
            if(playerSeq[idx] !== sequence[idx]) {
                gameOver();
            } else if(playerSeq.length === sequence.length) {
                setTimeout(nextRound, 1000);
            }
        }
    });
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
