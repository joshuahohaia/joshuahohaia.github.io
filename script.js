const crtToggleButton = document.getElementById('crt-toggle-icon');

function toggleCrt() {
    const isCrtOn = document.body.classList.toggle('crt');
    crtToggleButton.classList.toggle('active', isCrtOn);
    localStorage.setItem('crt', isCrtOn ? 'on' : 'off');
}

if (localStorage.getItem('crt') === 'on') {
    document.body.classList.add('crt');
    crtToggleButton.classList.add('active');
}

crtToggleButton.addEventListener('click', toggleCrt);

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
    item.addEventListener('click', () => {
        const body = item.nextElementSibling;
        item.classList.toggle('open');

        // Toggle the clicked item's body
        if (body.style.maxHeight) {
            body.style.maxHeight = null;
        } else {
            body.style.maxHeight = body.scrollHeight + "px";
        }
    });
});
