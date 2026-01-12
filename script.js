// Enable scrolling after initial animation completes
setTimeout(() => {
    const content = document.querySelector('.content');
    if (content) content.classList.add('scrollable');
}, 1800);

const crtIntensitySlider = document.getElementById('crt-intensity');

function updateCrtIntensity(intensity) {
    const opacity = intensity / 100;
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
    const defaultIntensity = 5;
    crtIntensitySlider.value = defaultIntensity;
    updateCrtIntensity(defaultIntensity);
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

    if (data.link) {
        headerContent += `<a href="${data.link}" class="timeline-item-link" target="_blank" rel="noopener noreferrer">View</a>`;
    }

    header.innerHTML = headerContent;

    const linkElement = header.querySelector('.timeline-item-link');
    if (linkElement) {
        linkElement.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

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
const contentContainer = document.querySelector('.content');
if (contentContainer && contentContainer.clientHeight > 800) {
    const firstHeader = document.querySelector('.timeline-item-header');
    if (firstHeader) {
        const body = firstHeader.nextElementSibling;
        if (body) {
            firstHeader.classList.add('open');
            body.style.maxHeight = "none";
        }
    }
}

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