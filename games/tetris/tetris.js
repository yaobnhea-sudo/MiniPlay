// Tetris Game Implementation
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPieceCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.scoreElement = document.getElementById('score');
        this.linesElement = document.getElementById('lines');
        this.highScoreElement = document.getElementById('high-score');
        
        this.boardWidth = 10;
        this.boardHeight = 20;
        this.blockSize = 30;
        
        this.colors = [
            '#000000', // Empty
            '#FF0000', // I
            '#00FF00', // O
            '#0000FF', // T
            '#FFFF00', // S
            '#FF00FF', // Z
            '#00FFFF', // J
            '#FFA500'  // L
        ];
        
        // Tetris pieces (7 standard pieces)
        this.pieces = [
            // I piece
            [
                [[1,1,1,1]]
            ],
            // O piece
            [
                [[1,1],
                 [1,1]]
            ],
            // T piece
            [
                [[0,1,0],
                 [1,1,1]]
            ],
            // S piece
            [
                [[0,1,1],
                 [1,1,0]]
            ],
            // Z piece
            [
                [[1,1,0],
                 [0,1,1]]
            ],
            // J piece
            [
                [[1,0,0],
                 [1,1,1]]
            ],
            // L piece
            [
                [[0,0,1],
                 [1,1,1]]
            ]
        ];
        
        this.reset();
        this.bindEvents();
        this.loadHighScore();
        this.draw();
    }
    
    reset() {
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000; // milliseconds
        
        this.currentPiece = this.generatePiece();
        this.nextPiece = this.generatePiece();
        
        this.updateDisplay();
        this.draw();
    }
    
    generatePiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        const piece = this.pieces[pieceIndex];
        return {
            shape: piece[0],
            x: Math.floor(this.boardWidth / 2) - Math.floor(piece[0][0].length / 2),
            y: 0,
            color: pieceIndex + 1
        };
    }
    
    draw() {
        // Clear main canvas
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x] !== 0) {
                    this.ctx.fillStyle = this.colors[this.board[y][x]];
                    this.ctx.fillRect(
                        x * this.blockSize,
                        y * this.blockSize,
                        this.blockSize - 1,
                        this.blockSize - 1
                    );
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.ctx);
        }
        
        // Draw grid lines
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.boardWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.boardHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.canvas.width, y * this.blockSize);
            this.ctx.stroke();
        }
        
        // Draw next piece
        if (this.nextPiece) {
            this.nextCtx.fillStyle = '#1f2937';
            this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
            
            const pieceWidth = this.nextPiece.shape[0].length;
            const pieceHeight = this.nextPiece.shape.length;
            const offsetX = (4 - pieceWidth) * 15;
            const offsetY = (4 - pieceHeight) * 15;
            
            this.nextCtx.fillStyle = this.colors[this.nextPiece.color];
            for (let y = 0; y < pieceHeight; y++) {
                for (let x = 0; x < pieceWidth; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.nextCtx.fillRect(
                            offsetX + x * 30,
                            offsetY + y * 30,
                            28,
                            28
                        );
                    }
                }
            }
        }
    }
    
    drawPiece(piece, ctx) {
        ctx.fillStyle = this.colors[piece.color];
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    ctx.fillRect(
                        (piece.x + x) * this.blockSize,
                        (piece.y + y) * this.blockSize,
                        this.blockSize - 1,
                        this.blockSize - 1
                    );
                }
            }
        }
    }
    
    isValidMove(piece, dx = 0, dy = 0) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + dx;
                    const newY = piece.y + y + dy;
                    
                    if (newX < 0 || newX >= this.boardWidth || 
                        newY >= this.boardHeight || 
                        (newY >= 0 && this.board[newY][newX] !== 0)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    rotatePiece() {
        const rotated = [];
        const rows = this.currentPiece.shape.length;
        const cols = this.currentPiece.shape[0].length;
        
        for (let i = 0; i < cols; i++) {
            rotated[i] = [];
            for (let j = 0; j < rows; j++) {
                rotated[i][j] = this.currentPiece.shape[rows - 1 - j][i];
            }
        }
        
        const oldShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (!this.isValidMove(this.currentPiece)) {
            this.currentPiece.shape = oldShape;
        }
    }
    
    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.generatePiece();
        
        // Check game over
        if (!this.isValidMove(this.currentPiece)) {
            this.gameOver();
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.boardHeight - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.boardWidth).fill(0));
                linesCleared++;
                y++; // Check the same line again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += this.calculateScore(linesCleared);
            this.updateDisplay();
        }
    }
    
    calculateScore(lines) {
        const baseScore = [0, 40, 100, 300, 1200];
        return baseScore[lines] * this.level;
    }
    
    dropPiece() {
        if (this.isValidMove(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        } else {
            this.placePiece();
        }
    }
    
    hardDrop() {
        while (this.isValidMove(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            this.score += 2; // Bonus points for hard drop
        }
        this.placePiece();
        this.updateDisplay();
    }
    
    update(timestamp) {
        if (!this.gameRunning || this.gamePaused) return;
        
        if (!this.dropTime) this.dropTime = timestamp;
        
        if (timestamp - this.dropTime > this.dropInterval) {
            this.dropPiece();
            this.dropTime = timestamp;
            this.draw();
        }
        
        requestAnimationFrame((time) => this.update(time));
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.linesElement.textContent = this.lines;
    }
    
    loadHighScore() {
        if (window.MiniGames && window.MiniGames.getHighScore) {
            this.highScoreElement.textContent = window.MiniGames.getHighScore('tetris');
        } else {
            this.highScoreElement.textContent = localStorage.getItem('tetrisHighScore') || '0';
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Check for new high score
        if (window.MiniGames && window.MiniGames.setHighScore) {
            const isNewHighScore = window.MiniGames.setHighScore('tetris', this.score);
            if (isNewHighScore) {
                window.MiniGames.showNotification('New High Score!', 'success');
            }
        } else {
            const currentHighScore = parseInt(localStorage.getItem('tetrisHighScore') || '0');
            if (this.score > currentHighScore) {
                localStorage.setItem('tetrisHighScore', this.score.toString());
                alert('New High Score: ' + this.score);
            }
        }
        
        alert(`Game Over! Your score: ${this.score}, Lines: ${this.lines}`);
        this.loadHighScore();
    }
    
    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            requestAnimationFrame((time) => this.update(time));
        }
    }
    
    pause() {
        this.gamePaused = !this.gamePaused;
        if (!this.gamePaused && this.gameRunning) {
            requestAnimationFrame((time) => this.update(time));
        }
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && !['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
                return;
            }
            
            e.preventDefault();
            
            switch(e.key) {
                case 'ArrowLeft':
                    if (this.isValidMove(this.currentPiece, -1, 0)) {
                        this.currentPiece.x--;
                        this.draw();
                    }
                    break;
                case 'ArrowRight':
                    if (this.isValidMove(this.currentPiece, 1, 0)) {
                        this.currentPiece.x++;
                        this.draw();
                    }
                    break;
                case 'ArrowDown':
                    this.dropPiece();
                    this.score++;
                    this.updateDisplay();
                    this.draw();
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    this.draw();
                    break;
                case ' ':
                    this.hardDrop();
                    this.draw();
                    break;
            }
        });
        
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});