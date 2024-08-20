import React, { useCallback, useEffect, useState } from 'react';
import {
    getJoinedRooms,
} from '../matrix';

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

    return (
        <label>
            Room IDs (whitespace-separated, leave empty for all joined rooms) ({value === '' ? `${joinedRooms.length} joined rooms` : `${valid} detected`})
            <textarea
                placeholder="All joined rooms"
                value={value}
                onInput={handleChange}
            />
        </label>
    );
}
