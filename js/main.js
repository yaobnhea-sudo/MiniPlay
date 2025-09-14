// Main JavaScript for the mini-games website

// Enhanced Game configuration with new games
const GAMES = {
    snake: { name: 'Snake', storageKey: 'snakeHighScore', color: '#10b981' },
    tetris: { name: 'Tetris', storageKey: 'tetrisHighScore', color: '#3b82f6' },
    '2048': { name: '2048', storageKey: '2048HighScore', color: '#f59e0b' },
    pong: { name: 'Pong', storageKey: 'pongHighScore', color: '#ef4444' },
    memory: { name: 'Memory Game', storageKey: 'memoryHighScore', color: '#8b5cf6' }
};

// Animation utilities
const AnimationUtils = {
    // Fade in animation
    fadeIn(element, duration = 600) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `all ${duration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    },
    
    // Staggered animation for multiple elements
    staggerFadeIn(elements, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                this.fadeIn(element);
            }, index * delay);
        });
    },
    
    // Scale animation
    scaleIn(element, duration = 400) {
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        requestAnimationFrame(() => {
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        });
    },
    
    // Slide animation
    slideIn(element, direction = 'up', duration = 500) {
        const transforms = {
            up: 'translateY(30px)',
            down: 'translateY(-30px)',
            left: 'translateX(30px)',
            right: 'translateX(-30px)'
        };
        
        element.style.opacity = '0';
        element.style.transform = transforms[direction] || transforms.up;
        element.style.transition = `all ${duration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translate(0, 0)';
        });
    },
    
    // Bounce animation
    bounce(element, intensity = 1, duration = 600) {
        element.style.animation = `bounce ${duration}ms ease-in-out`;
        element.style.setProperty('--bounce-intensity', intensity);
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    },
    
    // Glow effect
    glow(element, color = '#667eea', duration = 1000) {
        element.style.boxShadow = `0 0 20px ${color}`;
        element.style.transition = `box-shadow ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.boxShadow = '';
        }, duration);
    },
    
    // Ripple effect
    createRipple(event, color = 'rgba(255, 255, 255, 0.3)') {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');
        circle.style.backgroundColor = color;
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
        
        setTimeout(() => {
            circle.remove();
        }, 600);
    },
    
    // Particle animation
    createParticles(container, count = 20, color = '#ffffff') {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.backgroundColor = color;
            
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            
            container.appendChild(particle);
        }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadHighScores();
    initializeAnimations();
    addEventListeners();
    
    // Add particles to hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        AnimationUtils.createParticles(heroSection, 30);
    }
});

// Initialize all animations
function initializeAnimations() {
    // Animate game cards on load
    const gameCards = document.querySelectorAll('.game-card');
    AnimationUtils.staggerFadeIn(gameCards, 150);
    
    // Animate hero section
    const heroElements = document.querySelectorAll('.hero-section > *');
    AnimationUtils.staggerFadeIn(heroElements, 200);
    
    // Animate hero text
    const heroTitle = document.querySelector('.hero-section h1');
    if (heroTitle) {
        animateText(heroTitle);
    }
    
    // Add hover glow effects to buttons
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            AnimationUtils.glow(this, '#667eea', 300);
        });
    });
}

// Add enhanced event listeners
function addEventListeners() {
    // Add ripple effects to buttons
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.addEventListener('click', function(e) {
            AnimationUtils.createRipple(e, 'rgba(255, 255, 255, 0.4)');
        });
    });
    
    // Add parallax effect to hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-section');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    
    // Add intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                AnimationUtils.slideIn(entry.target, 'up', 600);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animateOnScroll = document.querySelectorAll('.game-card, .section-title, .feature-card');
    animateOnScroll.forEach(el => observer.observe(el));
}

// Animate text by splitting it into spans
function animateText(element) {
    const text = element.textContent;
    element.innerHTML = '';
    
    text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(20px)';
        span.style.transition = `all 0.3s ease-out ${index * 0.05}s`;
        element.appendChild(span);
        
        setTimeout(() => {
            span.style.opacity = '1';
            span.style.transform = 'translateY(0)';
        }, 100);
    });
}

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