import { html, useCallback, useMemo, useState } from '../node_modules/htm/preact/standalone.module.js';
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
    let rows = joinedRooms.map(roomId => ({roomId}));
    const mDirectContent = await getAccountData(identity, null, 'm.direct');
    yield {
        rows,
    };
    let progressValue = 0;
    for (const roomId of joinedRooms) {
        try {
            const roomInfo = await roomToObject(identity, roomId);
            rows = rows.map(room => {
                if (room.roomId !== roomId) {
                    return room;
                }
                return {
                    ...room,
                    ...roomInfo,
                };
            })
        } catch (error) {
            console.error(error);
        }
        try {
            const roomInfo = await roomMemberStats(identity, roomId, mDirectContent);
            rows = rows.map(room => {
                if (room.roomId !== roomId) {
                    return room;
                }
                return {
                    ...room,
                    ...roomInfo,
                };
            })
        } catch (error) {
            console.error(error);
        }
        progressValue += 1;
        yield {
            progressValue,
            progressMax: joinedRooms.length,
            rows,
        };
    }
}

export function sortSymbol(direction) {
    if (direction === 'ascending') {
        return ' 🔼';
    } else if (direction === 'descending') {
        return ' 🔽';
    }
    return '';
}

export function TableHead({ propertyName, label, sortBys, onSortBys }) {
    const handleClick = useCallback(() => {
        const currentDirection = sortBys.find(([key]) => key === propertyName)?.[1];
        const flippedDirection = currentDirection === 'ascending' ? 'descending' : 'ascending';
        return onSortBys([[propertyName, flippedDirection]]);
    }, [sortBys, onSortBys]);
    return html`<th onclick=${handleClick}>${label}${sortSymbol(sortBys.find(([key]) => key === propertyName)?.[1])}</th>`;
}

export function RoomListTable({data, sortBys, onSortBys}) {
    return html`
        <div className="room-list">
            <table>
                <thead>
                    <tr>
                        <${TableHead} propertyName="roomId" label="Id" sortBys=${sortBys} onSortBys=${onSortBys} />
                        <${TableHead} propertyName="name" label="Name" sortBys=${sortBys} onSortBys=${onSortBys} />
                        <${TableHead} propertyName="roomVersion" label="Version" sortBys=${sortBys} onSortBys=${onSortBys} />
                        <${TableHead} propertyName="type" label="Type" sortBys=${sortBys} onSortBys=${onSortBys} />
                        <${TableHead} propertyName="joinRule" label="Join Rule" sortBys=${sortBys} onSortBys=${onSortBys} />
                        <${TableHead} propertyName="guestAccess" label="Guest Access" sortBys=${sortBys} onSortBys=${onSortBys} />
                        <${TableHead} propertyName="historyVisibility" label="History Visibility" sortBys=${sortBys} onSortBys=${onSortBys} />
                        <${TableHead} propertyName="joinedMembersCount" label="No. of members" sortBys=${sortBys} onSortBys=${onSortBys} />
                        <${TableHead} propertyName="joinedHomeServers.length" label="No. of home servers" sortBys=${sortBys} onSortBys=${onSortBys} />
                        <${TableHead} propertyName="joinedDirectContacts.length" label="No. of direct contacts" sortBys=${sortBys} onSortBys=${onSortBys} />
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
    `;
}

export function RoomListSorter({ data, ...props }) {
    const [sortBys, setSortBys] = useState([]);
    const processedData = useMemo(() => {
        let array = [...data];
        for (const [key, direction] of sortBys) {
            const directionFactor = direction === 'ascending' ? 1 : -1;
            if (key.endsWith('Count')) {
                // numeric values
                array.sort((a, b) => directionFactor * ((a[key] ?? 0) - (b[key] ?? 0)));
            } else if (key.endsWith('.length')) {
                // length of an array
                const actualKey = key.slice(0, -7);
                array.sort((a, b) => directionFactor * ((a[actualKey]?.length ?? 0) - (b[actualKey]?.length ?? 0)));
            } else {
                // string values
                array.sort((a, b) => directionFactor * (a[key] ?? '').localeCompare((b[key] ?? '')));
            }
        }
        return array;
    }, [data, sortBys]);
    return html`<${RoomListTable}
        ...${props}
        data=${processedData}
        sortBys=${sortBys}
        onSortBys=${setSortBys}
    />`;
}

export function RoomListFilterer({ data, ...props }) {
    const [filters, setFilters] = useState([]);
    const processedData = useMemo(() => {
        return data.filter((row) => filters.every(filter => row[filter[0]].includes(filter[1])));
    }, [data, filters]);
    return html`<${RoomListSorter}
        ...${props}
        data=${processedData}
        onFilters=${setFilters}
    />`;
}

export function RoomListPage({identity}) {
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState([]);
    const [progressValue, setProgressValue] = useState(undefined);
    const [progressMax, setProgressMax] = useState(undefined);
    const [text, setText] = useState('');

    // const handleClick = useCallback(async (event) => {
    //     event.preventDefault();
    //     event.stopPropagation();
    //     setData([
    //         {
    //             roomId: '!abc:matrix.org',
    //             name: 'User Meetup',
    //             roomVersion: '6',
    //             joinedMembersCount: 156,
    //             joinedHomeServers: ['matrix.org', 'example.org'],
    //             joinedDirectContacts: ['@test:matrix.org', '@test:example.org'],
    //         },
    //         {
    //             roomId: '!xyz:matrix.org',
    //             name: 'Manjaro User Group',
    //             roomVersion: '6',
    //             joinedMembersCount: 10232,
    //             joinedHomeServers: ['matrix.org', 'example.org', 'example.com'],
    //             joinedDirectContacts: ['@test:example.com', '@test:matrix.org', '@test:example.org'],
    //         },
    //         {
    //             roomId: '!efg:matrix.org',
    //             joinedMembersCount: 1,
    //             joinedHomeServers: ['matrix.org'],
    //         },
    //         {
    //             roomId: '!cde:matrix.org',
    //             roomVersion: '1',
    //             joinedMembersCount: 19,
    //             joinedHomeServers: ['matrix.org', 'example.org', 'example.com'],
    //         },
    //         {
    //             roomId: '!thx:matrix.org',
    //             name: 'Matrix Berlin Space',
    //             roomVersion: '9',
    //             type: 'm.space',
    //             joinedMembersCount: 236,
    //             joinedHomeServers: ['matrix.org', 'example.org', 'example.com'],
    //         },
    //         {
    //             roomId: '!mno:matrix.org',
    //             name: 'All German Matrix Spaces',
    //             roomVersion: '10',
    //             type: 'm.space',
    //             joinedMembersCount: 4536,
    //             joinedHomeServers: ['matrix.org', 'example.org', 'example.com'],
    //         },
    //     ]);
    // }, [identity]);

    const handleClick = useCallback(async(event) => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        setData([]);
        setText('');
        try {
            for await (let result of stats(identity)) {
                setProgressValue(result.progressValue);
                setProgressMax(result.progressMax);
                setData(result.rows);
                setText(JSON.stringify(result.rows, null, 2));
            }
        } catch(error) {
            setText(error);
        } finally {
            setBusy(false);
            setProgressValue(undefined);
            setProgressMax(undefined);
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
            ${busy && html`<progress value=${progressValue} max=${progressMax} />`}
            <${RoomListFilterer} data=${data} />
            <textarea readonly value=${text} />
        </main>
        <${NetworkLog} />
    `;
}
