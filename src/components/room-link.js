import { html } from 'htm/preact/standalone.module.js';

export function RoomLink({ identity, roomId }) {
    return html`<a href=${`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}>${roomId}</a>`;
}
