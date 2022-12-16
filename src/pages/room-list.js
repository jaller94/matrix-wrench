import { html, useCallback, useMemo, useState } from '../node_modules/htm/preact/standalone.module.js';
import { AppHeader } from '../components/header.js';
import { RoomListFilterer } from '../components/table.js';
import { NetworkLog } from '../index.js';

import {
    getAccountData,
    getJoinedMembers,
    getJoinedRooms,
    whoAmI,
    getState,
} from '../matrix.js';

// const fakeData = [
//     {
//         roomId: '!abc:matrix.org',
//         name: 'User Meetup',
//         roomVersion: '6',
//         joinRule: 'invite',
//         guestAccess: 'public',
//         historyVisibility: 'world_readable',
//         joinedMembersCount: 156,
//         joinedHomeServers: ['matrix.org', 'example.org'],
//         joinedDirectContacts: ['@test:matrix.org', '@test:example.org'],
//     },
//     {
//         roomId: '!xyz:matrix.org',
//         name: 'Manjaro User Group',
//         roomVersion: '6',
//         joinRule: 'public',
//         guestAccess: 'public',
//         historyVisibility: 'world_readable',
//         joinedMembersCount: 10232,
//         joinedHomeServers: ['matrix.org', 'example.org', 'example.com'],
//         joinedDirectContacts: ['@test:example.com', '@test:matrix.org', '@test:example.org'],
//     },
//     {
//         roomId: '!efg:matrix.org',
//         joinRule: 'invite',
//         historyVisibility: 'invited',
//         joinedMembersCount: 1,
//         joinedHomeServers: ['matrix.org'],
//     },
//     {
//         roomId: '!cde:matrix.org',
//         roomVersion: '1',
//         joinRule: 'restricted',
//         historyVisibility: 'invited',
//         joinedMembersCount: 19,
//         joinedHomeServers: ['matrix.org', 'example.org', 'example.com'],
//     },
//     {
//         roomId: '!thx:matrix.org',
//         name: 'Matrix Berlin Space',
//         roomVersion: '9',
//         type: 'm.space',
//         joinRule: 'restricted',
//         guestAccess: 'forbidden',
//         historyVisibility: 'shared',
//         joinedMembersCount: 236,
//         joinedHomeServers: ['matrix.org', 'example.org', 'example.com'],
//     },
//     {
//         roomId: '!mno:matrix.org',
//         name: 'All German Matrix Spaces',
//         roomVersion: '10',
//         type: 'm.space',
//         joinRule: 'public',
//         guestAccess: 'can_join',
//         historyVisibility: 'world_readable',
//         joinedMembersCount: 4536,
//         joinedHomeServers: ['matrix.org', 'example.org', 'example.com'],
//     },
// ];

async function roomToObject(identity, roomId, myUserId) {
    const data = {};
    try {
        const state = await getState(identity, roomId);

        const roomCreateState = state.find(e => e.type === 'm.room.create' && e.state_key === '')?.content;
        if (typeof roomCreateState === 'object' && ['undefined', 'string'].includes(typeof roomCreateState.type)) {
            data.type = roomCreateState?.type;
        } else {
            data.roomVersion = '!invalid!';
        }
        if (typeof roomCreateState === 'object' && ['undefined', 'string'].includes(typeof roomCreateState.room_version)) {
            data.roomVersion = roomCreateState?.room_version  ?? '1';
        } else {
            data.roomVersion = '!invalid!';
        }
        
        const roomPowerLevelState = state.find(e => e.type === 'm.room.power_levels' && e.state_key === '')?.content;
        if (typeof roomPowerLevelState.users === 'object') {
            data.highestCustomPowerLevel = Math.max(...Object.values(roomPowerLevelState.users));
            data.myPowerLevel = roomPowerLevelState.users[myUserId] ?? roomPowerLevelState.users_default;
            data.defaultPowerLevel = roomPowerLevelState.users_default;
            data.canIBan = data.myPowerLevel >= roomPowerLevelState.ban;
            data.canIKick = data.myPowerLevel >= roomPowerLevelState.kick;
            data.canIInvite = data.myPowerLevel >= roomPowerLevelState.invite;
            data.canIRedact = data.myPowerLevel >= roomPowerLevelState.redact;
        }

        const tombstoneState = state.find(e => e.type === 'm.room.tombstone' && e.state_key === '')?.content;
        if (typeof tombstoneState?.body === 'string') {
            data.tombstoneBody = tombstoneState?.body;
        }
        if (typeof tombstoneState?.replacement_room === 'string') {
            data.tombstoneReplacementRoom = tombstoneState?.replacement_room;
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
    const myMatrixId = (await whoAmI(identity)).user_id;
    const mDirectContent = await getAccountData(identity, myMatrixId, 'm.direct');
    yield {
        rows,
    };
    let progressValue = 0;
    for (const roomId of joinedRooms) {
        try {
            const roomInfo = await roomToObject(identity, roomId, myMatrixId);
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

export function RoomListPage({identity}) {
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState([]);
    const [progressValue, setProgressValue] = useState(undefined);
    const [progressMax, setProgressMax] = useState(undefined);
    const [text, setText] = useState('');

    const columns = useMemo(() => [
        {
            Header: 'ID',
            accessor: 'roomId',
        },
        {
            Header: 'Name',
            accessor: 'name',
        },
        // {
        //     Header: 'Highest PL',
        //     accessor: 'highestCustomPowerLevel',
        // },
        {
            Header: 'My PL',
            accessor: 'myPowerLevel',
        },
        {
            Header: 'Replaced?',
            accessor: 'tombstoneReplacementRoom',
        },
        {
            Header: 'Members',
            accessor: 'joinedMembersCount',
        },
        {
            Header: 'Direct contacts',
            accessor: 'joinedDirectContacts.length',
        },
        {
            Header: 'Type',
            accessor: 'type',
        },
        {
            Header: 'Join Rule',
            accessor: 'joinRule',
        },
        {
            Header: 'History Visibility',
            accessor: 'historyVisibility',
        },
        // {
        //     Header: 'Guest Access',
        //     accessor: 'guestAccess',
        // },
        // {
        //     Header: 'Version',
        //     accessor: 'roomVersion',
        // },
        // {
        //     Header: 'Home servers',
        //     accessor: 'joinedHomeServers.length',
        // },
    ], []);

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
        // setData(fakeData);
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
            <${RoomListFilterer} columns=${columns} data=${data} primaryAccessor="roomId" />
            <textarea readonly value=${text} />
        </main>
        <${NetworkLog} />
    `;
}
