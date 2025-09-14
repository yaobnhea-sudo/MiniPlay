// Enhanced 2048 Game Implementation with Difficulty Levels
class Game2048 {
    constructor() {
        // Safe element selection with null checks
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.movesElement = document.getElementById('moves');
        
        if (!this.canvas || !this.ctx) {
            console.error('Canvas element not found');
            return;
        }

        // Difficulty settings
        this.difficulties = {
            easy: { size: 3, goal: 512 },
            medium: { size: 4, goal: 2048 },
            hard: { size: 5, goal: 4096 }
        };
        
        this.currentDifficulty = 'medium';
        this.size = this.difficulties[this.currentDifficulty].size;
        this.tileSize = 90;
        this.tileMargin = 10;
        this.boardSize = this.size * this.tileSize + (this.size + 1) * this.tileMargin;
        
        // Update canvas size based on difficulty
        this.canvas.width = this.boardSize;
        this.canvas.height = this.boardSize;
        
        // Enhanced colors for different tile values
        this.colors = {
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
            2048: '#edc22e',
            4096: '#3c3a32',
            8192: '#3c3a32'
        };
        
        this.textColors = {
            2: '#776e65',
            4: '#776e65',
            8: '#f9f6f2',
            16: '#f9f6f2',
            32: '#f9f6f2',
            64: '#f9f6f2',
            128: '#f9f6f2',
            256: '#f9f6f2',
            512: '#f9f6f2',
            1024: '#f9f6f2',
            2048: '#f9f6f2',
            4096: '#f9f6f2',
            8192: '#f9f6f2'
        };

        // Animation properties
        this.animating = false;
        this.animationQueue = [];
        this.gameOver = false;
        this.won = false;
        
        this.initializeGame();
    }
    
    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.size = this.difficulties[difficulty].size;
        this.boardSize = this.size * this.tileSize + (this.size + 1) * this.tileMargin;
        
        // Update canvas size
        this.canvas.width = this.boardSize;
        this.canvas.height = this.boardSize;
        
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

    initializeGame() {
        this.reset();
        this.bindEvents();
        this.loadHighScore();
        this.draw();
    }

    safeUpdateDisplay() {
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('high-score');
        const movesElement = document.getElementById('moves');
        
        if (scoreElement) scoreElement.textContent = String(this.score || 0);
        if (highScoreElement) highScoreElement.textContent = String(this.highScore || 0);
        if (movesElement) movesElement.textContent = String(this.moves || 0);
    }
    
    reset() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.moves = 0;
        this.previousStates = [];
        this.gameOver = false;
        this.won = false;
        
        this.addRandomTile();
        this.addRandomTile();
        this.safeUpdateDisplay();
        this.hideGameOverModal();
        this.draw();
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[cell.r][cell.c] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    saveState() {
        this.previousStates.push({
            board: this.board.map(row => [...row]),
            score: this.score,
            moves: this.moves
        });
        
        if (this.previousStates.length > 10) {
            this.previousStates.shift();
        }
    }
    
    undo() {
        if (this.previousStates.length > 0) {
            const previousState = this.previousStates.pop();
            this.board = previousState.board;
            this.score = previousState.score;
            this.moves = previousState.moves;
            this.gameOver = false;
            this.won = false;
            this.safeUpdateDisplay();
            this.draw();
        }
    }

    showGameOverModal() {
        const modal = document.createElement('div');
        modal.id = 'gameOverModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gradient-to-br from-purple-800 to-pink-800 p-8 rounded-2xl text-center max-w-md mx-4 animate-fadeInUp">
                <div class="text-6xl mb-4">${this.won ? '🎉' : '😔'}</div>
                <h2 class="text-3xl font-bold text-white mb-4">${this.won ? 'You Won!' : 'Game Over!'}</h2>
                <div class="text-white text-xl mb-2">Final Score: <span class="text-yellow-300 font-bold">${this.score}</span></div>
                <div class="text-white text-lg mb-6">Best Score: <span class="text-green-300 font-bold">${this.highScore}</span></div>
                <div class="flex gap-4 justify-center">
                    <button onclick="game2048.reset()" class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300">
                        New Game
                    </button>
                    <button onclick="document.getElementById('gameOverModal').remove()" class="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-300">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    hideGameOverModal() {
        const modal = document.getElementById('gameOverModal');
        if (modal) modal.remove();
    }
    
    move(direction) {
        if (this.gameOver || this.animating) return false;
        
        this.saveState();
        
        let moved = false;
        const newBoard = this.board.map(row => [...row]);
        
        const slide = (row) => {
            const filtered = row.filter(val => val !== 0);
            const merged = [];
            let i = 0;
            
            while (i < filtered.length) {
                if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                    merged.push(filtered[i] * 2);
                    this.score += filtered[i] * 2;
                    i += 2;
                    moved = true;
                    
                    if (filtered[i - 2] * 2 === this.difficulties[this.currentDifficulty].goal && !this.won) {
                        this.won = true;
                    }
                } else {
                    merged.push(filtered[i]);
                    i++;
                }
            }
            
            while (merged.length < this.size) {
                merged.push(0);
            }
            
            return merged;
        };
        
        // Apply move based on direction
        switch (direction) {
            case 'left':
                for (let r = 0; r < this.size; r++) {
                    newBoard[r] = slide(newBoard[r]);
                }
                break;
                
            case 'right':
                for (let r = 0; r < this.size; r++) {
                    const reversed = [...newBoard[r]].reverse();
                    const newRow = slide(reversed).reverse();
                    newBoard[r] = newRow;
                }
                break;
                
            case 'up':
                for (let c = 0; c < this.size; c++) {
                    const column = [];
                    for (let r = 0; r < this.size; r++) {
                        column.push(newBoard[r][c]);
                    }
                    const newColumn = slide(column);
                    for (let r = 0; r < this.size; r++) {
                        newBoard[r][c] = newColumn[r];
                    }
                }
                break;
                
            case 'down':
                for (let c = 0; c < this.size; c++) {
                    const column = [];
                    for (let r = 0; r < this.size; r++) {
                        column.push(newBoard[r][c]);
                    }
                    const reversed = [...column].reverse();
                    const newColumn = slide(reversed).reverse();
                    for (let r = 0; r < this.size; r++) {
                        newBoard[r][c] = newColumn[r];
                    }
                }
                break;
        }
        
        // Check if the board actually changed
        if (JSON.stringify(newBoard) !== JSON.stringify(this.board)) {
            moved = true;
            this.moves++;
        }
        
        if (moved) {
            this.board = newBoard;
            this.addRandomTile();
            this.safeUpdateDisplay();
            this.saveHighScore();
            this.draw();
            
            if (this.isGameOver()) {
                this.gameOver = true;
                setTimeout(() => this.showGameOverModal(), 300);
            }
        }
        
        return moved;
    }
    
    isGameOver() {
        // Check for empty cells
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === 0) return false;
            }
        }
        
        // Check for possible merges
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const current = this.board[r][c];
                if (c < this.size - 1 && current === this.board[r][c + 1]) return false;
                if (r < this.size - 1 && current === this.board[r + 1][c]) return false;
            }
        }
        
        return true;
    }
    
    saveHighScore() {
        this.highScore = Math.max(this.highScore || 0, this.score);
        if (window.MiniGames && window.MiniGames.setHighScore) {
            window.MiniGames.setHighScore('2048', this.highScore);
        } else {
            localStorage.setItem('2048HighScore', this.highScore.toString());
        }
    }
    
    loadHighScore() {
        if (window.MiniGames && window.MiniGames.getHighScore) {
            this.highScore = window.MiniGames.getHighScore('2048') || 0;
        } else {
            this.highScore = parseInt(localStorage.getItem('2048HighScore') || '0');
        }
        this.safeUpdateDisplay();
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
            }
        });
        
        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 50) this.move('left');
                else if (diffX < -50) this.move('right');
            } else {
                if (diffY > 50) this.move('up');
                else if (diffY < -50) this.move('down');
            }
            
            touchStartX = 0;
            touchStartY = 0;
        });
        
        // Mobile button controls
        document.querySelectorAll('.mobile-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const direction = btn.getAttribute('data-direction');
                this.move(direction);
            });
        });
        
        // Button event listeners
        const newGameBtn = document.getElementById('newGameBtn');
        const undoBtn = document.getElementById('undoBtn');
        
        if (newGameBtn) newGameBtn.addEventListener('click', () => this.reset());
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
    }
    
    draw() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board background
        this.ctx.fillStyle = '#bbada0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw tiles
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const value = this.board[r][c];
                const x = c * (this.tileSize + this.tileMargin) + this.tileMargin;
                const y = r * (this.tileSize + this.tileMargin) + this.tileMargin;
                
                // Draw tile background
                this.ctx.fillStyle = this.colors[value] || '#3c3a32';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                
                // Draw tile value
                if (value !== 0) {
                    this.ctx.fillStyle = this.textColors[value] || '#f9f6f2';
                    this.ctx.font = `bold ${value > 1000 ? '24px' : value > 100 ? '32px' : '40px'} Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(value.toString(), x + this.tileSize / 2, y + this.tileSize / 2);
                }
            }
        }
    }
}

// Initialize game when DOM is loaded
let game2048;
document.addEventListener('DOMContentLoaded', () => {
    game2048 = new Game2048();
});