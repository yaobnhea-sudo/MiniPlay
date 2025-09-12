# Mini-Games Website

A collection of classic mini-games built with HTML5, CSS3, and JavaScript. All games are playable offline and feature responsive design for mobile and desktop.

## 🎮 Games Included

- **Snake** - Classic snake game where you eat food and grow longer
- **Tetris** - Stack falling blocks to clear lines
- **2048** - Slide tiles to combine numbers and reach 2048

## 🚀 Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Offline Play** - All games work without internet connection
- **High Scores** - Local storage saves your best scores
- **Modern UI** - Clean, modern interface with TailwindCSS
- **No Backend Required** - Pure frontend implementation

## 🛠️ Tech Stack

- **HTML5** - Structure and canvas elements
- **CSS3** - Styling with TailwindCSS
- **JavaScript (ES6+)** - Game logic and interactivity
- **Canvas API** - Game rendering
- **Local Storage** - Score persistence

## 📁 Project Structure

```
mini-games-website/
├── index.html              # Main homepage
├── css/
│   └── main.css           # Custom styles
├── js/
│   └── main.js            # Shared utilities
├── games/
│   ├── snake/
│   │   ├── index.html
│   │   └── snake.js
│   ├── tetris/
│   │   ├── index.html
│   │   └── tetris.js
│   └── 2048/
│       ├── index.html
│       └── 2048.js
├── assets/                # Images and sounds (future)
└── README.md
```

## 🎯 How to Play

### Snake
- Use arrow keys to control the snake
- Eat the red food to grow and increase your score
- Avoid hitting walls or your own tail

### Tetris
- Use arrow keys to move and rotate pieces
- Fill complete horizontal lines to clear them
- Game speeds up as you progress

### 2048
- Use arrow keys to slide tiles
- When two tiles with the same number touch, they merge
- Create a tile with the number 2048 to win

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mini-games-website.git
   cd mini-games-website
   ```

2. **Open in browser**
   Simply open `index.html` in your web browser

3. **Play offline**
   All games work without an internet connection

## 🌐 Live Demo

Visit the live site: [https://yourusername.github.io/mini-games-website/](https://yourusername.github.io/mini-games-website/](https://yaobnhea-sudo.github.io/MiniPlay/)

## 📝 Development

### Local Development
1. Open `index.html` directly in your browser
2. No build process required - it's pure HTML/CSS/JS

### Adding New Games
1. Create a new folder in `/games/[game-name]/`
2. Add `index.html` and `[game-name].js`
3. Update the homepage to include the new game

### Customization
- Modify colors in `css/main.css`
- Add new games by following the existing structure
- Customize game rules in individual game JS files

## 📱 Mobile Support

- Fully responsive design works on all screen sizes
- Touch-friendly controls (future enhancement)
- Optimized for mobile browsers

## 🔄 Future Enhancements

- [ ] Sound effects
- [ ] Dark/light mode toggle
- [ ] Progressive Web App (PWA) features
- [ ] Touch controls for mobile
- [ ] Additional games
- [ ] Online leaderboards (Phase 3)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙋‍♂️ Support

For questions or issues, please open an issue on GitHub.
