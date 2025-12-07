
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let isGameOver = false;
let currentQ = {};
let timer = 100;
let gameLoop;
let options = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);

function generateQuestion() {
    let ops = ['+', '-', '*'];
    let op = ops[Math.floor(Math.random() * (score > 10 ? 3 : 2))];
    let a = Math.floor(Math.random() * 10) + 1;
    let b = Math.floor(Math.random() * 10) + 1;
    let ans = 0;
    if(op === '+') ans = a + b;
    if(op === '-') {
        if(a < b) [a,b] = [b,a];
        ans = a - b;
    }
    if(op === '*') ans = a * b;

    currentQ = { text: `${a} ${op} ${b} = ?`, ans: ans };

    // Generate options
    let opts = [ans];
    while(opts.length < 4) {
        let fake = ans + Math.floor(Math.random() * 10) - 5;
        if(fake !== ans && fake >= 0 && !opts.includes(fake)) opts.push(fake);
    }
    // Shuffle options
    options = opts.sort(() => Math.random() - 0.5).map((val, i) => {
        // Grid positions
        let x = (i % 2) * (canvas.width/2);
        let y = (Math.floor(i / 2)) * (canvas.height/3) + (canvas.height/2);
        return { val, x, y, w: canvas.width/2, h: canvas.height/3 };
    });
}

function startGame() {
    score = 0;
    timer = 100;
    isGameOver = false;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').innerText = '0';
    generateQuestion();
    if(gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 50); // timer tick
    AudioController.playStart();
    draw();
}

function update() {
    if(isGameOver) return;
    timer -= (0.5 + (score * 0.05));
    if(timer <= 0) {
        gameOver();
    }
    draw();
}

function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);

    // Draw Timer Bar
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(0, 0, canvas.width * (timer/100), 10);

    // Question
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentQ.text, canvas.width/2, canvas.height/4);

    // Options
    options.forEach((opt, i) => {
        ctx.fillStyle = i % 2 === 0 ? '#222' : '#333';
        if(Math.floor(i/2) === 1) ctx.fillStyle = i % 2 === 0 ? '#333' : '#222';

        ctx.fillRect(opt.x, opt.y, opt.w, opt.h);

        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.fillText(opt.val, opt.x + opt.w/2, opt.y + opt.h/2);

        ctx.strokeStyle = '#000';
        ctx.strokeRect(opt.x, opt.y, opt.w, opt.h);
    });
}

canvas.addEventListener('touchstart', handleInput, {passive: false});
canvas.addEventListener('mousedown', handleInput);

function handleInput(e) {
    e.preventDefault();
    if(isGameOver) return;

    let ex = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    let ey = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    options.forEach(opt => {
        if(ex > opt.x && ex < opt.x + opt.w && ey > opt.y && ey < opt.y + opt.h) {
            if(opt.val === currentQ.ans) {
                score++;
                timer = Math.min(100, timer + 20);
                document.getElementById('score').innerText = score;
                AudioController.playScore();
                generateQuestion();
            } else {
                gameOver();
            }
        }
    });
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-screen').classList.add('active');
    AudioController.playLose();
}

document.getElementById('game-container').addEventListener('click', () => {
    if(document.getElementById('start-screen').classList.contains('active')) startGame();
});
document.getElementById('restart-btn').addEventListener('click', startGame);
resize();
