import React, { FC, MouseEventHandler, useCallback, useMemo, useState } from 'react';
import { AppHeader } from '../components/header';
import { RoomListFilterer } from '../components/table';
import { Identity, NetworkLog } from '../app';

import {
    getAccountData,
    getJoinedMembers,
    getJoinedRooms,
} from '../matrix';

async function *stats(identity: Identity) {
    const mDirectContent = await getAccountData(identity, null, 'm.direct');
    const contactUserIds = Object.keys(mDirectContent);
    let rows = contactUserIds.map(userId => ({userId}));
    yield {
        rows,
    };
    const joinedRooms = (await getJoinedRooms(identity)).joined_rooms;
    let progressValue = 0;
    for (const roomId of joinedRooms) {
        try {
            const joinedMembers = new Map(Object.entries((await getJoinedMembers(identity, roomId)).joined));
            rows = rows.map(user => {
                const contactInThisRoom = joinedMembers.get(user.userId);
                if (!contactInThisRoom) {
                    return user;
                }
                return {
                    ...user,
                    sharedRooms: (user.sharedRooms ?? new Set()).add(roomId),
                    sharedRoomsCount: (user.sharedRoomsCount ?? 0) + 1,
                    names: (user.names ?? new Set()).add(contactInThisRoom.display_name),
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

export const ContactListPage: FC<{ identity: Identity }> = ({identity}) => {
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState<object[]>([]);
    const [progressValue, setProgressValue] = useState<number | undefined>(undefined);
    const [progressMax, setProgressMax] = useState<number | undefined>(undefined);
    const [text, setText] = useState('');

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
    }, [identity]);

    const columns = useMemo(() => [
        {
            Header: 'User ID',
            accessor: 'userId',
        },
        {
            Header: 'Shared rooms',
            accessor: 'sharedRoomsCount',
        },
        {
            Header: 'Names',
            accessor: 'names[,]',
        },
    ], []);

    return <>
        <AppHeader
            backUrl={`#/${encodeURIComponent(identity.name)}`}
        >Contact List</AppHeader>
        <main>
            <button
                disabled={busy}
                type="button"
                onClick={handleClick}
            >Start fetching</button>
            {busy && <progress value={progressValue} max={progressMax}/>}
            <RoomListFilterer columns={columns} data={data} primaryAccessor="userId" />
            <label>
                Data as JSON (read-only)
                <textarea readOnly value={text} />
            </label>
        </main>
        <NetworkLog />
    </>;
}
