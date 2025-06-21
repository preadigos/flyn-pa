const board = document.getElementById('board');
const statusDiv = document.getElementById('status');
const resetBtn = document.getElementById('reset');

const playerNames = { X: 'Pablo', O: 'Felipe' };
const playerImages = {
    X: 'FotoPablo.png',
    O: 'FotoFelipe.png'
};

let cells = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let winnerLine = null;
let winnerPlayer = null;

function renderBoard() {
    board.innerHTML = '';
    // Dibuja las celdas
    cells.forEach((cell, idx) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell';
        if (cell === 'X') cellDiv.classList.add('x');
        if (cell === 'O') cellDiv.classList.add('o');
        // Si hay ganador, resalta las celdas ganadoras
        if (winnerLine && winnerLine.includes(idx)) {
            cellDiv.classList.add('winner');
        }
        // Renderiza imagen si hay ficha
        if (cell) {
            const img = document.createElement('img');
            img.src = playerImages[cell];
            img.alt = cell === 'X' ? 'Pablo' : 'Felipe';
            img.style.width = '60px';
            img.style.height = '60px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = cell === 'O' ? '50%' : '10%';
            cellDiv.appendChild(img);
        }
        cellDiv.addEventListener('click', () => handleCellClick(idx));
        board.appendChild(cellDiv);
    });
    // Dibuja la línea ganadora si existe
    if (winnerLine) {
        drawWinnerLine(winnerLine, winnerPlayer);
    }
}

function playWinSound(player) {
    let audio;
    if (player === 'X') {
        audio = document.getElementById('audio-pablo');
    } else if (player === 'O') {
        audio = document.getElementById('audio-felipe');
    }
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1.0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                alert('No se pudo reproducir el sonido. Verifica el archivo y los permisos del navegador.');
            });
        }
    }
}

function showFireworks() {
    const container = document.getElementById('fireworks-container');
    container.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const fw = document.createElement('div');
        fw.className = 'firework';
        fw.style.left = Math.random() * 80 + 10 + '%';
        fw.style.top = Math.random() * 40 + 10 + '%';
        fw.style.background = `hsl(${Math.random()*360},90%,60%)`;
        container.appendChild(fw);
        setTimeout(() => fw.remove(), 1800);
    }
}

function handleCellClick(idx) {
    if (!gameActive || cells[idx]) return;
    cells[idx] = currentPlayer;
    renderBoard();
    const win = checkWinner();
    if (win) {
        statusDiv.textContent = `¡Ganó ${playerNames[currentPlayer]}!`;
        gameActive = false;
        winnerLine = win;
        winnerPlayer = currentPlayer;
        renderBoard();
        playWinSound(currentPlayer);
        if (currentPlayer === 'O') showFireworks();
    } else if (cells.every(cell => cell)) {
        statusDiv.textContent = '¡Empate!';
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDiv.textContent = `Turno de ${playerNames[currentPlayer]}`;
    }
}

function checkWinner() {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8], // filas
        [0,3,6],[1,4,7],[2,5,8], // columnas
        [0,4,8],[2,4,6]          // diagonales
    ];
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
            return pattern;
        }
    }
    return null;
}

function drawWinnerLine(pattern, player) {
    // Elimina línea previa si existe
    const oldLine = document.getElementById('winner-line');
    if (oldLine) oldLine.remove();
    // Coordenadas de las celdas
    const positions = [
        [0,0],[1,0],[2,0],
        [0,1],[1,1],[2,1],
        [0,2],[1,2],[2,2]
    ];
    const [a, b, c] = pattern;
    const [x1, y1] = positions[a];
    const [x2, y2] = positions[c];
    // Calcula centro de las celdas
    const cellSize = 80 + 5; // tamaño + gap
    const offset = 40; // centro de la celda
    const startX = x1 * cellSize + offset;
    const startY = y1 * cellSize + offset;
    const endX = x2 * cellSize + offset;
    const endY = y2 * cellSize + offset;
    // SVG multicolor
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'winner-line');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.top = 0;
    svg.style.left = 0;
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = 2;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', endX);
    line.setAttribute('y2', endY);
    line.setAttribute('stroke', 'url(#rainbow)');
    line.setAttribute('stroke-width', '8');
    line.setAttribute('stroke-linecap', 'round');
    // Gradiente multicolor
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.setAttribute('id', 'rainbow');
    grad.setAttribute('x1', '0%');
    grad.setAttribute('y1', '0%');
    grad.setAttribute('x2', '100%');
    grad.setAttribute('y2', '0%');
    const stops = [
        { offset: '0%', color: '#e53935' },    // rojo
        { offset: '16%', color: '#1976d2' },   // azul
        { offset: '32%', color: '#fbc02d' },   // amarillo
        { offset: '48%', color: '#43a047' },   // verde
        { offset: '64%', color: '#8e24aa' },   // violeta
        { offset: '80%', color: '#f06292' },   // rosa
        { offset: '100%', color: '#ff9800' }   // naranja
    ];
    stops.forEach(s => {
        const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop.setAttribute('offset', s.offset);
        stop.setAttribute('stop-color', s.color);
        grad.appendChild(stop);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);
    svg.appendChild(line);
    board.appendChild(svg);
}

function resetGame() {
    // Detener sonidos
    const audioPablo = document.getElementById('audio-pablo');
    const audioFelipe = document.getElementById('audio-felipe');
    if (audioPablo) { audioPablo.pause(); audioPablo.currentTime = 0; }
    if (audioFelipe) { audioFelipe.pause(); audioFelipe.currentTime = 0; }
    
    cells = Array(9).fill(null);
    // Elegir jugador inicial al azar
    currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
    gameActive = true;
    winnerLine = null;
    winnerPlayer = null;
    statusDiv.textContent = `Turno de ${playerNames[currentPlayer]}`;
    // Elimina línea ganadora si existe
    const oldLine = document.getElementById('winner-line');
    if (oldLine) oldLine.remove();
    document.getElementById('fireworks-container').innerHTML = '';
    renderBoard();
}

resetBtn.addEventListener('click', resetGame);

// Inicializar
resetGame();
