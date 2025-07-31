import React, { FC, Fragment, MouseEventHandler, useCallback, useState } from 'react';
import { AppHeader } from '../components/header.tsx';
import { Identity, NetworkLog } from '../app.tsx';

import {
    yieldHierachy,
} from '../matrix.js';

function populateRoomChildren(root: object, rooms: object[]) {
    for (const roomInfo of root.childrenInfo) {
        const room = rooms.find(r => r.id === roomInfo.id) ?? roomInfo;
        root.children = root.children ?? [];
        root.children.push(room);
        if (room.childrenInfo) {
            populateRoomChildren(room, rooms);
        }
    }
}

function convertRoomsToHierarchyTree(rawRooms: object[]) {
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

const SpaceViewer: FC<{ identity: Identity, rooms: object[] }> = ({identity, rooms}) => {
    return <ul>
        {rooms.map(room => <Fragment key={room.id}>
            <li>
                <a href={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(room.id)}}`}>{room.name ?? room.id}</a>
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
    const [data, setData] = useState<object[] | undefined>();
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
            {busy && <progress aria-label="Space loading…"/>}
            {text && <p>{text}</p>}
            {data && <SpaceViewer identity={identity} rooms={data} />}
        </main>
        <NetworkLog />
    </>;
};
