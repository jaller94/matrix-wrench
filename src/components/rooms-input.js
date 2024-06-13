import { html, useCallback, useEffect, useState } from 'htm/preact/standalone.module.js';
import {
    getJoinedRooms,
} from '../matrix.js';

export function RoomsInput({identity, onChange}) {
    const [value, setValue] = useState('');
    const [valid, setValid] = useState(0);
    const [joinedRooms, setJoinedRooms] = useState([]);

    useEffect(() => {
        const fetchJoinedRooms = async () => {
            const joinedRooms = (await getJoinedRooms(identity)).joined_rooms;
            setJoinedRooms(joinedRooms);
            onChange(joinedRooms);
        }
        fetchJoinedRooms();
    }, [identity]);

    const handleChange = useCallback(event => {
        const {value} = event.target;
        setValue(value);
        const userIds = [...value.matchAll(/!\S+/g)];
        setValid(userIds.length);
        onChange(value === '' ? joinedRooms : userIds);
    }, [joinedRooms, onChange]);

    return html`
        <label>
            Room IDs (whitespace-separated, leave empty for all joined rooms) (${value === '' ? `${joinedRooms.length} joined rooms` : `${valid} detected`})
            <textarea
                placeholder="All joined rooms"
                value=${value}
                oninput=${handleChange}
                const roomIdToDmUserId = (mDirectContent, roomId) => {
                    for (const [userId, roomIds] of Object.entries(mDirectContent)) {
                        if (roomIds.includes(roomId)) {
                            return userId;
                        }
                    }
                };
                
                async function optionalAccountData(...params) {
                    try {
                        return await getAccountData(...params);
                    } catch (error) {
                        if (error.message === 'Account data not found') {
                            return {};
                        }
                        throw error;
                    }
                }
            />
        </label>
    `;    
}
