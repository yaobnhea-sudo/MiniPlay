// Enhanced Tetris Game Implementation with Difficulty Levels and Animations
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPieceCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.boardWidth = 10;
        this.boardHeight = 20;
        this.blockSize = 30;
        
        // Difficulty settings
        this.difficulties = {
            easy: { dropInterval: 1500, name: 'Easy' },
            medium: { dropInterval: 1000, name: 'Medium' },
            hard: { dropInterval: 500, name: 'Hard' }
        };
        
        this.currentDifficulty = 'medium';
        this.animatingLines = [];
        this.pieceAnimations = [];
        this.rotationAnimation = null;
        
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
    
    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.dropInterval = this.difficulties[difficulty].dropInterval;
        this.reset();
        this.updateDifficultyDisplay();
    }
    
    updateDifficultyDisplay() {
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.difficulty === this.currentDifficulty) {
                btn.classList.add('active');
            }
        });
    }
    
    reset() {
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropTime = 0;
        this.dropInterval = this.difficulties[this.currentDifficulty].dropInterval; // milliseconds
        
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
        // Clear game canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw board
        this.drawBoard();
        
        // Draw current piece
        this.drawCurrentPiece();
        
        // Draw next piece
        this.drawNextPiece();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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
    }
    
    drawBoard() {
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x] !== 0) {
                    // Check if this line is being cleared
                    const clearingLine = this.animatingLines.find(line => line.y === y);
                    if (clearingLine) {
                        const elapsed = Date.now() - clearingLine.startTime;
                        const progress = Math.min(elapsed / clearingLine.duration, 1);
                        
                        // Flash effect
                        const alpha = Math.sin(progress * Math.PI * 6) * 0.5 + 0.5;
                        this.ctx.save();
                        this.ctx.globalAlpha = alpha;
                        this.drawBlock(this.ctx, x, y, '#FFFFFF', true);
                        this.ctx.restore();
                    } else {
                        this.drawBlock(this.ctx, x, y, this.colors[this.board[y][x]], true);
                    }
                }
            }
        }
    }
    
    drawCurrentPiece() {
        if (this.currentPiece) {
            // Handle rotation animation
            if (this.rotationAnimation) {
                const elapsed = Date.now() - this.rotationAnimation.startTime;
                const progress = Math.min(elapsed / this.rotationAnimation.duration, 1);
                
                if (progress < 1) {
                    const scale = 0.8 + 0.4 * Math.sin(progress * Math.PI);
                    this.ctx.save();
                    
                    const centerX = (this.currentPiece.x + this.currentPiece.shape[0].length / 2) * this.blockSize;
                    const centerY = (this.currentPiece.y + this.currentPiece.shape.length / 2) * this.blockSize;
                    
                    this.ctx.translate(centerX, centerY);
                    this.ctx.scale(scale, scale);
                    this.ctx.translate(-centerX, -centerY);
                } else {
                    this.rotationAnimation = null;
                }
            }
            
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawBlock(
                            this.ctx,
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.colors[this.currentPiece.color],
                            false
                        );
                    }
                }
            }
            
            if (this.rotationAnimation) {
                this.ctx.restore();
            }
        }
    }
    
    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        // Background for next piece
        this.nextCtx.fillStyle = '#1a1a2e';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const offsetX = Math.floor((this.nextCanvas.width / this.blockSize - this.nextPiece.shape[0].length) / 2);
            const offsetY = Math.floor((this.nextCanvas.height / this.blockSize - this.nextPiece.shape.length) / 2);
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.drawBlock(
                            this.nextCtx,
                            offsetX + x,
                            offsetY + y,
                            this.colors[this.nextPiece.color],
                            false
                        );
                    }
                }
            }
        }
    }
    
    drawBlock(ctx, x, y, color, isLocked) {
        const pixelX = x * this.blockSize;
        const pixelY = y * this.blockSize;
        
        // Main block
        ctx.fillStyle = color;
        ctx.fillRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
        
        // Gradient overlay
        const gradient = ctx.createLinearGradient(pixelX, pixelY, pixelX + this.blockSize, pixelY + this.blockSize);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
        
        // Glow effect for active piece
        if (!isLocked) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.fillStyle = color;
            ctx.fillRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
            ctx.shadowBlur = 0;
        }
        
        // Border
        ctx.strokeStyle = isLocked ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
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
        if (!this.currentPiece) return;
        
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
        
        if (!this.isValidMove(this.currentPiece, 0, 0)) {
            this.currentPiece.shape = oldShape;
        } else {
            // Add rotation animation
            this.rotationAnimation = {
                startTime: Date.now(),
                duration: 150,
                piece: { ...this.currentPiece }
            };
        }
    }
    
    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    this.board[this.currentPiece.y + y][this.currentPiece.x + x] = this.currentPiece.color;
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        const linesToClear = [];
        
        // Find lines to clear
        for (let y = this.boardHeight - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                linesToClear.push(y);
            }
        }
        
        if (linesToClear.length > 0) {
            // Add line clear animation
            this.animatingLines = linesToClear.map(y => ({
                y: y,
                startTime: Date.now(),
                duration: 500
            }));
            
            // Clear lines after animation
            setTimeout(() => {
                linesToClear.forEach(y => {
                    this.board.splice(y, 1);
                    this.board.unshift(Array(this.boardWidth).fill(0));
                    linesCleared++;
                });
                
                this.lines += linesCleared;
                this.score += this.calculateScore(linesCleared);
                this.level = Math.floor(this.lines / 10) + 1;
                this.dropInterval = Math.max(50, this.difficulties[this.currentDifficulty].dropInterval - (this.level - 1) * 50);
                this.updateDisplay();
                this.animatingLines = [];
            }, 500);
        }
    }
    
    calculateScore(lines) {
        const scores = [0, 40, 100, 300, 1200];
        return scores[lines] * this.level;
    }
    
    movePiece(dx, dy) {
        if (this.isValidMove(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }
    
    hardDrop() {
        let dropDistance = 0;
        while (this.movePiece(0, 1)) {
            dropDistance++;
        }
        this.score += dropDistance * 2;
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.dropTime += 16;
        if (this.dropTime >= this.dropInterval) {
            this.dropTime = 0;
            
            if (this.isValidMove(this.currentPiece, 0, 1)) {
                this.currentPiece.y++;
            } else {
                // Piece has landed
                this.lockPiece();
                this.clearLines();
                this.currentPiece = this.nextPiece;
                this.nextPiece = this.generatePiece();
                
                // Check game over
                if (!this.isValidMove(this.currentPiece, 0, 0)) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        this.draw();
    }
    
    updateDisplay() {
        const scoreElement = document.getElementById('score');
        const linesElement = document.getElementById('lines');
        const levelElement = document.getElementById('level');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (linesElement) linesElement.textContent = this.lines;
        if (levelElement) levelElement.textContent = this.level;
    }
    
    loadHighScore() {
        if (window.MiniGames && window.MiniGames.getHighScore) {
            this.highScore = window.MiniGames.getHighScore('tetris') || 0;
        } else {
            this.highScore = parseInt(localStorage.getItem('tetrisHighScore') || '0');
        }
        this.updateDisplay();
    }
    
    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameLoop();
        }
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.update();
        
        if (this.gameRunning && !this.gamePaused) {
            this.animationFrame = requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    showGameOverModal(isNewHighScore = false) {
        const modal = document.createElement('div');
        modal.id = 'tetrisGameOverModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gradient-to-br from-blue-800 to-purple-800 p-8 rounded-2xl text-center max-w-md mx-4 animate-fadeInUp">
                <div class="text-6xl mb-4">${isNewHighScore ? '🏆' : '💀'}</div>
                <h2 class="text-3xl font-bold text-white mb-4">${isNewHighScore ? 'New High Score!' : 'Game Over!'}</h2>
                <div class="text-white text-xl mb-2">Final Score: <span class="text-yellow-300 font-bold">${this.score}</span></div>
                <div class="text-white text-lg mb-2">Lines Cleared: <span class="text-green-300 font-bold">${this.lines}</span></div>
                <div class="text-white text-lg mb-6">Level Reached: <span class="text-blue-300 font-bold">${this.level}</span></div>
                <div class="flex gap-4 justify-center">
                    <button onclick="game.reset(); game.start(); document.getElementById('tetrisGameOverModal').remove();" class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300">
                        Play Again
                    </button>
                    <button onclick="document.getElementById('tetrisGameOverModal').remove()" class="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-300">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    showPauseNotification() {
        const modal = document.createElement('div');
        modal.id = 'tetrisPauseModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gradient-to-br from-yellow-800 to-orange-800 p-8 rounded-2xl text-center max-w-md mx-4 animate-fadeInUp">
                <div class="text-6xl mb-4">⏸️</div>
                <h2 class="text-3xl font-bold text-white mb-4">Paused</h2>
                <div class="text-white text-lg mb-6">Click resume to continue</div>
                <div class="flex gap-4 justify-center">
                    <button onclick="game.pause(); document.getElementById('tetrisPauseModal').remove();" class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300">
                        Resume
                    </button>
                    <button onclick="game.reset(); document.getElementById('tetrisPauseModal').remove();" class="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-lg font-bold hover:from-red-600 hover:to-rose-700 transform hover:scale-105 transition-all duration-300">
                        Reset
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    pause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            if (this.gamePaused) {
                this.showPauseNotification();
            } else {
                // Remove pause modal if it exists
                const pauseModal = document.getElementById('tetrisPauseModal');
                if (pauseModal) pauseModal.remove();
                this.gameLoop();
            }
        }
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            switch(e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.movePiece(0, 1)) {
                        this.score += 1;
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case 'Space':
                    e.preventDefault();
                    this.hardDrop();
                    break;
            }
            this.updateDisplay();
            this.draw();
        });
        
        // Mobile controls
        document.querySelectorAll('.mobile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (!this.gameRunning || this.gamePaused) return;
                
                switch(action) {
                    case 'left':
                        this.movePiece(-1, 0);
                        break;
                    case 'right':
                        this.movePiece(1, 0);
                        break;
                    case 'rotate':
                        this.rotatePiece();
                        break;
                    case 'soft-drop':
                        if (this.movePiece(0, 1)) {
                            this.score += 1;
                        }
                        break;
                    case 'hard-drop':
                        this.hardDrop();
                        break;
                }
                this.updateDisplay();
                this.draw();
            });
        });
        
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }
}

// Initialize game when page loads
const game = new TetrisGame();