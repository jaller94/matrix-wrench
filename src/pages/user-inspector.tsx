import React, { FC, MouseEventHandler, useCallback, useMemo, useState } from 'react';
import { AppHeader } from '../components/header';
import { RoomsInput } from '../components/rooms-input';
import { UsersInput } from '../components/users-input';
import { RoomListFilterer } from '../components/table';
import { Identity, NetworkLog } from '../app';

import {
    getState,
} from '../matrix';

async function roomToObject(identity: Identity, roomId: string, userId: string) {
    const data = {};
    try {
        const state = await getState(identity, roomId);
        
        const roomPowerLevelState = state.find(e => e.type === 'm.room.power_levels' && e.state_key === '')?.content;
        if (typeof roomPowerLevelState.users === 'object') {
            data.highestCustomPowerLevel = Math.max(...Object.values(roomPowerLevelState.users));
            data.userPowerLevel = roomPowerLevelState.users[userId] ?? roomPowerLevelState.users_default;
            data.defaultPowerLevel = roomPowerLevelState.users_default;
            data.canBan = data.defaultPowerLevel >= roomPowerLevelState.ban;
            data.canKick = data.defaultPowerLevel >= roomPowerLevelState.kick;
            data.canInvite = data.defaultPowerLevel >= roomPowerLevelState.invite;
            data.canRedact = data.defaultPowerLevel >= roomPowerLevelState.redact;
        }

        const name = state.find(e => e.type === 'm.room.name' && e.state_key === '')?.content?.name;
        if (typeof name === 'string') {
            data.name = name;
        }
    } catch (err) {
        console.warn('Error in roomToObject', err, roomId);
    }
    return data;
}

async function *stats(identity: Identity, roomIds: string[], userIds: string[]) {
    let rows = roomIds.map(roomId => ({roomId}));
    yield {
        rows,
    };
    let progressValue = 0;
    for (const roomId of roomIds) {
        try {
            // TODO Support more than one user
            const roomInfo = await roomToObject(identity, roomId, userIds[0] ?? '');
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
            progressMax: roomIds.length,
            rows,
        };
    }
}

export const UserInspectorPage: FC<{identity: Identity}> = ({identity}) => {
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState<unknown[]>([]);
    const [progressValue, setProgressValue] = useState<number | undefined>(undefined);
    const [progressMax, setProgressMax] = useState<number | undefined>(undefined);
    const [roomIds, setRoomIds] = useState<string[]>([]);
    const [userIds, setUserIds] = useState<string[]>([]);
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
    ], []);

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(async(event) => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        setData([]);
        setText('');
        try {
            for await (const result of stats(identity, roomIds)) {
                setProgressValue(result.progressValue);
                setProgressMax(result.progressMax);
                setData(result.rows);
                setText(JSON.stringify(result.rows, null, 2));
            }
        } catch(error) {
            setText(String(error));
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
        >User Inspector</AppHeader>
        <main>
            <div>
                This feature has not been optimised. It fetches the entire room state of every joined room.
            </div>
            <RoomsInput identity={identity} onChange={setRoomIds} />
            <UsersInput onChange={setUserIds} />
            <button
                disabled={busy || roomIds.length === 0 || userIds.length === 0}
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
}
