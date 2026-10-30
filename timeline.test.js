// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const timelineSource = readFileSync(join(here, 'timeline.js'), 'utf8');

function setup() {
    document.body.innerHTML = `
        <div class="timeline" id="experience-timeline">
            <div class="timeline-item">
                <div class="timeline-item-header">
                    <h3 class="timeline-item-title">Job One</h3>
                </div>
                <div class="timeline-item-body"><ul><li>Did things</li></ul></div>
            </div>
            <div class="timeline-item">
                <div class="timeline-item-header">
                    <h3 class="timeline-item-title">Job Two</h3>
                </div>
                <div class="timeline-item-body"><ul><li>Did more</li></ul></div>
            </div>
        </div>`;
    window.eval(timelineSource);
    window.TimelineExpansion.init();
    return document.querySelectorAll('.timeline-item-header');
}

describe('TimelineExpansion', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('marks headers as focusable buttons with expanded state', () => {
        // Regression: headers used to be plain divs with click-only
        // listeners - unreachable by keyboard and invisible to screen readers.
        const headers = setup();
        headers.forEach((header) => {
            expect(header.getAttribute('role')).toBe('button');
            expect(header.getAttribute('tabindex')).toBe('0');
            expect(header.getAttribute('aria-expanded')).toBe('false');
            const body = document.getElementById(header.getAttribute('aria-controls'));
            expect(body).not.toBeNull();
            expect(body.getAttribute('aria-hidden')).toBe('true');
            expect(body.hasAttribute('inert')).toBe(true);
        });
    });

    it('keeps links inside collapsed bodies out of the tab order', () => {
        // Regression: a collapsed body can hold links (View Project); without
        // inert they stayed keyboard-focusable inside aria-hidden content.
        const headers = setup();
        const body = headers[0].nextElementSibling;
        expect(body.hasAttribute('inert')).toBe(true);

        headers[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        expect(body.hasAttribute('inert')).toBe(false);

        headers[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        expect(body.hasAttribute('inert')).toBe(true);
    });

    it('expands on click and updates ARIA state', () => {
        const headers = setup();
        headers[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        expect(headers[0].classList.contains('open')).toBe(true);
        expect(headers[0].getAttribute('aria-expanded')).toBe('true');
        const body = headers[0].nextElementSibling;
        expect(body.getAttribute('aria-hidden')).toBe('false');
    });

    it('expands and collapses with Enter and Space', () => {
        const headers = setup();

        headers[0].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        expect(headers[0].classList.contains('open')).toBe(true);

        headers[0].dispatchEvent(new window.KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
        expect(headers[0].classList.contains('open')).toBe(false);
        expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    });

    it('ignores unrelated keys', () => {
        const headers = setup();
        headers[0].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true }));
        expect(headers[0].classList.contains('open')).toBe(false);
    });

    it('toggles items independently', () => {
        const headers = setup();
        headers[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        expect(headers[0].classList.contains('open')).toBe(true);
        expect(headers[1].classList.contains('open')).toBe(false);
    });
});
