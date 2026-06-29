import React, { FC, Fragment, MouseEventHandler, useCallback, useState } from 'react';
import * as z from 'zod';
import { AppHeader } from '../components/header.tsx';
import { Identity, NetworkLog } from '../app.tsx';

import {
    yieldHierachy,
} from '../matrix.ts';

type RoomInfo = {
    id: string;
    name?: string;
    joinRule?: string;
    roomType?: string;
    roomVersion?: string;
    children?: RoomInfo[];
    childrenInfo: {
        id: string;
    }[];
};

function populateRoomChildren(root: RoomInfo, rooms: RoomInfo[]) {
    for (const roomInfo of root.childrenInfo) {
        const room = rooms.find(r => r.id === roomInfo.id) ?? {
            ...roomInfo,
            childrenInfo: [],
        };
        root.children = root.children ?? [];
        root.children.push(room);
        if (room.childrenInfo) {
            populateRoomChildren(room, rooms);
        }
    }
}

const zRawRooms = z.array(z.object({
    room_id: z.string(),
    name: z.optional(z.string()),
    join_rule: z.optional(z.string()),
    room_type: z.optional(z.string()),
    room_version: z.optional(z.string()),
    children_state: z.array(z.object({
        state_key: z.string(),
    }))
}));

function convertRoomsToHierarchyTree(rawRooms: object[]) {
    const safeRawRooms = zRawRooms.safeParse(rawRooms);
    if (!safeRawRooms.data) {
        console.log(safeRawRooms.error);
        throw Error('Validation error');
    }
    const rooms = safeRawRooms.data.map(r => ({
        id: r.room_id,
        name: r.name,
        joinRule: r.join_rule,
        roomType: r.room_type,
        roomVersion: r.room_version,
        childrenInfo: r.children_state.map(r => ({
            id: r.state_key,
        })),
    }));
    const root = rooms.shift();
    if (!root) {
        return [];
    }
    populateRoomChildren(root, rooms);
    return [root];
}

const SpaceViewer: FC<{ identity: Identity, rooms: RoomInfo[] }> = ({identity, rooms}) => {
    return <ul>
        {rooms.map(room => <Fragment key={room.id}>
            <li>
                <a href={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(room.id)}}`}>
                    {room.roomType === 'm.space' ? '📁' : '📄'}
                    {room.name ?? room.id}
                </a>
            </li>
            {room.children && <SpaceViewer key={room.id} identity={identity} rooms={room.children} />}
        </Fragment>)}
    </ul>;
}

type SpaceManagementPageProps = {
    identity: Identity,
    roomId: string,
};

export const SpaceManagementPage: FC<SpaceManagementPageProps> = ({identity, roomId}) => {
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState<RoomInfo[] | undefined>();
    const [text, setText] = useState('');

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(async(event) => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        setData([]);
        setText('');
        try {
            for await (const result of yieldHierachy(identity, roomId)) {
                setData(convertRoomsToHierarchyTree(result.rooms));
            }
        } catch(error) {
            console.error(error);
            setText(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setBusy(false);
        }
    }, [identity, roomId]);

    return <>
        <AppHeader
            backUrl={`#/${encodeURIComponent(identity.name)}`}
        >Space Viewer</AppHeader>
        <main>
            <button
                disabled={busy}
                type="button"
                onClick={handleClick}
            >Start fetching</button>
            {busy && <progress aria-label="Space loading…"/>}
            {text && <p>{text}</p>}
            {data && <SpaceViewer identity={identity} rooms={data} />}
        </main>
        <NetworkLog />
    </>;
};
