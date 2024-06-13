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
    }, []);

    const handleChange = useCallback(event => {
        const value = event.target.value;
        setValue(value);
        const userIds = [...value.matchAll(/!\S+/g)];
        setValid(userIds.length);
        onChange(value !== '' ? userIds : joinedRooms);
    }, [joinedRooms]);

    return html`
        <label>
            Room IDs (whitespace-separated, leave empty for all joined rooms) (${value === '' ? `${joinedRooms.length} joined rooms` : `${valid} detected`})
            <textarea
                placeholder="All joined rooms"
                value=${value}
                oninput=${handleChange}
            />
        </label>
    `;    
}