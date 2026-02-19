// Enable scrolling after initial animation completes
setTimeout(() => {
    const content = document.querySelector('.content');
    if (content) content.classList.add('scrollable');
}, 1800);

// CRT Toggle
const crtSwitch = document.getElementById('crt-switch-checkbox');

function setCrtEnabled(enabled, animate = false) {
    if (enabled) {
        document.documentElement.style.setProperty('--crt-opacity', 0.4);
        document.body.classList.add('crt');
        crtSwitch.checked = true;
        // Trigger ASCII scramble animation
        if (animate && typeof AsciiScramble !== 'undefined') {
            AsciiScramble.triggerScramble();
        }
    } else {
        document.documentElement.style.setProperty('--crt-opacity', 0);
        document.body.classList.remove('crt');
        crtSwitch.checked = false;
    }
    localStorage.setItem('crt-enabled', enabled);
}

const savedCrt = localStorage.getItem('crt-enabled');
if (savedCrt === 'true') {
    setCrtEnabled(true);
} else {
    setCrtEnabled(false);
}

crtSwitch.addEventListener('change', (e) => {
    setCrtEnabled(e.target.checked, true);
});

const themeSwitch = document.getElementById('theme-switch-checkbox');
const currentTheme = localStorage.getItem('theme');

function setDarkTheme() {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeSwitch.checked = true;
    localStorage.setItem('theme', 'dark');
}

function setLightTheme() {
    document.documentElement.removeAttribute('data-theme');
    themeSwitch.checked = false;
    localStorage.setItem('theme', 'light');
}

if (currentTheme === 'light') {
    setLightTheme();
} else {
    setDarkTheme();
}

themeSwitch.addEventListener('change', (e) => {
    if (e.target.checked) {
        setDarkTheme();
    } else {
        setLightTheme();
    }
});

// Render Timeline Data
const timelineContainer = document.getElementById('experience-timeline');

function createTimelineItem(data) {
    const item = document.createElement('div');
    item.className = 'timeline-item';

    // Header Construction
    const header = document.createElement('div');
    header.className = 'timeline-item-header';

    let headerContent = '';

    // Check if it has a logo (top-level item style) or not (nested style)
    if (data.logo) {
        headerContent += `
            <div class="timeline-header-top">
                <img src="${data.logo}" alt="${data.title} Logo" class="timeline-logo">
                <div class="timeline-header-info">
                    <h3 class="timeline-item-title">${data.title}</h3>
                    <span class="timeline-item-date">${data.date}</span>
                    <span class="timeline-item-location">${data.location}</span>
                </div>
            </div>`;
    } else {
        headerContent += `
            <h3 class="timeline-item-title">${data.title}</h3>
            <span class="timeline-item-date">${data.date}</span>
            <span class="timeline-item-location">${data.location}</span>`;
    }

    if (data.summary) {
        headerContent += `<span class="timeline-item-initial-summary">${data.summary}</span>`;
    }

    header.innerHTML = headerContent;
    item.appendChild(header);

    // Body Construction
    const body = document.createElement('div');
    body.className = 'timeline-item-body';

    // Achievements List
    if (data.achievements && data.achievements.length > 0) {
        const ul = document.createElement('ul');
        data.achievements.forEach(achievement => {
            const li = document.createElement('li');
            li.textContent = achievement;
            ul.appendChild(li);
        });
        body.appendChild(ul);
    }

    // Skills
    if (data.skills) {
        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'timeline-skills';

        const skillsArray = data.skills.split(', ');
        skillsArray.forEach(skill => {
            const tag = document.createElement('span');
            tag.className = 'timeline-skill-tag';
            tag.textContent = skill;
            skillsContainer.appendChild(tag);
        });

        if (data.link) {
            const linkTag = document.createElement('a');
            linkTag.href = data.link;
            linkTag.target = "_blank";
            linkTag.rel = "noopener noreferrer";
            linkTag.className = 'timeline-skill-tag timeline-link-tag';
            linkTag.innerHTML = 'View Project <span style="font-size: 0.8em;">↗</span>';

            linkTag.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            skillsContainer.appendChild(linkTag);
        }

        body.appendChild(skillsContainer);
    }

    // Sub-items (Recursive)
    if (data.subItems && data.subItems.length > 0) {
        const subTimeline = document.createElement('div');
        subTimeline.className = 'sub-timeline';
        data.subItems.forEach(subItemData => {
            subTimeline.appendChild(createTimelineItem(subItemData));
        });
        body.appendChild(subTimeline);
    }

    item.appendChild(body);
    return item;
}

if (typeof timelineData !== 'undefined' && timelineContainer) {
    timelineData.forEach(data => {
        timelineContainer.appendChild(createTimelineItem(data));
    });
}

// Timeline expansion logic
const timelineItems = document.querySelectorAll('.timeline-item-header');

timelineItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const body = item.nextElementSibling;

        if (item.classList.contains('open')) {
            // CLOSING
            body.style.maxHeight = body.scrollHeight + "px";
            void body.offsetHeight;
            requestAnimationFrame(() => {
                body.style.maxHeight = null;
                item.classList.remove('open');
            });
        } else {
            // OPENING
            item.classList.add('open');
            body.style.maxHeight = body.scrollHeight + "px";
            body.addEventListener('transitionend', function onEnd() {
                if (item.classList.contains('open')) {
                    body.style.maxHeight = "none";
                }
                body.removeEventListener('transitionend', onEnd);
            }, { once: true });
        }
    });
});

// Auto-expand the first timeline item if there is sufficient vertical space
// const contentContainer = document.querySelector('.content');
// if (contentContainer && contentContainer.clientHeight > 800) {
//     const firstHeader = document.querySelector('.timeline-item-header');
//     if (firstHeader) {
//         const body = firstHeader.nextElementSibling;
//         if (body) {
//             firstHeader.classList.add('open');
//             body.style.maxHeight = "none";
//         }
//     }
// }

// Hide nav social icons when contact section is in view
const contactSection = document.getElementById('contact-section');
const navSocialLinks = document.querySelectorAll('.nav-social-link');

if (contactSection && navSocialLinks.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            navSocialLinks.forEach(link => {
                if (entry.isIntersecting) {
                    link.classList.add('hidden');
                } else {
                    link.classList.remove('hidden');
                }
            });
        });
    }, {
        threshold: 0.3
    });

    observer.observe(contactSection);
}

// ASCII Ripple Animation Controller - Mouse position based effect
const AsciiScramble = {
    containers: [],
    originalTexts: new Map(),
    scrambleChars: '/\\|_-=+*#@%&?!<>[]{}()~',

    config: {
        tickInterval: 50,
        rippleRadius: 8,         // Character radius for scramble effect
        decodeSpeed: 0.15,       // Chance per tick for distant chars to decode
        scrambleIntensity: 0.7   // Chance for chars in radius to scramble
    },

    init() {
        const selectors = ['.ascii-full', '.ascii-medium', '.ascii-small'];
        selectors.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                this.containers.push(container);
                this.storeOriginalText(container);
                this.bindEvents(container);
            }
        });
    },

    storeOriginalText(container) {
        const asciiLine = container.querySelector('.ascii-line');
        if (!asciiLine) return;

        const text = asciiLine.textContent;
        const lines = text.split('\n');

        this.originalTexts.set(container, {
            node: asciiLine,
            text: text,
            lines: lines,
            charGrid: lines.map(line => line.split('')),
            scrambleGrid: lines.map(line => new Array(line.length).fill(false)),
            mouseCol: -100,
            mouseRow: -100,
            isHovering: false,
            intervalId: null
        });
    },

    bindEvents(container) {
        container.addEventListener('mouseenter', () => {
            const data = this.originalTexts.get(container);
            if (!data) return;
            data.isHovering = true;
            this.startAnimation(container);
        });

        container.addEventListener('mouseleave', () => {
            const data = this.originalTexts.get(container);
            if (!data) return;
            data.isHovering = false;
            data.mouseCol = -100;
            data.mouseRow = -100;
        });

        container.addEventListener('mousemove', (e) => {
            this.updateMousePosition(container, e);
        });
    },

    updateMousePosition(container, e) {
        const data = this.originalTexts.get(container);
        if (!data) return;

        const asciiLine = data.node;
        const rect = asciiLine.getBoundingClientRect();
        const style = getComputedStyle(asciiLine);
        const fontSize = parseFloat(style.fontSize);

        // Approximate character dimensions for monospace font
        const charWidth = fontSize * 0.6;
        const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.1;

        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;

        data.mouseCol = Math.floor(relX / charWidth);
        data.mouseRow = Math.floor(relY / lineHeight);
    },

    startAnimation(container) {
        const data = this.originalTexts.get(container);
        if (!data || data.intervalId) return;

        data.intervalId = setInterval(() => {
            this.rippleTick(container);
        }, this.config.tickInterval);
    },

    rippleTick(container) {
        if (getComputedStyle(container).display === 'none') return;

        const data = this.originalTexts.get(container);
        if (!data) return;

        const { charGrid, scrambleGrid, mouseCol, mouseRow, isHovering } = data;
        let allDecoded = true;

        // Update scramble states based on distance from cursor
        for (let row = 0; row < charGrid.length; row++) {
            for (let col = 0; col < charGrid[row].length; col++) {
                const char = charGrid[row][col];

                // Skip whitespace
                if (char === ' ' || char === '\n' || char === '\r') continue;

                // Calculate distance from cursor (in character units)
                const distance = Math.sqrt(
                    Math.pow(col - mouseCol, 2) +
                    Math.pow((row - mouseRow) * 2, 2) // Weight rows more (ASCII is wider than tall)
                );

                if (isHovering && distance < this.config.rippleRadius) {
                    // Inside ripple radius - chance to scramble based on proximity
                    const proximity = 1 - (distance / this.config.rippleRadius);
                    if (Math.random() < this.config.scrambleIntensity * proximity) {
                        scrambleGrid[row][col] = true;
                    }
                } else {
                    // Outside radius or not hovering - chance to decode
                    if (scrambleGrid[row][col] && Math.random() < this.config.decodeSpeed) {
                        scrambleGrid[row][col] = false;
                    }
                }

                if (scrambleGrid[row][col]) {
                    allDecoded = false;
                }
            }
        }

        // Render the current state
        this.render(container);

        // Stop animation when fully decoded and not hovering
        if (!isHovering && allDecoded && data.intervalId) {
            clearInterval(data.intervalId);
            data.intervalId = null;
        }
    },

    render(container) {
        const data = this.originalTexts.get(container);
        if (!data) return;

        const { charGrid, scrambleGrid } = data;
        const lines = [];

        for (let row = 0; row < charGrid.length; row++) {
            let line = '';
            for (let col = 0; col < charGrid[row].length; col++) {
                const char = charGrid[row][col];

                if (scrambleGrid[row][col] && char !== ' ' && char !== '\n' && char !== '\r') {
                    line += this.scrambleChars[Math.floor(Math.random() * this.scrambleChars.length)];
                } else {
                    line += char;
                }
            }
            lines.push(line);
        }

        data.node.textContent = lines.join('\n');
    },

    // Trigger a full scramble animation (used for CRT toggle)
    triggerScramble() {
        this.containers.forEach(container => {
            if (getComputedStyle(container).display === 'none') return;

            const data = this.originalTexts.get(container);
            if (!data) return;

            // Scramble all non-whitespace characters
            const { charGrid, scrambleGrid } = data;
            for (let row = 0; row < charGrid.length; row++) {
                for (let col = 0; col < charGrid[row].length; col++) {
                    const char = charGrid[row][col];
                    if (char !== ' ' && char !== '\n' && char !== '\r') {
                        scrambleGrid[row][col] = true;
                    }
                }
            }

            // Start animation to decode
            this.startAnimation(container);
        });
    }
};

// Initialize after page animations complete
setTimeout(() => {
    AsciiScramble.init();
}, 2000);

// Experiment video hover play/reset
document.querySelectorAll('.experiment-card').forEach(card => {
    const video = card.querySelector('video.experiment-preview');
    if (!video) return;

    card.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
    });

    card.addEventListener('mouseleave', () => {
        video.pause();
    });
});