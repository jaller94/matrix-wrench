import React, { FC, Fragment, MouseEventHandler, useCallback, useState } from 'react';
import { AppHeader } from '../components/header.tsx';
import { NetworkLog } from '../app.tsx';

import {
    getState,
    yieldHierachy,
} from '../matrix.js';

function populateRoomChildren(root, rooms) {
    for (const roomInfo of root.childrenInfo) {
        const room = rooms.find(r => r.id === roomInfo.id) ?? roomInfo;
        root.children = root.children ?? [];
        root.children.push(room);
        if (room.childrenInfo) {
            populateRoomChildren(room, rooms);
        }
    }
}

function convertRoomsToHierarchyTree(rawRooms) {
    if (rawRooms.length === 0) {
        return [];
    }
    console.log('rawRooms', rawRooms);
    const rooms = rawRooms.map(r => ({
        id: r.room_id,
        name: r.name,
        joinRule: r.join_rule,
        childrenInfo: r.children_state.map(r => ({
            id: r.state_key,
        })),
    }));
    const root = rooms.shift();
    populateRoomChildren(root, rooms);
    return [root];
}

function SpaceViewer({identity, rooms}) {
    return <ul>
        {rooms.map(room => <Fragment key={room.id}>
            <li>
                <a href={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(room.id)}}`}>${room.name ?? room.id}</a>
            </li>
            {room.children && <SpaceViewer key={room.id} identity={identity} rooms={room.children} />}
        </Fragment>)}
    </ul>;
}

type SpaceManagementPageProps = {
    identity: object,
    roomId: string,
};

export const SpaceManagementPage: FC<SpaceManagementPageProps> = ({identity, roomId}) => {
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState<object | undefined>();
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
            setText(error);
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
            {text && <p>{text}</p>}
            {data && <SpaceViewer identity={identity} rooms={data} />}
        </main>
        <NetworkLog />
    </>;
};

type SpaceManagementStatePageProps = {
    identity: object,
    roomId: string,
};
/*
 * Unused alternative to SpaceManagementPage using a room state query.
 */
export const SpaceManagementStatePage: FC<SpaceManagementStatePageProps> = ({identity, roomId}) => {
    const [rooms, setRooms] = useState<unknown[] | null>(null);

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

    return <>
        <AppHeader
            backUrl={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}
        >Space Management</AppHeader>
        <main>
            <button
                type="button"
                onClick={handleQuery}
            >Query</button>
            {rooms && <SpaceViewer identity={identity} rooms={rooms} />}
        </main>
        <NetworkLog />
    </>;
}
