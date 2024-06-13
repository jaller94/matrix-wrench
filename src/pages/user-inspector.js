import { html, useCallback, useMemo, useState } from 'htm/preact/standalone.module.js';
import { AppHeader } from '../components/header.js';
import { RoomsInput } from '../components/rooms-input.js';
import { UsersInput } from '../components/users-input.js';
import { RoomListFilterer } from '../components/table.js';
import { NetworkLog } from '../index.js';

import {
    getState,
} from '../matrix.js';

async function roomToObject(identity, roomId, myUserId) {
    const data = {};
    try {
        const state = await getState(identity, roomId);
        
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

        const name = state.find(e => e.type === 'm.room.name' && e.state_key === '')?.content?.name;
        if (typeof name === 'string') {
            data.name = name;
        }
    } catch {}
    return data;
}

/**
 * @param {*} identity
 * @param {string[]} roomIds
 * @param {string[]} userIds
 */
async function *stats(identity, roomIds, userIds) {
    console.log(userIds);
    let rows = roomIds.map(roomId => ({roomId}));
    yield {
        rows,
    };
    let progressValue = 0;
    for (const roomId of roomIds) {
        try {
            const roomInfo = await roomToObject(identity, roomId);
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

export function UserInspectorPage({identity}) {
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState([]);
    const [progressValue, setProgressValue] = useState(undefined);
    const [progressMax, setProgressMax] = useState(undefined);
    const [roomIds, setRoomIds] = useState([]);
    const [userIds, setUserIds] = useState([]);
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

    const handleClick = useCallback(async(event) => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        setData([]);
        setText('');
        try {
            for await (let result of stats(identity, roomIds)) {
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

    return html`
        <${AppHeader}
            backUrl=${`#/${encodeURIComponent(identity.name)}`}
        >User Inspector</>
        <main>
            <div>
                This feature has not been optimised. It fetches the entire room state of every joined room.
            </div>
            <${RoomsInput} identity=${identity} onChange=${setRoomIds} />
            <${UsersInput} onChange=${setUserIds} />
            <button
                disabled=${busy || roomIds.length === 0 || userIds.length === 0}
                type="button"
                onclick=${handleClick}
            >Start fetching</button>
            ${busy && html`<progress value=${progressValue} max=${progressMax} />`}
            <${RoomListFilterer} columns=${columns} data=${data} primaryAccessor="roomId" />
            <label>
                Data as JSON (read-only)
                <textarea readonly value=${text} />
            </label>
        </main>
        <${NetworkLog} />
    `;
}
