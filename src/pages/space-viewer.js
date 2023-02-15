import { html, useCallback, useState } from '../node_modules/htm/preact/standalone.module.js';
import { AppHeader } from '../components/header.js';
import { NetworkLog } from '../index.js';

import {
    getState,
    yieldHierachy,
} from '../matrix.js';

function SpaceViewer({identity, rooms}) {
    console.log('rooms', rooms);
    return html`<ul>
        ${rooms.map(room => html`
            <li key=${room.id}>
                <a href=${`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(room.id)}}`}>${room.name ?? room.id}</a>
            </li>
            ${room.children && html`<${SpaceViewer} key=${room.id} identity=${identity} rooms=${room} />`}
        `)}
    </ul>`;
}

export function SpaceManagementPage({identity, roomId}) {
    const [busy, setBusy] = useState(false);
    const [rooms, setRooms] = useState();
    const [data, setData] = useState([]);
    const [text, setText] = useState('');

    const handleClick = useCallback(async(event) => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        setData([]);
        setText('');
        try {
            for await (let result of yieldHierachy(identity, roomId)) {
                setRooms(result.rooms);
                setData(result.rooms.map(r => ({
                    id: r.room_id,
                    name: r.name,
                })));
            }
        } catch(error) {
            setText(error);
        } finally {
            setBusy(false);
        }
    }, [identity, roomId]);

    return html`
        <${AppHeader}
            backUrl=${`#/${encodeURIComponent(identity.name)}`}
        >Space Viewer</>
        <main>
            <button
                disabled=${busy}
                type="button"
                onclick=${handleClick}
            >Start fetching</button>
            ${text && html`<p>${text}</p>`}
            ${rooms && html`<${SpaceViewer} identity=${identity} rooms=${data} />`}
        </main>
        <${NetworkLog} />
    `;
}

// Unused alternative to SpaceManagementPage using a room state query.
export function SpaceManagementStatePage({identity, roomId}) {
    const [rooms, setRooms] = useState(null);

    const handleQuery = useCallback(async() => {
        const state = await getState(identity, roomId);
        const childrenEvents = state.filter(event => event.type === 'm.space.child');
        const { name } = state.find(event => event.type === 'm.room.name').content;
        const childrenRoomIds = childrenEvents.map(event => event.state_key);
        const rooms = [
            {
                id: roomId,
                name,
                children: childrenRoomIds.map(roomId => ({
                    id: roomId,
                })),
            },
        ];
        setRooms(rooms);
    }, [identity, roomId]);

    return html`
        <${AppHeader}
            backUrl=${`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}
        >Space Management</>
        <main>
            <button
                type="button"
                onClick=${handleQuery}
            >Query</button>
            ${rooms && html`<${SpaceViewer} idenity=${identity} rooms=${rooms} />`}
        </main>
        <${NetworkLog} />
    `;
}
