// Expandable timeline items: mouse, keyboard and screen-reader support.
// Exposed as a global (window.TimelineExpansion) so script.js and tests can
// use it without a build step.
(function () {
    'use strict';

    function getBody(header) {
        return header.nextElementSibling;
    }

    function isExpanded(header) {
        return header.classList.contains('open');
    }

    function setExpanded(header, expand) {
        var body = getBody(header);
        if (!body) return;

        header.classList.toggle('open', expand);
        header.setAttribute('aria-expanded', expand ? 'true' : 'false');
        body.setAttribute('aria-hidden', expand ? 'false' : 'true');
        // Keep hidden content out of the tab order and accessibility tree:
        // collapsed bodies can contain links (such as View Project).
        if (expand) {
            body.removeAttribute('inert');
        } else {
            body.setAttribute('inert', '');
        }

        if (expand) {
            body.style.maxHeight = body.scrollHeight + 'px';
            body.addEventListener('transitionend', function onEnd() {
                if (isExpanded(header)) {
                    body.style.maxHeight = 'none';
                }
                body.removeEventListener('transitionend', onEnd);
            }, { once: true });
        } else {
            body.style.maxHeight = body.scrollHeight + 'px';
            void body.offsetHeight; // force reflow so the transition runs
            requestAnimationFrame(function () {
                body.style.maxHeight = null;
            });
        }
    }

    function toggle(header) {
        setExpanded(header, !isExpanded(header));
    }

    function makeHeaderAccessible(header, index) {
        var body = getBody(header);
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', isExpanded(header) ? 'true' : 'false');
        if (body) {
            if (!body.id) {
                body.id = 'timeline-item-body-' + index;
            }
            header.setAttribute('aria-controls', body.id);
            body.setAttribute('aria-hidden', isExpanded(header) ? 'false' : 'true');
            if (!isExpanded(header)) {
                body.setAttribute('inert', '');
            }
        }
    }

    function init(root) {
        var scope = root || document;
        var headers = scope.querySelectorAll('.timeline-item-header');
        headers.forEach(function (header, index) {
            makeHeaderAccessible(header, index);

            header.addEventListener('click', function (e) {
                e.stopPropagation();
                toggle(header);
            });

            header.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    toggle(header);
                }
            });
        });
    }

    window.TimelineExpansion = {
        init: init,
        toggle: toggle,
        setExpanded: setExpanded,
        isExpanded: isExpanded,
    };
})();
