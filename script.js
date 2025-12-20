const crtIntensitySlider = document.getElementById('crt-intensity');

function updateCrtIntensity(intensity) {
    const opacity = intensity / 100;
    // Max opacity for the overlay is 0.8 for high intensity
    const scaledOpacity = opacity * 0.8;

    document.documentElement.style.setProperty('--crt-opacity', scaledOpacity);

    if (intensity > 0) {
        document.body.classList.add('crt');
    } else {
        document.body.classList.remove('crt');
    }

    localStorage.setItem('crt-intensity', intensity);
}

const savedIntensity = localStorage.getItem('crt-intensity');
if (savedIntensity !== null) {
    crtIntensitySlider.value = savedIntensity;
    updateCrtIntensity(savedIntensity);
} else {
    // Default to off
    updateCrtIntensity(0);
}

crtIntensitySlider.addEventListener('input', (e) => {
    updateCrtIntensity(e.target.value);
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

if (currentTheme) {
    if (currentTheme === 'dark') {
        setDarkTheme();
    }
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setDarkTheme();
}

themeSwitch.addEventListener('change', (e) => {
    if (e.target.checked) {
        setDarkTheme();
    } else {
        setLightTheme();
    }
});

const tabs = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        tabContents.forEach(content => {
            if (content.id === tabId) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    });
});

// Timeline expansion logic using max-height: none for auto-sizing
const timelineItems = document.querySelectorAll('.timeline-item-header');

timelineItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const body = item.nextElementSibling;
        
        if (item.classList.contains('open')) {
            // CLOSING
            // 1. Lock the height to its current pixel value (transition needs start point)
            body.style.maxHeight = body.scrollHeight + "px";
            
            // 2. Force reflow to ensure the browser registers the start height
            // void operator creates an expression that evaluates to undefined, preventing unused var warning
            void body.offsetHeight;

            // 3. Trigger the transition to 0
            // We use requestAnimationFrame to ensure the reflow has settled
            requestAnimationFrame(() => {
                body.style.maxHeight = null;
                item.classList.remove('open');
            });
        } else {
            // OPENING
            item.classList.add('open');
            // Set initial target height for animation
            body.style.maxHeight = body.scrollHeight + "px";
            
            // Once transition is done, remove the constraint so nested items can expand freely
            body.addEventListener('transitionend', function onEnd() {
                // Check if still open (user didn't click close mid-animation)
                if (item.classList.contains('open')) {
                    body.style.maxHeight = "none";
                }
                body.removeEventListener('transitionend', onEnd);
            }, { once: true });
        }
    });
});
