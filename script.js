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
        
        // Toggle the clicked item's body
        if (body.style.maxHeight) {
            body.style.maxHeight = null;
        } else {
            body.style.maxHeight = body.scrollHeight + "px";
        }

        // Find the parent timeline body, if it exists
        const parentBody = item.closest('.timeline-item-body');

        // If we are in a sub-timeline and the parent is open, update its height
        if (parentBody && parentBody.style.maxHeight) {
            // Use a timeout to allow the child animation to start and for the DOM to update
            setTimeout(() => {
                parentBody.style.maxHeight = parentBody.scrollHeight + "px";
            }, 300); // 300ms matches the CSS transition time
        }
    });
});

const seeMoreLinks = document.querySelectorAll('.see-more');

seeMoreLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.stopPropagation(); 

        const parentBody = link.closest('.timeline-item-body');
        const details = parentBody.querySelector('.experience-details');

        if (details) {
            // Check if the details are already shown
            if (details.style.maxHeight) {
                details.style.maxHeight = null;
            } else {
                details.style.maxHeight = details.scrollHeight + "px";
                link.style.display = 'none'; // Hide the link only after expanding
            }

            // Recalculate parent max-height
            if (parentBody.style.maxHeight) {
                setTimeout(() => {
                    parentBody.style.maxHeight = parentBody.scrollHeight + "px";
                }, 300); // Match CSS transition
            }
        }
    });
});
