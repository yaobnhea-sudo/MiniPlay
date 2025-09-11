// Snake Game Implementation
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.reset();
        this.bindEvents();
        this.loadHighScore();
    }
    
    reset() {
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.dx = 0;
        this.dy = 0;
        this.food = this.generateFood();
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.updateScore();
        this.draw();
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        this.ctx.fillStyle = '#10b981';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#059669'; // Head is darker
            } else {
                this.ctx.fillStyle = '#10b981';
            }
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // Draw food
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        // Calculate new head position
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            this.updateScore();
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
        
        this.draw();
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Check for new high score
        if (window.MiniGames && window.MiniGames.setHighScore) {
            const isNewHighScore = window.MiniGames.setHighScore('snake', this.score);
            if (isNewHighScore) {
                window.MiniGames.showNotification('New High Score!', 'success');
            }
        } else {
            // Fallback if MiniGames not available
            const currentHighScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
            if (this.score > currentHighScore) {
                localStorage.setItem('snakeHighScore', this.score.toString());
                alert('New High Score: ' + this.score);
            }
        }
        
        alert(`Game Over! Your score: ${this.score}`);
        this.loadHighScore();
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    loadHighScore() {
        if (window.MiniGames && window.MiniGames.getHighScore) {
            this.highScoreElement.textContent = window.MiniGames.getHighScore('snake');
        } else {
            // Fallback if MiniGames not available
            this.highScoreElement.textContent = localStorage.getItem('snakeHighScore') || '0';
        }
    }
    
    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            
            if (this.dx === 0 && this.dy === 0) {
                // Start moving right if not moving
                this.dx = 1;
                this.dy = 0;
            }
            
            this.gameLoop = setInterval(() => {
                this.update();
            }, 100);
        }
    }
    
    pause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            
            if (this.gamePaused) {
                clearInterval(this.gameLoop);
            } else {
                this.gameLoop = setInterval(() => {
                    this.update();
                }, 100);
            }
        }
    }
    
    bindEvents() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
                return;
            }
            
            e.preventDefault();
            
            // Prevent reversing direction
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.dy !== 1) { this.dx = 0; this.dy = -1; }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.dy !== -1) { this.dx = 0; this.dy = 1; }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.dx !== 1) { this.dx = -1; this.dy = 0; }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.dx !== -1) { this.dx = 1; this.dy = 0; }
                    break;
            }
        });
        
        // Button controls
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('resetBtn').addEventListener('click', () => {
            clearInterval(this.gameLoop);
            this.reset();
        });
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});