// Enhanced Snake Game Implementation with Difficulty Levels
class SnakeGame {
    constructor() {
        // Safe element selection with null checks
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.speedElement = document.getElementById('speed');
        
        if (!this.canvas || !this.ctx) {
            console.error('Canvas element not found');
            return;
        }

        // Difficulty settings
        this.difficulties = {
            easy: { speed: 200, speedDisplay: '0.5x' },
            medium: { speed: 150, speedDisplay: '1x' },
            hard: { speed: 100, speedDisplay: '1.5x' }
        };
        
        this.currentDifficulty = 'medium';

        this.gridSize = 20;
        this.tileCount = 20;
        this.canvas.width = this.tileCount * this.gridSize;
        this.canvas.height = this.tileCount * this.gridSize;
        
        // Enhanced colors
        this.colors = {
            background: '#1a1a2e',
            grid: '#16213e',
            snake: '#0f4c75',
            snakeHead: '#3282b8',
            food: '#ff6b6b',
            foodGlow: '#ff4757',
            text: '#ffffff'
        };
        
        // Animation properties
        this.animationFrame = null;
        this.gameRunning = false;
        this.gameOver = false;
        this.paused = false;
        
        this.initializeGame();
    }
    
    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.speed = this.difficulties[difficulty].speed;
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
        const speedElement = document.getElementById('speed');
        
        if (scoreElement) scoreElement.textContent = String(this.score || 0);
        if (highScoreElement) highScoreElement.textContent = String(this.highScore || 0);
        if (speedElement) speedElement.textContent = this.difficulties[this.currentDifficulty].speedDisplay;
    }
    
    reset() {
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.dx = 0;
        this.dy = 0;
        this.food = this.generateFood();
        this.score = 0;
        this.speed = this.difficulties[this.currentDifficulty].speed;
        this.gameOver = false;
        this.paused = false;
        
        this.safeUpdateDisplay();
        this.hideGameOverModal();
        this.hidePauseModal();
        this.draw();
        
        if (this.gameRunning) {
            this.stopGame();
        }
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        return newFood;
    }

    showGameOverModal() {
        const modal = document.createElement('div');
        modal.id = 'gameOverModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gradient-to-br from-red-800 to-pink-800 p-8 rounded-2xl text-center max-w-md mx-4 animate-fadeInUp">
                <div class="text-6xl mb-4">💀</div>
                <h2 class="text-3xl font-bold text-white mb-4">Game Over!</h2>
                <div class="text-white text-xl mb-2">Final Score: <span class="text-yellow-300 font-bold">${this.score}</span></div>
                <div class="text-white text-lg mb-6">Best Score: <span class="text-green-300 font-bold">${this.highScore}</span></div>
                <div class="text-white text-sm mb-4">Length: <span class="text-blue-300 font-bold">${this.snake.length}</span></div>
                <div class="flex gap-4 justify-center">
                    <button onclick="snakeGame.reset(); snakeGame.startGame();" class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300">
                        Play Again
                    </button>
                    <button onclick="document.getElementById('gameOverModal').remove()" class="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-300">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showPauseModal() {
        const modal = document.createElement('div');
        modal.id = 'pauseModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gradient-to-br from-blue-800 to-purple-800 p-8 rounded-2xl text-center max-w-md mx-4 animate-fadeInUp">
                <div class="text-6xl mb-4">⏸️</div>
                <h2 class="text-3xl font-bold text-white mb-4">Paused</h2>
                <div class="text-white text-lg mb-6">Press SPACE to continue</div>
                <div class="flex gap-4 justify-center">
                    <button onclick="snakeGame.resumeGame(); document.getElementById('pauseModal').remove();" class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300">
                        Resume
                    </button>
                    <button onclick="snakeGame.reset(); document.getElementById('pauseModal').remove();" class="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-lg font-bold hover:from-red-600 hover:to-rose-700 transform hover:scale-105 transition-all duration-300">
                        Reset
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

    hidePauseModal() {
        const modal = document.getElementById('pauseModal');
        if (modal) modal.remove();
    }
    
    saveHighScore() {
        this.highScore = Math.max(this.highScore || 0, this.score);
        if (window.MiniGames && window.MiniGames.setHighScore) {
            window.MiniGames.setHighScore('snake', this.highScore);
        } else {
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        }
    }
    
    loadHighScore() {
        if (window.MiniGames && window.MiniGames.getHighScore) {
            this.highScore = window.MiniGames.getHighScore('snake') || 0;
        } else {
            this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
        }
        this.safeUpdateDisplay();
    }
    
    startGame() {
        if (!this.gameRunning && !this.gameOver) {
            this.gameRunning = true;
            this.paused = false;
            this.gameLoop();
        }
    }
    
    stopGame() {
        this.gameRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    pauseGame() {
        if (this.gameRunning && !this.gameOver) {
            this.paused = true;
            this.stopGame();
            this.showPauseModal();
        }
    }
    
    resumeGame() {
        if (!this.gameOver && this.paused) {
            this.paused = false;
            this.startGame();
        }
    }
    
    gameLoop() {
        if (!this.gameRunning || this.paused) return;
        
        this.clearScreen();
        this.updateSnake();
        this.drawFood();
        this.drawSnake();
        
        if (!this.gameOver) {
            this.animationFrame = setTimeout(() => this.gameLoop(), this.speed);
        }
    }
    
    clearScreen() {
        if (!this.ctx) return;
        
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, this.colors.background);
        gradient.addColorStop(1, this.colors.grid);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            const pos = i * this.gridSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }
    }
    
    updateSnake() {
        if (this.dx === 0 && this.dy === 0) return;
        
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            this.speed = Math.max(50, this.speed - 2);
            this.safeUpdateDisplay();
            this.saveHighScore();
        } else {
            this.snake.pop();
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.gameRunning = false;
        this.saveHighScore();
        setTimeout(() => this.showGameOverModal(), 100);
    }
    
    draw() {
        this.clearScreen();
        this.drawFood();
        this.drawSnake();
    }
    
    drawSnake() {
        if (!this.ctx) return;
        
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                // Head with glow effect
                this.ctx.shadowColor = this.colors.snakeHead;
                this.ctx.shadowBlur = 10;
                this.ctx.fillStyle = this.colors.snakeHead;
            } else {
                // Body
                this.ctx.shadowColor = this.colors.snake;
                this.ctx.shadowBlur = 5;
                this.ctx.fillStyle = this.colors.snake;
            }
            
            this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
            
            // Eyes for the head
            if (index === 0) {
                this.ctx.fillStyle = 'white';
                const eyeSize = 3;
                const eyeOffset = 6;
                this.ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
            }
        });
    }
    
    drawFood() {
        if (!this.ctx) return;
        
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Pulsing effect
        const pulseSize = 2 + Math.sin(Date.now() * 0.01) * 2;
        
        // Glow effect
        this.ctx.shadowColor = this.colors.foodGlow;
        this.ctx.shadowBlur = 15;
        
        // Draw food
        this.ctx.fillStyle = this.colors.food;
        this.ctx.fillRect(x + pulseSize, y + pulseSize, this.gridSize - pulseSize * 2, this.gridSize - pulseSize * 2);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    changeDirection(dx, dy) {
        // Prevent reverse direction
        if (this.dx === -dx && this.dy === -dy) return;
        
        this.dx = dx;
        this.dy = dy;
        
        // Start game on first movement
        if (!this.gameRunning && !this.gameOver) {
            this.startGame();
        }
    }
    
    bindEvents() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch (e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    e.preventDefault();
                    this.changeDirection(0, -1);
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    e.preventDefault();
                    this.changeDirection(0, 1);
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    e.preventDefault();
                    this.changeDirection(-1, 0);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    e.preventDefault();
                    this.changeDirection(1, 0);
                    break;
                case 'Space':
                    e.preventDefault();
                    if (this.gameRunning && !this.paused) {
                        this.pauseGame();
                    } else if (this.paused) {
                        this.resumeGame();
                    } else if (!this.gameRunning && !this.gameOver) {
                        this.startGame();
                    }
                    break;
            }
        });
        
        // Button controls
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());
        if (pauseBtn) pauseBtn.addEventListener('click', () => {
            if (this.gameRunning && !this.paused) {
                this.pauseGame();
            } else if (this.paused) {
                this.resumeGame();
            }
        });
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        
        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 30) this.changeDirection(-1, 0);
                else if (diffX < -30) this.changeDirection(1, 0);
            } else {
                if (diffY > 30) this.changeDirection(0, -1);
                else if (diffY < -30) this.changeDirection(0, 1);
            }
            
            touchStartX = 0;
            touchStartY = 0;
        });
    }
}

// Initialize game when DOM is loaded
let snakeGame;
document.addEventListener('DOMContentLoaded', () => {
    snakeGame = new SnakeGame();
});