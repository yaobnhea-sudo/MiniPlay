// Enhanced Pong Game Implementation with Difficulty Levels
class PongGame {
    constructor() {
        // Safe element selection with null checks
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.aiScoreElement = document.getElementById('aiScore');
        this.playerScoreElement = document.getElementById('playerScore');
        
        if (!this.canvas || !this.ctx) {
            console.error('Canvas element not found');
            return;
        }

        // Difficulty settings
        this.difficulties = {
            easy: { aiSpeed: 3, ballSpeed: 4, maxScore: 3 },
            medium: { aiSpeed: 5, ballSpeed: 6, maxScore: 5 },
            hard: { aiSpeed: 7, ballSpeed: 8, maxScore: 7 }
        };
        
        this.currentDifficulty = 'medium';

        // Enhanced colors and styling
        this.colors = {
            background: '#1a1a2e',
            paddle: '#ffffff',
            ball: '#ff6b6b',
            ballGlow: '#ff4757',
            net: '#ffffff',
            text: '#ffffff'
        };

        // Game dimensions
        this.canvas.width = 800;
        this.canvas.height = 400;

        // Game state
        this.gameRunning = false;
        this.gameOver = false;
        this.paused = false;
        this.maxScore = this.difficulties[this.currentDifficulty].maxScore;

        // Game objects
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 10,
            velocityX: this.difficulties[this.currentDifficulty].ballSpeed,
            velocityY: this.difficulties[this.currentDifficulty].ballSpeed,
            speed: this.difficulties[this.currentDifficulty].ballSpeed
        };

        this.player = {
            x: 0,
            y: this.canvas.height / 2 - 50,
            width: 10,
            height: 100,
            score: 0,
            speed: 8
        };

        this.ai = {
            x: this.canvas.width - 10,
            y: this.canvas.height / 2 - 50,
            width: 10,
            height: 100,
            score: 0,
            speed: this.difficulties[this.currentDifficulty].aiSpeed
        };

        // Animation properties
        this.animationFrame = null;
        this.particles = [];
        this.trail = [];

        this.initializeGame();
    }
    
    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.maxScore = this.difficulties[difficulty].maxScore;
        this.ball.speed = this.difficulties[difficulty].ballSpeed;
        this.ai.speed = this.difficulties[difficulty].aiSpeed;
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
        this.draw();
    }

    safeUpdateDisplay() {
        if (this.aiScoreElement) this.aiScoreElement.textContent = this.ai.score.toString();
        if (this.playerScoreElement) this.playerScoreElement.textContent = this.player.score.toString();
    }

    reset() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.velocityX = this.difficulties[this.currentDifficulty].ballSpeed;
        this.ball.velocityY = this.difficulties[this.currentDifficulty].ballSpeed;
        this.player.score = 0;
        this.ai.score = 0;
        this.gameOver = false;
        this.paused = false;
        this.particles = [];
        this.trail = [];
        this.maxScore = this.difficulties[this.currentDifficulty].maxScore;

        this.safeUpdateDisplay();
        this.hideGameOverModal();
        this.hidePauseModal();
        this.draw();

        if (this.gameRunning) {
            this.stopGame();
        }
    }

    showGameOverModal(winner) {
        const modal = document.createElement('div');
        modal.id = 'gameOverModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gradient-to-br from-purple-800 to-pink-800 p-8 rounded-2xl text-center max-w-md mx-4 animate-fadeInUp">
                <div class="text-6xl mb-4">${winner === 'player' ? '🏆' : '🤖'}</div>
                <h2 class="text-3xl font-bold text-white mb-4">${winner === 'player' ? 'You Win!' : 'AI Wins!'}</h2>
                <div class="text-white text-xl mb-2">Final Score</div>
                <div class="text-white text-lg mb-6">
                    <span class="text-green-300">You: ${this.player.score}</span> - 
                    <span class="text-red-300">AI: ${this.ai.score}</span>
                </div>
                <div class="flex gap-4 justify-center">
                    <button onclick="pongGame.reset(); pongGame.startGame();" class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300">
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
                    <button onclick="pongGame.resumeGame(); document.getElementById('pauseModal').remove();" class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300">
                        Resume
                    </button>
                    <button onclick="pongGame.reset(); document.getElementById('pauseModal').remove();" class="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-lg font-bold hover:from-red-600 hover:to-rose-700 transform hover:scale-105 transition-all duration-300">
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

        this.update();
        this.draw();

        if (!this.gameOver) {
            this.animationFrame = requestAnimationFrame(() => this.gameLoop());
        }
    }

    update() {
        // Move the ball
        this.ball.x += this.ball.velocityX;
        this.ball.y += this.ball.velocityY;

        // Add trail effect
        this.trail.push({ x: this.ball.x, y: this.ball.y, life: 10 });
        this.trail = this.trail.filter(t => --t.life > 0);

        // AI movement with improved intelligence
        const aiCenter = this.ai.y + this.ai.height / 2;
        const targetY = this.ball.y;
        const reactionDelay = 0.1; // AI reaction delay

        if (this.ball.velocityX > 0) { // Ball moving towards AI
            if (aiCenter < targetY - 10) {
                this.ai.y += this.ai.speed * reactionDelay;
            } else if (aiCenter > targetY + 10) {
                this.ai.y -= this.ai.speed * reactionDelay;
            }
        }

        // Simple AI when ball is moving away
        if (this.ball.velocityX < 0) {
            const center = this.canvas.height / 2;
            if (aiCenter < center - 20) {
                this.ai.y += this.ai.speed * 0.5;
            } else if (aiCenter > center + 20) {
                this.ai.y -= this.ai.speed * 0.5;
            }
        }

        // Keep AI paddle within bounds
        this.ai.y = Math.max(0, Math.min(this.canvas.height - this.ai.height, this.ai.y));

        // Ball collision with top and bottom walls
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.velocityY = -this.ball.velocityY;
            this.createParticles(this.ball.x, this.ball.y);
        }

        // Ball collision with paddles
        const playerPaddle = this.ball.x - this.ball.radius < this.player.x + this.player.width &&
                           this.ball.y > this.player.y && this.ball.y < this.player.y + this.player.height;

        const aiPaddle = this.ball.x + this.ball.radius > this.ai.x &&
                        this.ball.y > this.ai.y && this.ball.y < this.ai.y + this.ai.height;

        if (playerPaddle || aiPaddle) {
            let hitPos;
            let paddle;

            if (playerPaddle) {
                hitPos = (this.ball.y - this.player.y) / this.player.height;
                paddle = this.player;
            } else {
                hitPos = (this.ball.y - this.ai.y) / this.ai.height;
                paddle = this.ai;
            }

            // Calculate angle based on hit position
            const angle = (hitPos - 0.5) * Math.PI / 3;
            const speed = Math.abs(this.ball.velocityX) * 1.05; // Increase speed slightly

            this.ball.velocityX = (paddle === this.player ? 1 : -1) * speed;
            this.ball.velocityY = speed * Math.sin(angle);

            this.createParticles(this.ball.x, this.ball.y);
        }

        // Score points
        if (this.ball.x < 0) {
            this.ai.score++;
            this.safeUpdateDisplay();
            this.resetBall();
            this.createParticles(this.ball.x, this.ball.y);
            
            if (this.ai.score >= this.maxScore) {
                this.gameOver = true;
                setTimeout(() => this.showGameOverModal('ai'), 500);
            }
        } else if (this.ball.x > this.canvas.width) {
            this.player.score++;
            this.safeUpdateDisplay();
            this.resetBall();
            this.createParticles(this.ball.x, this.ball.y);
            
            if (this.player.score >= this.maxScore) {
                this.gameOver = true;
                setTimeout(() => this.showGameOverModal('player'), 500);
            }
        }
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * this.difficulties[this.currentDifficulty].ballSpeed;
        this.ball.velocityY = (Math.random() > 0.5 ? 1 : -1) * this.difficulties[this.currentDifficulty].ballSpeed;
    }

    createParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                velocityX: (Math.random() - 0.5) * 8,
                velocityY: (Math.random() - 0.5) * 8,
                life: 20,
                color: this.colors.ballGlow
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.life--;
            return particle.life > 0;
        });
    }

    draw() {
        if (!this.ctx) return;

        // Clear canvas with gradient
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, this.colors.background);
        gradient.addColorStop(1, '#0f0f23');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw trail
        this.trail.forEach(t => {
            const alpha = t.life / 10;
            this.ctx.fillStyle = `rgba(255, 107, 107, ${alpha * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, this.ball.radius * alpha, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw particles
        this.updateParticles();
        this.particles.forEach(particle => {
            const alpha = particle.life / 20;
            this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw net
        this.drawNet();

        // Draw paddles with glow
        this.ctx.shadowColor = this.colors.paddle;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = this.colors.paddle;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.fillRect(this.ai.x, this.ai.y, this.ai.width, this.ai.height);
        this.ctx.shadowBlur = 0;

        // Draw ball with glow
        this.ctx.shadowColor = this.colors.ballGlow;
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = this.colors.ball;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Draw scores
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.player.score.toString(), this.canvas.width / 4, 50);
        this.ctx.fillText(this.ai.score.toString(), 3 * this.canvas.width / 4, 50);
    }

    drawNet() {
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.setLineDash([5, 15]);
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.colors.net;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    bindEvents() {
        // Mouse controls
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.gameRunning || this.paused) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, mouseY - this.player.height / 2));
        });

        // Touch controls for mobile
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.paused) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const touchY = e.touches[0].clientY - rect.top;
            this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, touchY - this.player.height / 2));
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (!this.gameRunning && !this.gameOver) {
                        this.startGame();
                    } else if (this.gameRunning && !this.paused) {
                        this.pauseGame();
                    } else if (this.paused) {
                        this.resumeGame();
                    }
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    e.preventDefault();
                    if (this.gameRunning && !this.paused) {
                        this.player.y = Math.max(0, this.player.y - 20);
                    }
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    e.preventDefault();
                    if (this.gameRunning && !this.paused) {
                        this.player.y = Math.min(this.canvas.height - this.player.height, this.player.y + 20);
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
    }
}

// Initialize game when DOM is loaded
let pongGame;
document.addEventListener('DOMContentLoaded', () => {
    pongGame = new PongGame();
});