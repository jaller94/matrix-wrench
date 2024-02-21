import { html, useMemo } from '../node_modules/htm/preact/standalone.module.js';
import { AppHeader } from '../components/header.js';

export function OverviewPage({ identity }) {
    const links = useMemo(() => [
        { url: `#/${encodeURIComponent(identity.name)}/room-list`, name: 'Your rooms' },
        { url: `#/${encodeURIComponent(identity.name)}/contact-list`, name: 'Your contacts' },
        { url: `#/${encodeURIComponent(identity.name)}/user-inspector`, name: 'User inspector' },
        { url: `#/${encodeURIComponent(identity.name)}/appservice`, name: 'AppService API' },
        { url: `#/${encodeURIComponent(identity.name)}/polychat`, name: 'Polychat' },
    ], [identity]);
    return html`
        <${AppHeader}
            backUrl=${`#/${encodeURIComponent(identity.name)}`}
        >Overview</>
        <main>
            <ul>
                ${links.map(link => html`
                    <li key=${link.url}>
                        <a href=${link.url}>${link.name}</a>
                    </li>
                `)}
            </ul>
        </main>
    `;
}
