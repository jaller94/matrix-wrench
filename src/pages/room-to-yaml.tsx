import React, { useCallback, useState } from 'react';
import { AppHeader } from '../components/header';
import { NetworkLog } from '../app';

import {
    getState,
} from '../matrix';

async function roomToYaml(identity: Identity, roomId: string) {
    const data: {
        roomId: string,
        type?: string,
        roomVersion?: string,
        canonicalAlias?: string,
        name?: string,
        topic?: string,
        joinRule?: string,
        guestAccess?: string,
        historyVisibility?: string,
        children?: Record<string, unknown>[],
    } = {
        room_id: roomId,
    };
    try {
        const state = await getState(identity, roomId);
        const roomCreateState = state.find(e => e.type === 'm.room.create' && e.state_key === '')?.content;
        if (typeof roomCreateState?.type === 'string') {
            data.type = roomCreateState?.type;
        }
        if (typeof roomCreateState?.room_version === 'string') {
            data.roomVersion = roomCreateState?.room_version ?? '1';
        }
        const canonicalAlias = state.find(e => e.type === 'm.room.canonical_alias' && e.state_key === '')?.content?.alias;
        if (typeof canonicalAlias === 'string') {
            data.canonicalAlias = canonicalAlias;
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
            data.joinRule = joinRule;
        }
        const guestAccess = state.find(e => e.type === 'm.room.guest_access' && e.state_key === '')?.content?.guest_access;
        if (typeof guestAccess === 'string') {
            data.guestAccess = guestAccess;
        }
        const historyVisibility = state.find(e => e.type === 'm.room.history_visibility' && e.state_key === '')?.content?.history_visibility;
        if (typeof historyVisibility === 'string') {
            data.historyVisibility = historyVisibility;
        }
        const spaceChildren = state.filter(e => e.type === 'm.space.child').map(e => e.state_key);
        if (spaceChildren.length > 0) {
            data.children = await Promise.all(spaceChildren.map(roomId => roomToYaml(identity, roomId)));
        }
    } catch {}
    return data;
}

export const RoomToYamlPage = ({identity, roomId}) => {
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

    return <>
        <AppHeader
            backUrl={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}
        >Room to JSON</AppHeader>
        <main>
            <h2>{roomId}</h2>
            <button
                disabled={busy}
                type="button"
                onClick={handleClick}
            >Load</button>
            {busy && <progress />}
            <label>
                Data as JSON (read-only)
                <textarea readOnly value={text} />
            </label>
        </main>
        <NetworkLog />
    </>;
}
