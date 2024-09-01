import React, { ChangeEventHandler, FC, useCallback, useEffect, useState } from 'react';
import {
    getJoinedRooms,
} from '../matrix';
import { Identity } from '../app';

type RoomsInputProps = {
    identity: Identity,
    onChange: (rooms: string[]) => void,
};

export const RoomsInput: FC<RoomsInputProps> = ({identity, onChange}) => {
    const [value, setValue] = useState('');
    const [valid, setValid] = useState(0);
    const [joinedRooms, setJoinedRooms] = useState<string[]>([]);

    useEffect(() => {
        const fetchJoinedRooms = async () => {
            const joinedRooms = (await getJoinedRooms(identity)).joined_rooms;
            setJoinedRooms(joinedRooms);
            onChange(joinedRooms);
        }
        fetchJoinedRooms();
    }, [identity]);

    const handleChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(event => {
        const {value} = event.target;
        setValue(value);
        const userIds = [...value.matchAll(/!\S+/g)].map(userId => userId[0]);
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
};
