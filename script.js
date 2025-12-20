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

const timelineItems = document.querySelectorAll('.timeline-item-header');

timelineItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const body = item.nextElementSibling;
        item.classList.toggle('open');

        // Toggle the clicked item's body
        if (body.style.maxHeight) {
            body.style.maxHeight = null;
        } else {
            body.style.maxHeight = body.scrollHeight + "px";
        }

        // Recursively update max-height of parent timeline items
        let currentBody = item.closest('.timeline-item-body');
        while (currentBody) {
            if (currentBody.style.maxHeight) {
                // Add the child's scrollHeight (plus a buffer for safety/padding if needed, but scrollHeight usually covers it)
                // Actually, just re-reading the parent's scrollHeight is the most robust way
                // as it accounts for the new size of the expanded child.
                currentBody.style.maxHeight = currentBody.scrollHeight + "px";
            }
            // Move up to the next parent timeline-item-body
            currentBody = currentBody.parentElement.closest('.timeline-item-body');
        }
    });
});
