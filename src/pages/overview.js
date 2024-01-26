import { html } from '../node_modules/htm/preact/standalone.module.js';

const a = [
    { url: '', name: 'a' },
];

export function OverviewPage({ identity }) {
    return html`
        <ul>
            ${a.map(link => html`
                <li key=${link.url}>
                    ${a.name}
                </li>
            `)}
        </ul>
    `;
}
