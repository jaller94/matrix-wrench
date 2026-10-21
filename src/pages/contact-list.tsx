import React, { FC, MouseEventHandler, useCallback, useMemo, useState } from 'react';
import { AppHeader } from '../components/header.tsx';
import { RoomListFilterer } from '../components/table.tsx';
import { Identity, NetworkLog } from '../app.tsx';

import {
    getAccountData,
    getJoinedMembers,
    getJoinedRooms,
} from '../matrix.ts';

async function *stats(identity: Identity) {
    const mDirectContent = await getAccountData(identity, undefined, 'm.direct');
    const contactUserIds = Object.keys(mDirectContent);
    let rows: {
        userId: string,
        sharedRooms: string[],
        names: string[],
    }[] = contactUserIds.map(userId => ({userId, sharedRooms: [], names: []}));
    yield {
        rows,
    };
    const joinedRooms = (await getJoinedRooms(identity)).joined_rooms;
    let progressValue = 0;
    for (const roomId of joinedRooms) {
        try {
            const joinedMembers = new Map(Object.entries((await getJoinedMembers(identity, roomId)).joined));
            if (!rows.some(user => joinedMembers.has(user.userId))) {
                continue;
            }
            rows = rows.map(user => {
                const contactInThisRoom = joinedMembers.get(user.userId);
                if (!contactInThisRoom) {
                    return user;
                }
                let names = user.names;
                if (typeof contactInThisRoom.display_name === 'string' && !names.includes(contactInThisRoom.display_name)) {
                    names = [...names, contactInThisRoom.display_name];
                }
                return {
                    ...user,
                    sharedRooms: [...user.sharedRooms, roomId],
                    names,
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
            console.error(error);
            setText(error instanceof Error ? error.message : 'An error occurred');
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
            accessor: 'sharedRooms.length',
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
