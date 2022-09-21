import { html, useCallback, useState } from '../node_modules/htm/preact/standalone.module.js';
import { AppHeader } from '../components/header.js';
import { NetworkLog } from '../index.js';

import {
    getState,
} from '../matrix.js';

async function roomToYaml(identity, roomId) {
    const data = {
        room_id: roomId,
    };
    try {
        const state = await getState(identity, roomId);
        const type = state.find(e => e.type === 'm.room.create' && e.state_key === '')?.content?.type;
        if (typeof type === 'string') {
            data.type = type;
        }
        const canonicalAlias = state.find(e => e.type === 'm.room.canonical_alias' && e.state_key === '')?.content?.alias;
        if (typeof canonicalAlias === 'string') {
            data.canonical_alias = canonicalAlias;
        }
        const name = state.find(e => e.type === 'm.room.name' && e.state_key === '')?.content?.name;
        if (typeof name === 'string') {
            data.name = name;
        }
        const topic = state.find(e => e.type === 'm.room.topic' && e.state_key === '')?.content?.topic;
        if (typeof topic === 'string') {
            data.topic = topic;
        }
        const joinRule = state.find(e => e.type === 'm.room.join_rules' && e.state_key === '')?.content?.join_rule;
        if (typeof joinRule === 'string') {
            data.join_rule = joinRule;
        }
        const guestAccess = state.find(e => e.type === 'm.room.guest_access' && e.state_key === '')?.content?.guest_access;
        if (typeof guestAccess === 'string') {
            data.guest_access = guestAccess;
        }
        const historyVisibility = state.find(e => e.type === 'm.room.guest_access' && e.state_key === '')?.content?.history_visibility;
        if (typeof historyVisibility === 'string') {
            data.history_visibility = historyVisibility;
        }
        const spaceChildren = state.filter(e => e.type === 'm.space.child').map(e => e.state_key);
        if (spaceChildren.length > 0) {
            data.children = await Promise.all(spaceChildren.map(roomId => roomToYaml(identity, roomId)));
        }
    } catch {}
    return data;
}

export function RoomToYamlPage({identity, roomId}) {
    const [busy, setBusy] = useState(false);
    const [text, setText] = useState('');

    const handleClick = useCallback(async(event) => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        try {
            const data = await roomToYaml(identity, roomId);
            setText(JSON.stringify(data, null, 2));
        } catch(error) {
            setText(error);
        } finally {
            setBusy(false);
        }
    }, [identity, roomId]);

    return html`
        <${AppHeader}
            backUrl=${`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}
        >Room to JSON</>
        <main>
            <h2>${roomId}</h2>
            <button
                type="button"
                onclick=${handleClick}
            >Load</button>
            ${busy && html`<progress />`}
            <textarea value=${text} />
        </main>
        <${NetworkLog} />
    `;
}
