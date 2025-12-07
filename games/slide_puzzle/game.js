
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let grid = [];
let gridSize = 4;
let tileSize = 0;
let emptyTile = {r: 3, c: 3};
let isGameOver = false;

function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    tileSize = size / gridSize;
    canvas.width = size;
    canvas.height = size;
    draw();
}
window.addEventListener('resize', resize);

function startGame() {
    // Init sorted
    grid = [];
    let n = 1;
    for(let r=0; r<gridSize; r++) {
        grid[r] = [];
        for(let c=0; c<gridSize; c++) {
            grid[r][c] = n++;
        }
    }
    grid[gridSize-1][gridSize-1] = 0; // Empty
    emptyTile = {r: gridSize-1, c: gridSize-1};

    // Shuffle validly
    for(let i=0; i<200; i++) {
        let moves = [];
        let r = emptyTile.r, c = emptyTile.c;
        if(r > 0) moves.push({r: r-1, c: c});
        if(r < gridSize-1) moves.push({r: r+1, c: c});
        if(c > 0) moves.push({r: r, c: c-1});
        if(c < gridSize-1) moves.push({r: r, c: c+1});

        let move = moves[Math.floor(Math.random() * moves.length)];
        swap(move.r, move.c);
    }

    isGameOver = false;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').style.display = 'none'; // No score
    AudioController.playStart();
    draw();
}

function swap(r, c) {
    let temp = grid[r][c];
    grid[r][c] = 0;
    grid[emptyTile.r][emptyTile.c] = temp;
    emptyTile.r = r;
    emptyTile.c = c;
}

function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);

    for(let r=0; r<gridSize; r++) {
        for(let c=0; c<gridSize; c++) {
            let val = grid[r][c];
            if(val !== 0) {
                let x = c * tileSize;
                let y = r * tileSize;

                ctx.fillStyle = '#7700ff';
                ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

                ctx.fillStyle = '#fff';
                ctx.font = `bold ${tileSize/2}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(val, x + tileSize/2, y + tileSize/2);
            }
        }
    }
}

canvas.addEventListener('touchstart', handleInput, {passive: false});
canvas.addEventListener('mousedown', handleInput);

function handleInput(e) {
    e.preventDefault();
    if(isGameOver) return;

    let ex = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    let ey = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    const rect = canvas.getBoundingClientRect();
    ex -= rect.left;
    ey -= rect.top;

    let c = Math.floor(ex / tileSize);
    let r = Math.floor(ey / tileSize);

    if (Math.abs(r - emptyTile.r) + Math.abs(c - emptyTile.c) === 1) {
        swap(r, c);
        AudioController.playClick();
        draw();
        checkWin();
    }
}

function checkWin() {
    let n = 1;
    for(let r=0; r<gridSize; r++) {
        for(let c=0; c<gridSize; c++) {
            if(r === gridSize-1 && c === gridSize-1) {
                 if(grid[r][c] !== 0) return;
            } else {
                 if(grid[r][c] !== n++) return;
            }
        }
    }

    isGameOver = true;
    document.getElementById('final-score').innerText = "SOLVED!";
    document.getElementById('game-over-screen').classList.add('active');
    AudioController.playScore();
}

document.getElementById('game-container').addEventListener('click', () => {
    if(document.getElementById('start-screen').classList.contains('active')) startGame();
});
document.getElementById('restart-btn').addEventListener('click', startGame);
resize();
