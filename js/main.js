// Main JavaScript for the mini-games website

// Game configuration
const GAMES = {
    snake: { name: 'Snake', storageKey: 'snakeHighScore' },
    tetris: { name: 'Tetris', storageKey: 'tetrisHighScore' },
    '2048': { name: '2048', storageKey: '2048HighScore' }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadHighScores();
});

// Load high scores from localStorage
function loadHighScores() {
    Object.keys(GAMES).forEach(gameKey => {
        const scoreElement = document.getElementById(`${gameKey}-score`);
        if (scoreElement) {
            const highScore = getHighScore(gameKey);
            scoreElement.textContent = highScore;
        }
    });
}

// Get high score for a specific game
function getHighScore(gameKey) {
    const game = GAMES[gameKey];
    if (!game) return 0;
    
    const stored = localStorage.getItem(game.storageKey);
    return stored ? parseInt(stored, 10) : 0;
}

// Set high score for a specific game
function setHighScore(gameKey, score) {
    const game = GAMES[gameKey];
    if (!game) return false;
    
    const currentHighScore = getHighScore(gameKey);
    if (score > currentHighScore) {
        localStorage.setItem(game.storageKey, score.toString());
        
        // Update display if we're on the homepage
        const scoreElement = document.getElementById(`${gameKey}-score`);
        if (scoreElement) {
            scoreElement.textContent = score;
        }
        
        return true; // New high score!
    }
    
    return false;
}

// Utility function to format time (for games that use timers)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Utility function to show notifications
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Export functions for use in individual games
window.MiniGames = {
    getHighScore,
    setHighScore,
    formatTime,
    showNotification
};