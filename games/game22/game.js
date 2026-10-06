const scoreEl = document.getElementById('score');
const questionEl = document.getElementById('question');
const timerFill = document.getElementById('timer-fill');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const answerBtns = [
    document.getElementById('btn0'),
    document.getElementById('btn1'),
    document.getElementById('btn2'),
    document.getElementById('btn3')
];

const audio = new AudioController();

let gameState = 'MENU';
let score = 0;
let timeLeft = 0;
let maxTime = 5; // seconds per question, decreases
let timerId = null;
let currentCorrectIndex = 0;

function initGame() {
    score = 0;
    maxTime = 5;
    scoreEl.textContent = score;
    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    audio.init();
    nextQuestion();
    gameLoop();
}

function generateQuestion() {
    const ops = ['+', '-', '*'];
    // Difficulty scaling
    const range = Math.min(10 + Math.floor(score / 2), 50);

    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * range) + 1;
    let b = Math.floor(Math.random() * range) + 1;

    // Simplification for division if added later, or subtraction to be positive
    if (op === '-') {
        if (a < b) [a, b] = [b, a];
    }

    let result;
    switch(op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*':
            // Keep mult smaller
            a = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            result = a * b;
            break;
    }

    return {
        text: `${a} ${op} ${b}`,
        result: result
    };
}

function nextQuestion() {
    const q = generateQuestion();
    questionEl.textContent = q.text;

    currentCorrectIndex = Math.floor(Math.random() * 4);

    // Generate wrong answers
    const answers = new Set();
    answers.add(q.result);

    while(answers.size < 4) {
        let wrong = q.result + Math.floor(Math.random() * 10) - 5;
        if (wrong !== q.result && wrong >= 0) {
            answers.add(wrong);
        } else {
            // fallback
            answers.add(q.result + answers.size + 1);
        }
    }

    const answersArr = Array.from(answers);
    // Shuffle slightly to ensure randomness if Set order isn't enough (it preserves insertion usually)
    // But we need to place correct at specific index.
    // Actually better to just fill array and insert correct.

    // Simpler approach:
    const finalAnswers = [];
    for (let i = 0; i < 4; i++) {
        if (i === currentCorrectIndex) {
            finalAnswers.push(q.result);
        } else {
            let w;
            do {
                w = q.result + Math.floor(Math.random() * 20) - 10;
            } while (w === q.result || finalAnswers.includes(w) || w < 0);
            finalAnswers.push(w);
        }
    }

    answerBtns.forEach((btn, i) => {
        btn.textContent = finalAnswers[i];
        btn.classList.remove('correct', 'wrong');
        btn.onclick = () => handleAnswer(i);
    });

    // Reset Timer
    timeLeft = Math.max(1.5, 5 - score * 0.1);
    maxTime = timeLeft;
}

function handleAnswer(index) {
    if (gameState !== 'PLAYING') return;

    if (index === currentCorrectIndex) {
        score++;
        scoreEl.textContent = score;
        audio.playCorrect();
        nextQuestion();
    } else {
        answerBtns[index].classList.add('wrong');
        answerBtns[currentCorrectIndex].classList.add('correct');
        gameOver();
    }
}

function gameOver() {
    gameState = 'GAMEOVER';
    audio.playWrong();
    finalScoreEl.textContent = score;
    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 500);
}

function gameLoop() {
    if (gameState !== 'PLAYING') return;

    timeLeft -= 0.05; // assuming loop runs ~20 times sec via interval or RAF
    // actually doing via RAF for smoother bar

}

let lastTime = 0;
function loop(timestamp) {
    if (gameState === 'PLAYING') {
        const dt = (timestamp - lastTime) / 1000;
        if (dt < 1) {
            timeLeft -= dt;
            const pct = (timeLeft / maxTime) * 100;
            timerFill.style.width = pct + '%';

            if (timeLeft <= 0) {
                gameOver();
            }
        }
    }
    lastTime = timestamp;
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);


startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
