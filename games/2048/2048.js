// 2048 Game Implementation
class Game2048 {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        
        this.size = 4;
        this.tileSize = 90;
        this.tileMargin = 10;
        this.boardSize = this.size * this.tileSize + (this.size + 1) * this.tileMargin;
        
        // Colors for different tile values
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
            4: '#776e65'
        };
        
        this.reset();
        this.bindEvents();
        this.loadHighScore();
        this.draw();
    }
    
    reset() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.previousStates = [];
        this.gameOver = false;
        this.won = false;
        
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
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
            score: this.score
        });
        
        // Limit undo history to 10 moves
        if (this.previousStates.length > 10) {
            this.previousStates.shift();
        }
    }
    
    undo() {
        if (this.previousStates.length > 0) {
            const previousState = this.previousStates.pop();
            this.board = previousState.board;
            this.score = previousState.score;
            this.gameOver = false;
            this.won = false;
            this.updateDisplay();
            this.draw();
        }
    }
    
    move(direction) {
        if (this.gameOver) return false;
        
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
                } else {
                    merged.push(filtered[i]);
                    if (i > 0 && filtered[i] !== filtered[i - 1]) {
                        moved = true;
                    }
                    i++;
                }
            }
            
            while (merged.length < this.size) {
                merged.push(0);
            }
            
            return merged;
        };
        
        const rotateLeft = (matrix) => {
            const rotated = [];
            for (let c = 0; c < this.size; c++) {
                rotated[c] = [];
                for (let r = this.size - 1; r >= 0; r--) {
                    rotated[c][this.size - 1 - r] = matrix[r][c];
                }
            }
            return rotated;
        };
        
        const rotateRight = (matrix) => {
            const rotated = [];
            for (let c = this.size - 1; c >= 0; c--) {
                rotated[this.size - 1 - c] = [];
                for (let r = 0; r < this.size; r++) {
                    rotated[this.size - 1 - c][r] = matrix[r][c];
                }
            }
            return rotated;
        };
        
        const transpose = (matrix) => {
            const transposed = [];
            for (let r = 0; r < this.size; r++) {
                transposed[r] = [];
                for (let c = 0; c < this.size; c++) {
                    transposed[r][c] = matrix[c][r];
                }
            }
            return transposed;
        };
        
        const reverseRows = (matrix) => {
            return matrix.map(row => [...row].reverse());
        };
        
        // Apply move based on direction
        switch (direction) {
            case 'left':
                for (let r = 0; r < this.size; r++) {
                    const newRow = slide(newBoard[r]);
                    if (JSON.stringify(newRow) !== JSON.stringify(newBoard[r])) {
                        moved = true;
                    }
                    newBoard[r] = newRow;
                }
                break;
                
            case 'right':
                for (let r = 0; r < this.size; r++) {
                    const reversed = [...newBoard[r]].reverse();
                    const newRow = slide(reversed).reverse();
                    if (JSON.stringify(newRow) !== JSON.stringify(newBoard[r])) {
                        moved = true;
                    }
                    newBoard[r] = newRow;
                }
                break;
                
            case 'up':
                const transposedUp = transpose(newBoard);
                for (let c = 0; c < this.size; c++) {
                    const newCol = slide(transposedUp[c]);
                    if (JSON.stringify(newCol) !== JSON.stringify(transposedUp[c])) {
                        moved = true;
                    }
                    transposedUp[c] = newCol;
                }
                const finalUp = transpose(transposedUp);
                for (let r = 0; r < this.size; r++) {
                    newBoard[r] = finalUp[r];
                }
                break;
                
            case 'down':
                const transposedDown = transpose(newBoard);
                for (let c = 0; c < this.size; c++) {
                    const reversed = [...transposedDown[c]].reverse();
                    const newCol = slide(reversed).reverse();
                    if (JSON.stringify(newCol) !== JSON.stringify(transposedDown[c])) {
                        moved = true;
                    }
                    transposedDown[c] = newCol;
                }
                const finalDown = transpose(transposedDown);
                for (let r = 0; r < this.size; r++) {
                    newBoard[r] = finalDown[r];
                }
                break;
        }
        
        if (moved) {
            this.board = newBoard;
            this.addRandomTile();
            this.updateDisplay();
            this.draw();
            
            if (this.checkWin()) {
                this.won = true;
                alert('Congratulations! You reached 2048!');
            }
            
            if (this.checkGameOver()) {
                this.gameOver = true;
                this.handleGameOver();
            }
        } else {
            // Revert the saved state if no move was made
            this.previousStates.pop();
        }
        
        return moved;
    }
    
    checkWin() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkGameOver() {
        // Check for empty cells
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const current = this.board[r][c];
                if (
                    (r < this.size - 1 && this.board[r + 1][c] === current) ||
                    (c < this.size - 1 && this.board[r][c + 1] === current)
                ) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    handleGameOver() {
        // Check for new high score
        if (window.MiniGames && window.MiniGames.setHighScore) {
            const isNewHighScore = window.MiniGames.setHighScore('2048', this.score);
            if (isNewHighScore) {
                window.MiniGames.showNotification('New High Score!', 'success');
            }
        } else {
            const currentHighScore = parseInt(localStorage.getItem('2048HighScore') || '0');
            if (this.score > currentHighScore) {
                localStorage.setItem('2048HighScore', this.score.toString());
                alert('New High Score: ' + this.score);
            }
        }
        
        alert(`Game Over! Your score: ${this.score}`);
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
    }
    
    loadHighScore() {
        if (window.MiniGames && window.MiniGames.getHighScore) {
            this.highScoreElement.textContent = window.MiniGames.getHighScore('2048');
        } else {
            this.highScoreElement.textContent = localStorage.getItem('2048HighScore') || '0';
        }
    }
    
    draw() {
        // Clear canvas
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
                    this.ctx.font = value > 512 ? '24px Arial' : '32px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(
                        value.toString(),
                        x + this.tileSize / 2,
                        y + this.tileSize / 2
                    );
                }
            }
        }
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            let moved = false;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    moved = this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    moved = this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    moved = this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    moved = this.move('right');
                    break;
            }
            
            if (moved) {
                this.draw();
            }
        });
        
        document.getElementById('newGameBtn').addEventListener('click', () => this.reset());
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});