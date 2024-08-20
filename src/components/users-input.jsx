import React, { useCallback, useState } from 'react';

export function UsersInput({onChange}) {
    const [value, setValue] = useState('');
    const [valid, setValid] = useState(0);

    const handleChange = useCallback(event => {
        const {value} = event.target;
        setValue(value);
        const userIds = [...value.matchAll(/@\S+?:\S+/g)];
        setValid(userIds.length);
        onChange(userIds);
    }, []);

    return (
        <label>
            User IDs (whitespace-separated) (${valid} found)
            <textarea
                value={value}
                onInput={handleChange}
            />
        </label>
    );
}
