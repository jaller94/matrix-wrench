import { html, useCallback, useState } from 'htm/preact/standalone.module.js';

import {
    getJoinedRooms, getState,
} from '../../matrix.js';
import { RoomLink } from '../../components/room-link.js';

const PolychatStateEventType = {
    room: 'de.polychat.room',
    participant: 'de.polychat.room.participant',
};

export function PolychatExistingRooms({ identity }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState();
    const [mainRooms, setMainRooms] = useState();
    const [unclaimedSubRooms, setUnclaimedSubRooms] = useState();

    const handleFetch = useCallback(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        setMainRooms([]);
        setUnclaimedSubRooms([]);
        try {
            const allRooms = (await getJoinedRooms(identity)).joined_rooms;
            console.log(allRooms);
            for (const roomId of allRooms) {
                const stateEvents = await getState(identity, roomId);
                const roomState = stateEvents.find(event => event.type === PolychatStateEventType.room && event.state_key === '')?.content;
                const tombstoneState = stateEvents.find(event => event.type === 'm.room.tombstone' && event.state_key === '')?.content;
                if (!roomState || tombstoneState.replacement_room) {
                    continue;
                }
                if (roomState.type === 'main') {
                    const roomName = stateEvents.find(event => event.type === 'm.room.name' && event.state_key === '')?.content?.name;
                    setMainRooms(mainRooms => ([
                        ...mainRooms,
                        {
                            mainRoomId: roomId,
                            name: roomName,
                            subRooms: [],
                        }
                    ]));
                } else if (roomState.type === 'sub') {
                    const roomName = stateEvents.find(event => event.type === 'm.room.name' && event.state_key === '')?.content?.name;
                    setUnclaimedSubRooms(subRooms => ([
                        ...subRooms,
                        {
                            roomId,
                            name: roomName,
                            subRooms: [],
                        }
                    ]));
                }
            }
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setBusy(false);
        }
    }, [identity]);

    return html`
        <div class="card">
            <h2>Load existing rooms (Work in progress)</h2>
            <div>
                <button
                    disabled=${busy}
                    type="button"
                    onclick=${handleFetch}
                >Load existing rooms</button>
            </div>
            ${Array.isArray(mainRooms) && html`
                <h3>Main Rooms</h3>
                <ul>
                    ${mainRooms.map(room => html`
                        <li key=${room.mainRoomId}>
                            ${room.name}
                            <${RoomLink} identity=${identity} roomId=${room.mainRoomId}/>
                        </li>
                    `)}
                </ul>
            `}
            ${Array.isArray(unclaimedSubRooms) && html`
                <h3>Unclaimed Sub Rooms</h3>
                <ul>
                    ${unclaimedSubRooms.map(room => html`
                        <li key=${room.roomId}>
                            ${room.name}
                            <${RoomLink} identity=${identity} roomId=${room.roomId}/>
                        </li>
                    `)}
                </ul>
            `}
        </div>
    `;
}
