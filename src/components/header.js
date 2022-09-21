import { html, useCallback } from '../node_modules/htm/preact/standalone.module.js';

export function AppHeader({backLabel = 'Back', backUrl, children, onBack}) {
    const handleBack = useCallback(event => {
        if (backUrl) {
            event.preventDefault();
            event.stopPropagation();
            window.location = backUrl;
        }
        if (onBack) {
            onBack(event);
        }
    }, [backUrl, onBack]);

    return html`
        <header class="app-header">
            ${(onBack || typeof backUrl === 'string') && html`<button aria-label=${backLabel} class="app-header_back" title=${backLabel} type="button" onclick=${handleBack}>${'<'}</button>`}
            <h1 class="app-header_label">${children}</h1>
            <nav class="app-header_nav">
                <a href="#about">About</a>
            </nav>
        </header>
    `;
}
