import { html, useCallback, useState } from '../node_modules/htm/preact/standalone.module.js';
import { AppHeader } from '../components/header.js';
import { NetworkLog } from '../index.js';

import {
    getAccountData,
    getJoinedMembers,
    getJoinedRooms,
    getState,
} from '../matrix.js';

async function roomToObject(identity, roomId) {
    const data = {};
    try {
        const state = await getState(identity, roomId);
        const roomCreateState = state.find(e => e.type === 'm.room.create' && e.state_key === '')?.content;
        if (typeof roomCreateState?.type === 'string') {
            data.type = roomCreateState?.type;
        }
        if (typeof roomCreateState?.room_version === 'string') {
            data.roomVersion = roomCreateState?.room_version;
        }
        const canonicalAlias = state.find(e => e.type === 'm.room.canonical_alias' && e.state_key === '')?.content?.alias;
        if (typeof canonicalAlias === 'string') {
            data.canonicalAlias = canonicalAlias;
        }
        const name = state.find(e => e.type === 'm.room.name' && e.state_key === '')?.content?.name;
        if (typeof name === 'string') {
            data.name = name;
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
        data.spaceChildren = spaceChildren.length;
    } catch {}
    return data;
}

// const roomIdToDmUserId = (mDirectContent, roomId) => {
//     for (const [userId, roomIds] of Object.entries(mDirectContent)) {
//         if (roomIds.includes(roomId)) {
//             return userId;
//         }
//     }
// };

/**
 * @param {string[]} userIds
 */
function getHomeServers(userIds) {
    const set = new Set();
    for (const userId of userIds) {
        set.add(userId.slice(userId.indexOf(':') + 1));
    }
    return [...set];
}

async function roomMemberStats(identity, roomId, mDirectContent) {
    const joinedMembers = Object.keys((await getJoinedMembers(identity, roomId)).joined);
    return {
        joinedMembersCount: joinedMembers.length,
        joinedHomeServers: getHomeServers(joinedMembers),
        joinedDirectContacts: joinedMembers.filter(userId => userId in mDirectContent),
    };
}

async function *stats(identity) {
    const joinedRooms = (await getJoinedRooms(identity)).joined_rooms;
    let arr = joinedRooms.map(roomId => ({roomId}));
    const mDirectContent = await getAccountData(identity, null, 'm.direct');
    yield arr;
    for (const roomId of joinedRooms) {
        try {
            const roomInfo = await roomToObject(identity, roomId);
            arr = arr.map(room => {
                if (room.roomId !== roomId) {
                    return room;
                }
                return {
                    ...room,
                    ...roomInfo,
                };
            })
            yield arr;
        } catch (error) {
            console.error(error);
        }
        try {
            const roomInfo = await roomMemberStats(identity, roomId, mDirectContent);
            arr = arr.map(room => {
                if (room.roomId !== roomId) {
                    return room;
                }
                return {
                    ...room,
                    ...roomInfo,
                };
            })
            yield arr;
        } catch (error) {
            console.error(error);
        }
    }
    yield arr;
}

export function RoomListPage({identity}) {
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState([]);
    const [text, setText] = useState('');

    const handleClick = useCallback(async(event) => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        setData([]);
        setText('');
        try {
            for await (let array of stats(identity)) {
                setData(array);
                setText(JSON.stringify(array, null, 2));
            }
        } catch(error) {
            setText(error);
        } finally {
            setBusy(false);
        }
    }, [identity]);

    return html`
        <${AppHeader}
            backUrl=${`#/${encodeURIComponent(identity.name)}`}
        >Room List</>
        <main>
            <div>
                This feature has not been optimised. It fetches the entire room state of every joined room.
            </div>
            <button
                disabled=${busy}
                type="button"
                onclick=${handleClick}
            >Start fetching</button>
            ${busy && html`<progress />`}
            <div className="room-list">
                <table>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                            <th>Version</th>
                            <th>Type</th>
                            <th>Join Rule</th>
                            <th>Guest Access</th>
                            <th>History Visibility</th>
                            <th>No. of members</th>
                            <th>No. of home servers</th>
                            <th>No. of direct contacts</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => html`
                            <tr key=${row.roomId}>
                                <td>${row.roomId}</td>
                                <td>${row.name}</td>
                                <td>${row.roomVersion}</td>
                                <td>${row.type}</td>
                                <td>${row.joinRule}</td>
                                <td>${row.guestAccess}</td>
                                <td>${row.historyVisibility}</td>
                                <td>${row.joinedMembersCount}</td>
                                <td>${row.joinedHomeServers?.length}</td>
                                <td>${row.joinedDirectContacts?.length}</td>
                            </tr>
                        `)}
                    </tbody>
                </table>
            </div>
            <textarea readonly value=${text} />
        </main>
        <${NetworkLog} />
    `;
}
