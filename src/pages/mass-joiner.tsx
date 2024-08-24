import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { AppHeader } from '../components/header';
import { BulkActionTracker, BulkActionForm } from '../components/bulk-actions';
import { Identity, NetworkLog } from '../app';
import {
    getHierachy,
    joinRoom,
} from '../matrix';

const SpaceRoomPicker: FC<{
    identity: Identity,
    roomId: string,
    onChange: (roomIds: string[]) => void,
}> = ({ identity, roomId, onChange }) => {
    const [roomIdsString, setRoomIdsString] = useState(roomId);
    const [queryRunning, setQueryRunning] = useState(false);

    useEffect(() => {
        let roomIds = roomIdsString.split(/[\s,;]/);
        roomIds = roomIds.map(roomIds => roomIds.trim());
        const roomIdRegExp = /^!.+/;
        roomIds = roomIds.filter(roomId => roomIdRegExp.test(roomId));
        onChange(roomIds);
    }, [roomIdsString, onChange]);

    const handleQueryChildSpaces = useCallback(async () => {
        setQueryRunning(true);
        try {
            let { rooms } = await getHierachy(identity, roomId);
            // Remove parent space from the response
            rooms = rooms.filter(room => room.room_id !== roomId);
            setRoomIdsString(str => `${str}\n${rooms.map(room => room.room_id).join('\n')}`);
        } finally {
            setQueryRunning(false);
        }
    }, [identity, roomId]);

    return <>
        <label>
            Room IDs (separated by spaces, new lines, commas or semi-colons)
            <textarea
                value={roomIdsString}
                onInput={useCallback(({ target }) => setRoomIdsString(target.value), [])}
            />
        </label>
        <button
            disabled={queryRunning}
            type="button"
            onClick={handleQueryChildSpaces}
        >Query child Spaces</button>
    </>;
}

const RoomPicker: FC<{
    identity: Identity,
    onChange: (roomIds: string[]) => void,
}> = ({ identity, onChange }) => {
    const [roomIdsString, setRoomIdsString] = useState('');

    useEffect(() => {
        let roomIds = roomIdsString.split(/[\s,;]/);
        roomIds = roomIds.map(roomIds => roomIds.trim());
        const roomIdRegExp = /^!.+/;
        roomIds = roomIds.filter(roomId => roomIdRegExp.test(roomId));
        onChange(roomIds);
    }, [roomIdsString, onChange]);

    return <>
        <label>
            Room IDs (separated by spaces, new lines, commas or semi-colons)
            <textarea
                value={roomIdsString}
                onInput={useCallback(({ target }) => setRoomIdsString(target.value), [])}
            />
        </label>
    </>;
}

export const MassJoinerPage: FC<{
    identity: Identity,
    roomId?: string,
}> = ({ identity, roomId }) => {
    const [roomIds, setRoomIds] = useState<string[]>([]);
    const [userIds, setUserIds] = useState<string[]>([]);

    const handleSubmit = useCallback(({ userIds }: { userIds: string[] }) => {
        setUserIds(userIds);
    }, []);

    const items = useMemo(() => {
        const items = [];
        for (const userId of userIds) {
            const masqueradedIdentity = {
                ...identity,
                masqueradeAs: userId,
            };
            for (const roomId of roomIds) {
                items.push({
                    masqueradedIdentity,
                    roomId,
                });
            }
        }
        return items;
    }, [identity, roomIds, userIds]);

    const action = useCallback(async ({ masqueradedIdentity, roomId }: { masqueradedIdentity: Identity, roomId: string }) => {
        return joinRoom(masqueradedIdentity, roomId);
    }, []);

    return <>
        <AppHeader
            backUrl={roomId ? `#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}` : `#/${encodeURIComponent(identity.name)}`}
        >Mass Joiner</AppHeader>
        <main>
            <p>This <em>experimental</em> page requires an AppService token. On behalf of each user, it will join each room.</p>
            { roomId ? (
                <SpaceRoomPicker identity={identity} roomId={roomId} onChange={setRoomIds} />
            ) : (
                <RoomPicker identity={identity} onChange={setRoomIds} />
            )}
            <BulkActionForm actionLabel="Make users join" onSubmit={handleSubmit} />
            <BulkActionTracker action={action} items={items} />
        </main>
        <NetworkLog />
    </>;
}
