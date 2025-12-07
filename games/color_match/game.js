
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let isGameOver = false;
let timer = 3000;
let maxTimer = 3000;
let lastTime = 0;
let question = { text: "RED", color: "#ff0000", isMatch: true };
let gameLoop;

const colors = [
    { name: "RED", val: "#ff0000" },
    { name: "BLUE", val: "#0000ff" },
    { name: "GREEN", val: "#00ff00" },
    { name: "YELLOW", val: "#ffff00" },
    { name: "WHITE", val: "#ffffff" }
];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);

function nextQuestion() {
    let c1 = colors[Math.floor(Math.random() * colors.length)];
    let c2 = colors[Math.floor(Math.random() * colors.length)];
    // 50% chance of match
    if(Math.random() < 0.5) {
        c2 = c1; // force name match color
        // But to make it tricky, text should be different? No, classic Stroop is Text says "RED" but color is Blue.
        // Game Logic: Does the Text match the Color Name?
        // Example: Text "RED" in Blue ink -> Match? No.
        // Wait, simple logic: "Does Text Meaning match Ink Color?"
    } else {
        while(c2.val === c1.val) c2 = colors[Math.floor(Math.random() * colors.length)];
    }

    question = {
        text: c1.name,
        color: c2.val,
        isMatch: c1.name === c2.name
    };

    // For this game, let's do: True if Text Meaning == Ink Color
    // Wait, c1.name is text. c2.val is ink.
    // If c1 is RED, c2 is RED_HEX -> Match.
    question.isMatch = (c1.val === c2.val);

    timer = maxTimer;
}

function startGame() {
    score = 0;
    maxTimer = 3000;
    isGameOver = false;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').innerText = '0';
    nextQuestion();
    lastTime = Date.now();
    if(gameLoop) cancelAnimationFrame(gameLoop);
    update();
    AudioController.playStart();
}

function update() {
    if(isGameOver) return;

    let now = Date.now();
    let dt = now - lastTime;
    lastTime = now;

    timer -= dt;
    if(timer <= 0) {
        gameOver();
        return;
    }

    draw();
    gameLoop = requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);

    // Timer Bar
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width * (timer/maxTimer), 20);

    // Text
    ctx.fillStyle = question.color;
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(question.text, canvas.width/2, canvas.height/3);

    // Buttons (Draw visual rep)
    ctx.fillStyle = '#444';
    ctx.fillRect(0, canvas.height/2, canvas.width/2, canvas.height/2);
    ctx.fillStyle = '#666';
    ctx.fillRect(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);

    ctx.fillStyle = '#0f0';
    ctx.fillText("YES", canvas.width/4, canvas.height * 0.75);
    ctx.fillStyle = '#f00';
    ctx.fillText("NO", canvas.width * 0.75, canvas.height * 0.75);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, canvas.height/2);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height/2);
    ctx.lineTo(canvas.width, canvas.height/2);
    ctx.stroke();
}

canvas.addEventListener('touchstart', handleInput, {passive: false});
canvas.addEventListener('mousedown', handleInput);

function handleInput(e) {
    e.preventDefault();
    if(isGameOver) return;

    let ex = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    let ey = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    if(ey < canvas.height/2) return; // clicked top area

    let answer = ex < canvas.width/2; // Left is YES (True)

    if(answer === question.isMatch) {
        score++;
        document.getElementById('score').innerText = score;
        AudioController.playScore();
        if(score % 5 === 0) maxTimer = Math.max(1000, maxTimer - 200);
        nextQuestion();
    } else {
        gameOver();
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
