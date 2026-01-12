// --- Retro Jumping Game Logic ---
const mobileJumpBtn = document.getElementById('mobile-jump-btn');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const gameStartOverlay = document.getElementById('game-start-overlay');
const gameMessage = document.getElementById('game-message');
const gameMessageText = document.getElementById('game-message-text');
const letterDisplay = document.getElementById('letter-display');
const gameCanvas = document.getElementById('game-canvas');
const player = document.getElementById('player');

// Character Selector Elements
const prevCharBtn = document.getElementById('prev-char');
const nextCharBtn = document.getElementById('next-char');
const charPreview = document.getElementById('char-preview');
const githubInput = document.getElementById('github-username-input');

let isGameRunning = false;
let gameSpeed = 5;
let obstacles = [];
let frameId;
let spawnTimer = 0;
let gravity = 0.6;
let velocityY = 0;
let isJumping = false;
let playerBottom = 0;
let gameWidth = gameCanvas.clientWidth; // Cache game width

// Handle resize
window.addEventListener('resize', () => {
    gameWidth = gameCanvas.clientWidth;
});

// Game Config
const TARGET_WORD = "JOSHUA";
let collectedIndex = 0;

// Player dimensions
const PLAYER_SIZE = 40;

// Character Config
const CHARACTERS = [
    { type: 'text', display: '🛸' },
    { type: 'text', display: '🤖' },
    { type: 'text', display: '👾' },
    { type: 'text', display: '>_' },
    { type: 'github', display: '👤' } // GitHub Avatar Placeholder
];
let currentCharIndex = 0;

function applyPlayerSkin() {
    const char = CHARACTERS[currentCharIndex];

    // Reset Player Styling
    player.style.backgroundColor = 'transparent';
    player.innerText = '';
    player.style.backgroundImage = 'none';
    player.style.backgroundSize = 'cover';
    player.style.borderRadius = '0';

    if (char.type === 'text') {
        player.innerText = char.display;
    } else if (char.type === 'github') {
        const username = githubInput.value.trim();
        if (username) {
            player.style.backgroundImage = `url('https://github.com/${username}.png')`;
            player.style.borderRadius = '4px'; // Slight rounded for avatar
        } else {
            // Fallback if empty
            player.innerText = '👤';
        }
    }
}

function updateCharPreview() {
    const char = CHARACTERS[currentCharIndex];

    // Reset styling
    charPreview.style.backgroundColor = 'transparent';
    charPreview.innerText = '';
    charPreview.style.backgroundImage = 'none';
    charPreview.style.backgroundSize = 'cover';
    charPreview.style.borderRadius = '0';

    if (char.type === 'text') {
        charPreview.innerText = char.display;
        githubInput.style.visibility = 'hidden';
    } else if (char.type === 'github') {
        githubInput.style.visibility = 'visible';
        const username = githubInput.value.trim();
        if (username) {
            charPreview.style.backgroundImage = `url('https://github.com/${username}.png')`;
            charPreview.style.borderRadius = '4px';
        } else {
            charPreview.innerText = char.display;
        }
    }

    applyPlayerSkin();
}

// Init Preview
updateCharPreview();

// Selector Events
prevCharBtn.addEventListener('click', () => {
    currentCharIndex--;
    if (currentCharIndex < 0) currentCharIndex = CHARACTERS.length - 1;
    updateCharPreview();
});

nextCharBtn.addEventListener('click', () => {
    currentCharIndex++;
    if (currentCharIndex >= CHARACTERS.length) currentCharIndex = 0;
    updateCharPreview();
});

githubInput.addEventListener('input', updateCharPreview);

githubInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        startGame();
    }
});

// Game State
function startGame() {
    if (isGameRunning) return;

    stopConfetti();

    // Update dimensions on start
    gameWidth = gameCanvas.clientWidth;

    // Apply Skin before starting
    applyPlayerSkin();

    isGameRunning = true;

    // UI Reset
    gameStartOverlay.style.display = 'none';
    gameMessage.style.display = 'none';

    // Game State Reset
    collectedIndex = 0;
    updateLetterDisplay();
    gameSpeed = 5;

    // Player Reset
    playerBottom = 0;
    velocityY = 0;
    isJumping = false;
    player.style.bottom = '0px';
    player.style.transform = 'translate3d(0, 0, 0)'; // Reset transform

    // Clear entities
    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];

    // Start loop
    frameId = requestAnimationFrame(gameLoop);
}

function stopGame(won) {
    isGameRunning = false;
    cancelAnimationFrame(frameId);

    gameMessage.style.display = 'block';
    if (won) {
        gameMessageText.innerText = "YOU WIN!";
        gameMessageText.style.color = "var(--clr-green)";
        restartBtn.innerText = "PLAY AGAIN";
        startConfetti();
    } else {
        stopConfetti();
        gameMessageText.innerText = "GAME OVER";
        gameMessageText.style.color = "var(--clr-orange)";
        restartBtn.innerText = "TRY AGAIN";
    }
}

function updateLetterDisplay() {
    let display = "";
    for (let i = 0; i < TARGET_WORD.length; i++) {
        if (i < collectedIndex) {
            display += TARGET_WORD[i] + " ";
        } else {
            display += "_ ";
        }
    }
    letterDisplay.innerText = display.trim();
}

function jump() {
    if (!isGameRunning) return;

    if (!isJumping) {
        isJumping = true;
        velocityY = 11;
    }
}

function spawnEntity() {
    // Decision: Obstacle or Letter?
    // Chance for letter: 45%
    const isLetter = Math.random() < 0.45;

    // Prevent duplicate letters: Check if the current needed letter is already on screen
    const neededChar = TARGET_WORD[collectedIndex];
    const letterAlreadyOnScreen = obstacles.some(obs => obs.type === 'letter' && obs.char === neededChar);

    if (isLetter && !letterAlreadyOnScreen && collectedIndex < TARGET_WORD.length) {
        spawnLetter(neededChar);
    } else {
        spawnObstacle();
    }
}

function spawnLetter(char) {
    const el = document.createElement('div');
    el.classList.add('collectible');
    el.innerText = char;

    // Letters placement
    const bottom = 10;

    el.style.bottom = bottom + 'px';
    el.style.left = '0px'; // Set to 0 for transform positioning

    // Initial position off-screen
    el.style.transform = `translate3d(${gameWidth}px, 0, 0)`;

    gameCanvas.appendChild(el);

    obstacles.push({
        element: el,
        left: gameWidth,
        width: 30,
        height: 30,
        bottom: bottom,
        type: 'letter',
        char: char,
        collected: false
    });
}

function spawnObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');

    // Varied types
    // 'normal': Standard ground (Jump over)
    // 'tall': Stacked/Tall ground (Hard jump over)
    // 'floating': Mid-air (Jump over)
    // 'high': High-air (Walk under - Don't jump)

    const roll = Math.random();
    let type = 'normal';
    if (roll > 0.85) type = 'high';       // 15%
    else if (roll > 0.70) type = 'floating'; // 15%
    else if (roll > 0.50) type = 'tall';     // 20%
    // Remaining 50% normal

    let width = 30;
    let height = 30;
    let bottom = 0;

    // Icons
    const imgSrc = Math.random() > 0.5 ? 'img/icons8-github-32.png' : 'img/icons8-linkedin-32.png';

    if (type === 'normal') {
        const size = Math.floor(Math.random() * 10) + 30; // 30-40px
        width = size;
        height = size;
        bottom = 0;
    }
    else if (type === 'tall') {
        width = 30;
        height = 60; // Max stack size is two (2 * 30px)
        bottom = 0;
    }
    else if (type === 'floating') {
        width = 30;
        height = 30;
        bottom = 25; // Hovering (Must jump). Lowered to 25 to ensure collision if standing.
    }
    else if (type === 'high') {
        width = 30;
        height = 30;
        bottom = 75; // High air (Walk under - Don't jump)
    }

    obstacle.style.width = width + 'px';
    obstacle.style.height = height + 'px';
    obstacle.style.bottom = bottom + 'px';
    obstacle.style.left = '0px'; // Set to 0 for transform positioning

    obstacle.style.backgroundImage = `url('${imgSrc}')`;
    obstacle.style.backgroundColor = "transparent";

    // Initial position off-screen
    obstacle.style.transform = `translate3d(${gameWidth}px, 0, 0)`;

    if (type === 'tall') {
        // Stack visual
        obstacle.style.backgroundSize = "30px 30px";
        obstacle.style.backgroundRepeat = "repeat-y";
        obstacle.style.backgroundPosition = "center bottom";
    } else {
        obstacle.style.backgroundSize = "contain";
        obstacle.style.backgroundRepeat = "no-repeat";
        obstacle.style.backgroundPosition = "center center";
    }

    gameCanvas.appendChild(obstacle);

    obstacles.push({
        element: obstacle,
        left: gameWidth,
        width: width,
        height: height,
        bottom: bottom,
        type: 'obstacle'
    });
}

function gameLoop() {
    if (!isGameRunning) return;

    // Physics
    if (isJumping) {
        playerBottom += velocityY;
        velocityY -= gravity;

        if (playerBottom <= 0) {
            playerBottom = 0;
            isJumping = false;
            velocityY = 0;
        }
    }
    // OPTIMIZATION: Use transform instead of bottom
    player.style.transform = `translate3d(0, ${-playerBottom}px, 0)`;

    // Spawning
    spawnTimer++;
    // Spawn rate: 
    // 60fps. Spawn every ~1s -> 60 frames.
    if (spawnTimer > 60) {
        spawnEntity();
        spawnTimer = 0;
    }

    // Entity Loop
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.left -= gameSpeed;

        // OPTIMIZATION: Use transform instead of left
        obs.element.style.transform = `translate3d(${obs.left}px, 0, 0)`;

        // Collision Check (AABB)
        const pLeft = 20;
        const pWidth = PLAYER_SIZE;
        const pRight = pLeft + pWidth;

        const pHeight = PLAYER_SIZE;
        const pBottom = playerBottom;
        const pTop = pBottom + pHeight;

        const obsLeft = obs.left;
        const obsRight = obs.left + obs.width;
        const obsBottom = obs.bottom;
        const obsTop = obs.bottom + obs.height;

        if (pRight > obsLeft + 5 && pLeft < obsRight - 5) {
            if (pTop > obsBottom + 5 && pBottom < obsTop - 5) {
                // Collision!
                if (obs.type === 'letter') {
                    if (!obs.collected) {
                        obs.collected = true;
                        obs.element.style.opacity = '0'; // Visual feedback
                        obs.element.style.transform = `translate3d(${obs.left}px, 0, 0) scale(1.5)`;

                        // Check if it's the right one (it should be, we spawn in order)
                        collectedIndex++;
                        updateLetterDisplay();

                        if (collectedIndex >= TARGET_WORD.length) {
                            stopGame(true);
                            return;
                        }
                    }
                } else if (obs.type === 'obstacle') {
                    stopGame(false);
                    return;
                }
            }
        }

        // Cleanup
        if (obs.left < -100) {
            obs.element.remove();
            obstacles.splice(i, 1);
            i--;
        }
    }

    frameId = requestAnimationFrame(gameLoop);
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (isGameRunning) {
            jump();
        } else if (gameMessage.style.display === 'block') {
            startGame();
        }
    }
});

// Remove touch listeners for duck button, only jump remains
gameCanvas.addEventListener('touchstart', (e) => {
    if (e.target === startBtn || e.target === restartBtn) return;
    if (isGameRunning) {
        e.preventDefault();
        jump();
    }
}, { passive: false });

gameCanvas.addEventListener('mousedown', (e) => {
    if (e.target === startBtn || e.target === restartBtn) return;
    if (isGameRunning) jump();
});


if (mobileJumpBtn) mobileJumpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});
if (mobileJumpBtn) mobileJumpBtn.addEventListener('click', (e) => {
    jump();
    mobileJumpBtn.blur();
});


startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// --- Confetti Logic ---
let confettiParticles = [];
let confettiFrameId;

function startConfetti() {
    // Clear existing
    stopConfetti();

    const colors = ['var(--clr-blue)', 'var(--clr-orange)', 'var(--clr-green)', 'var(--clr-pink)', 'var(--clr-primary-txt)'];
    const chars = ['*', '~', '+', '.', ':', 'o', 'x', '^', '#'];

    for (let i = 0; i < 60; i++) {
        const el = document.createElement('div');
        el.classList.add('confetti-particle');
        el.innerText = chars[Math.floor(Math.random() * chars.length)];
        el.style.color = colors[Math.floor(Math.random() * colors.length)];
        el.style.fontSize = (Math.random() * 10 + 10) + 'px'; // 10-20px

        // Random starting position
        const x = Math.random() * gameCanvas.clientWidth;
        const y = -Math.random() * gameCanvas.clientHeight; // Start above

        // Random velocities
        const vx = (Math.random() - 0.5) * 2; // -1 to 1
        const vy = Math.random() * 1 + 1; // 1 to 2 (fall speed)

        gameCanvas.appendChild(el);

        confettiParticles.push({
            element: el,
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }

    confettiLoop();
}

function confettiLoop() {
    const height = gameCanvas.clientHeight;
    const width = gameCanvas.clientWidth;

    confettiParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Wrap around
        if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
        }
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;

        p.element.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`;
    });

    confettiFrameId = requestAnimationFrame(confettiLoop);
}

function stopConfetti() {
    cancelAnimationFrame(confettiFrameId);
    confettiParticles.forEach(p => p.element.remove());
    confettiParticles = [];
}