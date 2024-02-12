import { html, useCallback, useContext, useState } from '../../node_modules/htm/preact/standalone.module.js';
import { AppHeader } from '../../components/header.js';
import { NetworkLog, Settings } from '../../index.js';

import {
    createRoom,
} from '../../matrix.js';
import { HighUpLabelInput } from '../../components/inputs.js';
import { RoomLink } from '../../components/room-link.js';
import { PolychatExistingRooms } from './existing-rooms.js';

export const PolychatStateEventType = {
    room: 'de.polychat.room',
    participant: 'de.polychat.room.participant',
};

export function PolychatPage({ identity }) {
    const { externalMatrixUrl } = useContext(Settings);
    const [busy, setBusy] = useState(false);
    const [mainRoomId, setMainRoomId] = useState('');
    const [subRoomId, setSubRoomId] = useState('');
    const [network, setNetwork] = useState('');
    const [error, setError] = useState(null);

    const handleCreateMainRoom = useCallback(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        setMainRoomId('');
        try {
            const data = await createRoom(identity, {
                name: 'Main room',
                initial_state: [
                    {
                        type: PolychatStateEventType.room,
                        content: {
                            type: 'main',
                            network,
                        },
                    },
                ]
            });
            setMainRoomId(data.room_id);
        } catch (error) {
            setError(error.message);
        } finally {
            setBusy(false);
        }
    }, [identity, network]);

    const handleCreateSubRoom = useCallback(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        setSubRoomId('');
        try {
            const data = await createRoom(identity, {
                name: 'Sub room',
                initial_state: [
                    {
                        type: PolychatStateEventType.room,
                        content: {
                            type: 'sub',
                            network,
                        },
                    },
                ],
            });
            setSubRoomId(data.room_id);
        } catch (error) {
            setError(error.message);
        } finally {
            setBusy(false);
        }
    }, [identity, network]);


    const handleNetworkChange = useCallback(async (event) => {
        setNetwork(event.target.value);
    }, []);

    return html`
        <${AppHeader}
            backUrl=${`#/${encodeURIComponent(identity.name)}`}
        >Polychat</>
        <main>
            <div class="card">
                <fieldset disabled=${busy}>
                    <h2>Create main room</h2>
                    <div>
                        <button
                            disabled=${busy}
                            type="button"
                            onclick=${handleCreateMainRoom}
                        >Create Main Room</button>
                    </div>
                    ${mainRoomId && html`
                        <div>
                            <${RoomLink} identity=${identity} roomId=${mainRoomId} />
                            <a
                                href=${`${externalMatrixUrl}${encodeURIComponent(mainRoomId)}`}
                                rel="noopener noreferrer"
                                target="_blank"
                                title="Open room externally"
                            >
                                <img alt="" src="./assets/external-link.svg" />
                            </a>
                        </div>
                    `}
                    <hr/>
                    <h2>Create unclaimed sub room</h2>
                    <div>
                        <${HighUpLabelInput}
                            label="Network (signal, telegram, whatsapp)"
                            value=${network}
                            onChange=${handleNetworkChange}
                        />
                    </div>
                    <div>
                        <button
                            type="button"
                            onclick=${handleCreateSubRoom}
                        >Create unclaimed Sub Room</button>
                    </div>
                    ${subRoomId && html`
                        <div>
                            <${RoomLink} identity=${identity} roomId=${subRoomId} />
                            <a
                                href=${`${externalMatrixUrl}${encodeURIComponent(subRoomId)}`}
                                rel="noopener noreferrer"
                                target="_blank"
                                title="Open room externally"
                            >
                                <img alt="" src="./assets/external-link.svg" />
                            </a>
                        </div>
                    `}
                </fieldset>
                ${error && html`
                    <p>Error: ${error}</p>
                `}
            </div>
            <${PolychatExistingRooms} identity=${identity} />
        </main>
        <${NetworkLog} />
    `;
}
