
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let cards = [];
let flipped = [];
let matched = [];
let score = 0;
let isGameOver = false;
let gridCols = 4;
let gridRows = 5; // 20 cards
let tileSize = 0;
let padding = 10;
const icons = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.95;
    tileSize = (size - (padding * (gridCols+1))) / gridCols;
    canvas.width = size;
    canvas.height = size * (gridRows/gridCols);
    draw();
}
window.addEventListener('resize', resize);

function startGame() {
    let deck = [...icons, ...icons];
    // Shuffle
    for(let i=deck.length-1; i>0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    cards = [];
    matched = [];
    flipped = [];
    score = 0;
    isGameOver = false;

    for(let i=0; i<deck.length; i++) {
        let c = i % gridCols;
        let r = Math.floor(i / gridCols);
        cards.push({
            id: i,
            val: deck[i],
            x: padding + c*(tileSize+padding),
            y: padding + r*(tileSize+padding),
            w: tileSize,
            h: tileSize,
            isFlipped: false
        });
    }

    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').innerText = '0';
    AudioController.playStart();
    draw();
}

function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);

    cards.forEach(c => {
        if(c.isFlipped || matched.includes(c.id)) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(c.x, c.y, c.w, c.h);
            ctx.fillStyle = '#000';
            ctx.font = `bold ${c.w/2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(c.val, c.x + c.w/2, c.y + c.h/2);
        } else {
            ctx.fillStyle = '#ff0055';
            ctx.fillRect(c.x, c.y, c.w, c.h);
        }
    });
}

canvas.addEventListener('touchstart', handleInput, {passive: false});
canvas.addEventListener('mousedown', handleInput); // Debug

function handleInput(e) {
    e.preventDefault();
    if(isGameOver) return;
    if(flipped.length >= 2) return;

    let ex = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    let ey = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    // Adjust for canvas position
    const rect = canvas.getBoundingClientRect();
    ex -= rect.left;
    ey -= rect.top;

    for(let c of cards) {
        if(ex > c.x && ex < c.x+c.w && ey > c.y && ey < c.y+c.h) {
            if(!c.isFlipped && !matched.includes(c.id)) {
                c.isFlipped = true;
                flipped.push(c);
                AudioController.playClick();
                draw();

                if(flipped.length === 2) {
                    checkMatch();
                }
            }
            break;
        }
    }
}

function checkMatch() {
    let c1 = flipped[0];
    let c2 = flipped[1];

    if(c1.val === c2.val) {
        matched.push(c1.id, c2.id);
        flipped = [];
        score += 10;
        document.getElementById('score').innerText = score;
        AudioController.playScore();
        if(matched.length === cards.length) {
            setTimeout(gameOver, 500);
        }
        draw();
    } else {
        setTimeout(() => {
            c1.isFlipped = false;
            c2.isFlipped = false;
            flipped = [];
            draw();
            AudioController.playBounce(); // mismatch sound
        }, 800);
    }
}

function gameOver() {
    isGameOver = true;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-screen').classList.add('active');
    AudioController.playLose(); // Actually win here
}

document.getElementById('game-container').addEventListener('click', () => {
    if(document.getElementById('start-screen').classList.contains('active')) startGame();
});
document.getElementById('restart-btn').addEventListener('click', startGame);
resize();
