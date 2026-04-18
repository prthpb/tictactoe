const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('resetGame');
const modeSelect = document.getElementById('gameMode');
const themeToggle = document.getElementById('themeToggle');
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let scores = { X: 0, O: 0, Draw: 0 };
const humanPlayer = 'X';
const aiPlayer = 'O';

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Confetti Logic
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function createConfetti() {
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            r: Math.random() * 6 + 2,
            dx: Math.random() * 10 - 5,
            dy: Math.random() * -10 - 5,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }
}

function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, index) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.2; // gravity
        if (p.y > canvas.height) {
            particles.splice(index, 1);
        }
    });
    if (particles.length > 0) {
        requestAnimationFrame(drawConfetti);
    }
}

// Theme Toggle
themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.innerText = isDark ? 'Toggle Dark Mode' : 'Toggle Light Mode';
});

// Game Logic
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
modeSelect.addEventListener('change', resetGame);

function handleCellClick(e) {
    const cell = e.target;
    const index = cell.getAttribute('data-index');

    if (board[index] !== null || !gameActive) return;

    makeMove(index, currentPlayer);

    if (gameActive) {
        const mode = modeSelect.value;
        if (mode !== 'pvp' && currentPlayer === aiPlayer) {
            setTimeout(makeAiMove, 300); // slight delay for realism
        }
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].innerText = player;
    cells[index].classList.add(player.toLowerCase());

    if (checkWin(board, player)) {
        endGame(false, player);
    } else if (isDraw(board)) {
        endGame(true, null);
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusElement.innerText = `Player ${currentPlayer}'s Turn`;
    }
}

function checkWin(currentBoard, player) {
    return winningConditions.some(condition => {
        return condition.every(index => currentBoard[index] === player);
    });
}

function isDraw(currentBoard) {
    return currentBoard.every(cell => cell !== null);
}

function endGame(draw, winner) {
    gameActive = false;
    if (draw) {
        statusElement.innerText = "It's a Draw!";
        scores.Draw++;
        document.getElementById('scoreDraw').innerText = scores.Draw;
    } else {
        statusElement.innerText = `Player ${winner} Wins!`;
        scores[winner]++;
        document.getElementById(`score${winner}`).innerText = scores[winner];
        createConfetti();
        drawConfetti();
    }
}

function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    statusElement.innerText = "Player X's Turn";
    cells.forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('x', 'o');
    });
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// AI Logic
function makeAiMove() {
    const mode = modeSelect.value;
    let move;

    if (mode === 'easy') {
        let emptyCells = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else if (mode === 'hard') {
        move = minimax(board, aiPlayer).index;
    }

    if (move !== undefined) {
        makeMove(move, aiPlayer);
    }
}

function minimax(newBoard, player) {
    let availSpots = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);

    if (checkWin(newBoard, humanPlayer)) return { score: -10 };
    else if (checkWin(newBoard, aiPlayer)) return { score: 10 };
    else if (availSpots.length === 0) return { score: 0 };

    let moves = [];

    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === aiPlayer) {
            let result = minimax(newBoard, humanPlayer);
            move.score = result.score;
        } else {
            let result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = null;
        moves.push(move);
    }

    let bestMove;
    if (player === aiPlayer) {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}
