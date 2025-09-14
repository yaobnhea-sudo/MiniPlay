
// Enhanced Memory Game Implementation with Difficulty Levels
class MemoryGame {
    constructor() {
        this.difficulties = {
            easy: { gridSize: 3, pairs: 4 },
            medium: { gridSize: 4, pairs: 8 },
            hard: { gridSize: 5, pairs: 12 }
        };
        
        this.currentDifficulty = 'medium';
        
        this.allCards = [
            { emoji: '🎮', id: 'gaming' },
            { emoji: '🎯', id: 'target' },
            { emoji: '🎲', id: 'dice' },
            { emoji: '🎪', id: 'circus' },
            { emoji: '🎨', id: 'art' },
            { emoji: '🎭', id: 'theater' },
            { emoji: '🎸', id: 'guitar' },
            { emoji: '🎺', id: 'trumpet' },
            { emoji: '🚗', id: 'car' },
            { emoji: '✈️', id: 'plane' },
            { emoji: '🚀', id: 'rocket' },
            { emoji: '🏠', id: 'house' }
        ];
        
        this.gameCards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.startTime = null;
        this.timerInterval = null;
        this.hints = 3;
        
        this.initializeGame();
    }
    
    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.startNewGame();
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
    
    // Initialize game
    initializeGame() {
        this.createGameBoard();
        this.updateStats();
    }

    createGameBoard() {
        const grid = document.getElementById('memoryGrid');
        grid.innerHTML = '';
        
        const difficulty = this.difficulties[this.currentDifficulty];
        const numPairs = difficulty.pairs;
        const gridSize = difficulty.gridSize;
        
        // Update grid layout
        grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        // Select cards for current difficulty
        const selectedCards = this.allCards.slice(0, numPairs);
        
        // Create pairs and shuffle
        this.gameCards = [...selectedCards, ...selectedCards]
            .sort(() => Math.random() - 0.5)
            .map((card, index) => ({ ...card, index, flipped: false, matched: false }));
        
        // Create card elements
        this.gameCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            grid.appendChild(cardElement);
        });
    }

    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'memory-card';
        cardDiv.dataset.index = index;
        
        cardDiv.innerHTML = `
            <div class="card-back">
                <span style="font-size: 2em;">?</span>
            </div>
            <div class="card-front">
                <span style="font-size: 2.5em;">${card.emoji}</span>
            </div>
        `;
        
        cardDiv.addEventListener('click', () => this.flipCard(index));
        
        // Add entrance animation
        setTimeout(() => {
            cardDiv.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
        }, 100);
        
        return cardDiv;
    }

    flipCard(index) {
        const card = this.gameCards[index];
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        
        // Prevent flipping if game not started, already flipped, or matched
        if (!this.gameStarted && this.moves === 0) {
            this.startGame();
        }
        
        if (card.flipped || card.matched || this.flippedCards.length >= 2) {
            return;
        }
        
        // Flip the card
        card.flipped = true;
        cardElement.classList.add('flipped');
        this.flippedCards.push({ card, element: cardElement });
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            
            setTimeout(() => {
                this.checkMatch();
            }, 600);
        }
    }

    checkMatch() {
        const [first, second] = this.flippedCards;
        
        if (first.card.id === second.card.id) {
            // Match found
            first.card.matched = true;
            second.card.matched = true;
            
            first.element.classList.add('matched');
            second.element.classList.add('matched');
            
            this.matchedPairs++;
            this.updateStats();
            
            // Add celebration effect
            this.celebrateMatch(first.element, second.element);
            
            if (this.matchedPairs === this.difficulties[this.currentDifficulty].pairs) {
                this.endGame();
            }
        } else {
            // No match - flip back
            first.card.flipped = false;
            second.card.flipped = false;
            
            first.element.classList.remove('flipped');
            second.element.classList.remove('flipped');
            
            // Add shake animation for wrong match
            this.shakeCards(first.element, second.element);
        }
        
        this.flippedCards = [];
    }

    celebrateMatch(card1, card2) {
        // Create particle effect
        this.createParticles(card1);
        this.createParticles(card2);
    }

    createParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.backgroundColor = '#ff6b6b';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            document.body.appendChild(particle);
            
            const angle = (i / 6) * Math.PI * 2;
            const velocity = 50 + Math.random() * 50;
            const lifetime = 1000;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { 
                    transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: lifetime,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    }

    shakeCards(card1, card2) {
        card1.style.animation = 'shake 0.5s ease-in-out';
        card2.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            card1.style.animation = '';
            card2.style.animation = '';
        }, 500);
    }

    startGame() {
        this.gameStarted = true;
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    endGame() {
        this.gameStarted = false;
        clearInterval(this.timerInterval);
        
        const winMessage = document.getElementById('winMessage');
        winMessage.style.display = 'block';
        
        // Add final celebration
        this.celebrateWin();
    }

    celebrateWin() {
        const grid = document.getElementById('memoryGrid');
        const cards = grid.querySelectorAll('.memory-card');
        
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = `celebration 0.6s ease-in-out ${index * 0.1}s`;
            }, index * 100);
        });
    }

    updateStats() {
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('matches').textContent = this.matchedPairs;
    }

    updateTimer() {
        if (!this.gameStarted) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        const timeElement = document.getElementById('time');
        if (timeElement) {
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    startNewGame() {
        // Reset game state
        this.gameCards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.hints = 3;
        
        // Clear timer
        clearInterval(this.timerInterval);
        const timeElement = document.getElementById('time');
        if (timeElement) timeElement.textContent = '0:00';
        
        // Hide win message
        const winMessage = document.getElementById('winMessage');
        if (winMessage) winMessage.style.display = 'none';
        
        // Create new game board
        this.createGameBoard();
        this.updateStats();
    }
    
    reset() {
        this.startNewGame();
    }

    showHint() {
        if (this.hints <= 0) return;
        
        const unmatched = this.gameCards.filter(card => !card.matched && !card.flipped);
        if (unmatched.length < 2) return;
        
        // Find a matching pair
        const pairs = {};
        unmatched.forEach(card => {
            if (!pairs[card.id]) pairs[card.id] = [];
            pairs[card.id].push(card);
        });
        
        const matchingPair = Object.values(pairs).find(group => group.length === 2);
        if (matchingPair) {
            matchingPair.forEach(card => {
                const element = document.querySelector(`[data-index="${card.index}"]`);
                element.style.boxShadow = '0 0 20px #ffeb3b';
                
                setTimeout(() => {
                    element.style.boxShadow = '';
                }, 1500);
            });
            
            this.hints--;
            const hintBtn = document.getElementById('hintBtn');
            if (hintBtn) {
                hintBtn.textContent = `Hint (${this.hints})`;
                
                if (this.hints === 0) {
                    hintBtn.disabled = true;
                }
            }
        }
    }
}

// Add shake animation style
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);

// Initialize game when page loads
let memoryGame;
document.addEventListener('DOMContentLoaded', () => {
    memoryGame = new MemoryGame();
});