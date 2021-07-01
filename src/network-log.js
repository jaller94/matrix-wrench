import { html, useState } from './node_modules/htm/preact/standalone.module.js';

function NetworkLog() {
    const [calls, setCalls] = useState(null);

    return html`
        <h1>Network Log</h1>
        ${calls ? html`
            <ol>
                ${calls.map(call => html`
                    <li>${call.resource}</li>
                `)}
            </ol>
        ` : html`
            <p>No requests yet.</p>
        `}
    `;
}