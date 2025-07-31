import React, { FC, MouseEventHandler, useCallback, useMemo, useState } from 'react';
import { AppHeader } from '../components/header';
import { RoomListFilterer } from '../components/table';
import { Identity, NetworkLog } from '../app';

import {
    getAccountData,
    getJoinedMembers,
    getJoinedRooms,
    whoAmI,
    getState,
} from '../matrix';
import { z } from 'zod';

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

const stateValidators = {
    'm.room.create': z.looseObject({
        creator: z.string().optional(),
        'm.federate': z.boolean().optional(),
        predecessor: z.looseObject({
            event_id: z.string(),
            room_id: z.string(),
        }).optional(),
        room_version: z.string().optional(),
        type: z.string().optional(),
    }),
} as const;

async function roomToObject(identity: Identity, roomId: string, myUserId: string) {
    const data: {
        type?: string,
        roomVersion: string,
    } = {
        type: '!invalid!',
        roomVersion: '!invalid!',
    };
    try {
        const state = await getState(identity, roomId);

        const roomCreateState = stateValidators['m.room.create'].safeParse(state.find(e => e.type === 'm.room.create' && e.state_key === '')?.content);
        if (roomCreateState.success) {
            data.type = roomCreateState.data.type;
            data.roomVersion = roomCreateState.data.room_version  ?? '1';
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

        const encryptionState = state.find(e => e.type === 'm.room.encryption' && e.state_key === '')?.content;
        data.encryption = 'false';
        if (typeof encryptionState?.algorithm === 'string') {
            data.encryption = 'true';
            data.encryptionAlgorithm = encryptionState?.algorithm;
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
        const avatarUrl = state.find(e => e.type === 'm.room.avatar' && e.state_key === '')?.content?.url;
        if (typeof avatarUrl === 'string') {
            data.avatarUrl = avatarUrl;
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
    } catch (err) {
        console.warn('Error in roomToObject', err, roomId);
    }
    return data;
}

const roomIdToDmUserId = (mDirectContent: object, roomId: string) => {
    for (const [userId, roomIds] of Object.entries(mDirectContent)) {
        if (roomIds.includes(roomId)) {
            return userId;
        }
    }
};

function getHomeServers(userIds: string[]): string[] {
    const set = new Set<string>();
    for (const userId of userIds) {
        set.add(userId.slice(userId.indexOf(':') + 1));
    }
    return [...set];
}

async function roomMemberStats(identity: Identity, roomId: string, mDirectContent: object) {
    const joinedMembers = Object.keys((await getJoinedMembers(identity, roomId)).joined);
    return {
        isDirect: roomIdToDmUserId(mDirectContent, roomId) !== undefined,
        joinedMembers,
        joinedMembersCount: joinedMembers.length,
        joinedHomeServers: getHomeServers(joinedMembers),
        joinedDirectContacts: joinedMembers.filter(userId => userId in mDirectContent),
    };
}

async function optionalAccountData(identity: Identity, myMatrixId: string, type: string) {
    try {
        return await getAccountData(identity, myMatrixId, type);
    } catch (error) {
        if (error instanceof Error && error.message === 'Account data not found') {
            return {};
        }
        throw error;
    }
}

async function *stats(identity) {
    const joinedRooms = (await getJoinedRooms(identity)).joined_rooms;
    let rows = joinedRooms.map(roomId => ({roomId}));
    const myMatrixId = (await whoAmI(identity)).user_id;
    const mDirectContent = await optionalAccountData(identity, myMatrixId, 'm.direct');
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

type RoomListPageProps = {
    identity: Identity,
};

export const RoomListPage: FC<RoomListPageProps> = ({ identity }) => {
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState([]);
    const [progressValue, setProgressValue] = useState<number | undefined>(undefined);
    const [progressMax, setProgressMax] = useState<number | undefined>(undefined);
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
            Header: 'Encrypted?',
            accessor: 'encryption',
        },
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

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(async(event) => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        setData([]);
        setText('');
        try {
            for await (const result of stats(identity)) {
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

    return <>
        <AppHeader
            backUrl={`#/${encodeURIComponent(identity.name)}`}
        >Room List</AppHeader>
        <main>
            <div>
                This feature has not been optimised. It fetches the entire room state of every joined room.
            </div>
            <button
                disabled={busy}
                type="button"
                onClick={handleClick}
            >Start fetching</button>
            {busy && <progress value={progressValue} max={progressMax} />}
            <RoomListFilterer columns={columns} data={data} primaryAccessor="roomId" />
            <label>
                Data as JSON (read-only)
                <textarea readOnly value={text} />
            </label>
        </main>
        <NetworkLog />
    </>;
};
