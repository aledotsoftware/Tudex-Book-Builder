
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let grid = [];
let score = 0;
let tileSize = 0;
let padding = 10;
let gameLoop;
let isGameOver = false;

function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    canvas.width = size;
    canvas.height = size;
    tileSize = (size - (padding * 5)) / 4;
    draw();
}
window.addEventListener('resize', resize);

function startGame() {
    grid = Array(4).fill().map(() => Array(4).fill(0));
    score = 0;
    isGameOver = false;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('score').innerText = '0';
    spawnTile();
    spawnTile();
    draw();
    AudioController.playStart();
}

function spawnTile() {
    let empty = [];
    for(let r=0; r<4; r++) {
        for(let c=0; c<4; c++) {
            if(grid[r][c] === 0) empty.push({r,c});
        }
    }
    if(empty.length > 0) {
        let spot = empty[Math.floor(Math.random() * empty.length)];
        grid[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
        return true;
    }
    return false;
}

function getTileColor(val) {
    const colors = {
        0: '#cdc1b4',
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
    };
    return colors[val] || '#3c3a32';
}

function draw() {
    ctx.fillStyle = '#bbada0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(let r=0; r<4; r++) {
        for(let c=0; c<4; c++) {
            let val = grid[r][c];
            let x = padding + c*(tileSize+padding);
            let y = padding + r*(tileSize+padding);

            ctx.fillStyle = getTileColor(val);
            ctx.fillRect(x, y, tileSize, tileSize);

            if(val > 0) {
                ctx.fillStyle = val > 4 ? '#f9f6f2' : '#776e65';
                ctx.font = `bold ${tileSize/2.5}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(val, x + tileSize/2, y + tileSize/2);
            }
        }
    }
}

// Logic
function slide(row) {
    let arr = row.filter(val => val);
    let missing = 4 - arr.length;
    let zeros = Array(missing).fill(0);
    return arr.concat(zeros);
}

function combine(row) {
    for(let i=0; i<3; i++) {
        if(row[i] !== 0 && row[i] === row[i+1]) {
            row[i] *= 2;
            row[i+1] = 0;
            score += row[i];
            AudioController.playScore();
        }
    }
    return row;
}

function move(direction) {
    if(isGameOver) return;
    let oldGrid = JSON.stringify(grid);

    if(direction === 'left' || direction === 'right') {
        for(let r=0; r<4; r++) {
            let row = grid[r];
            if(direction === 'right') row.reverse();
            row = slide(row);
            row = combine(row);
            row = slide(row);
            if(direction === 'right') row.reverse();
            grid[r] = row;
        }
    } else {
        for(let c=0; c<4; c++) {
            let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
            if(direction === 'down') col.reverse();
            col = slide(col);
            col = combine(col);
            col = slide(col);
            if(direction === 'down') col.reverse();
            for(let r=0; r<4; r++) grid[r][c] = col[r];
        }
    }

    document.getElementById('score').innerText = score;
    draw();

    if(JSON.stringify(grid) !== oldGrid) {
        setTimeout(() => {
            spawnTile();
            draw();
            checkGameOver();
        }, 100);
    }
}

function checkGameOver() {
    // Check for zeros
    for(let r=0; r<4; r++)
        for(let c=0; c<4; c++)
            if(grid[r][c] === 0) return;

    // Check matches
    for(let r=0; r<4; r++) {
        for(let c=0; c<4; c++) {
            if(c !== 3 && grid[r][c] === grid[r][c+1]) return;
            if(r !== 3 && grid[r][c] === grid[r+1][c]) return;
        }
    }

    isGameOver = true;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-screen').classList.add('active');
    AudioController.playLose();
}


// Touch Controls
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}, {passive: false});

canvas.addEventListener('touchend', e => {
    if(isGameOver) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if(Math.abs(diffX) > Math.abs(diffY)) {
        if(Math.abs(diffX) > 30) move(diffX > 0 ? 'right' : 'left');
    } else {
        if(Math.abs(diffY) > 30) move(diffY > 0 ? 'down' : 'up');
    }
});

document.getElementById('game-container').addEventListener('click', () => {
    if(document.getElementById('start-screen').classList.contains('active')) startGame();
});
document.getElementById('restart-btn').addEventListener('click', startGame);

resize();
