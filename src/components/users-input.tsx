import React, { ChangeEventHandler, FC, useCallback, useState } from 'react';

export const UsersInput: FC<{ onChange: (userIds: string[]) => void }> = ({onChange}) => {
    const [value, setValue] = useState('');
    const [valid, setValid] = useState(0);

    const handleChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(event => {
        const {value} = event.target;
        setValue(value);
        const userIds = [...value.matchAll(/@\S+?:\S+/g)].map(userId => userId[0]);
        setValid(userIds.length);
        onChange(userIds);
    }, []);

    return (
        <label>
            User IDs (whitespace-separated) ({valid} found)
            <textarea
                value={value}
                onInput={handleChange}
            />
        </label>
    );
}
