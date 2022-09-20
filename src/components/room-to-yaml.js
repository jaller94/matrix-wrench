import { html, useCallback, useMemo, useState } from '../node_modules/htm/preact/standalone.module.js';

import {
    getState,
} from '../matrix.js';

async function roomToYaml(identity, roomId) {
    const data = {
        room_id: roomId,
    };
    try {
        const state = await getState(identity, roomId);
        const guestAccess = state.find(e => e.type === 'm.room.guest_access' && e.state_key === '')?.content.guest_access;
        if (guestAccess) {
            data.guest_access = guestAccess;
        }
        const canonicalAlias = state.find(e => e.type === 'm.room.canonical_alias' && e.state_key === '')?.content.alias;
        if (canonicalAlias) {
            data.canonical_alias = canonicalAlias;
        }
        const spaceChildren = state.filter(e => e.type === 'm.space.child').map(e => e.state_key);
        if (spaceChildren) {
            data.children = await Promise.all(spaceChildren.map(roomId => roomToYaml(identity, roomId)));
        }
    } catch {}
    return data;
}

export function RoomToYamlPage({identity, roomId}) {
    const [text, setText] = useState('');

    const handleClick = useCallback(async(event) => {
        event.preventDefault();
        event.stopPropagation();
        const data = await roomToYaml(identity, roomId);
        setText(JSON.stringify(data, null, 2));
    }, [identity, roomId]);

    return html`
        <h3>Room to YAML</h3>
        <button
            type="button"
            onclick=${handleClick}
        >Load</button>
        <textarea value=${text} />
    `;
}
