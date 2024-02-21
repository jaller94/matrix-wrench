import { html, useCallback, useState } from "../node_modules/htm/preact/standalone.module.js";

export function UsersInput({onChange}) {
    const [value, setValue] = useState('');
    const [valid, setValid] = useState(0);

    const handleChange = useCallback(event => {
        const value = event.target.value;
        setValue(value);
        const userIds = [...value.matchAll(/@\S+?:\S+/g)];
        setValid(userIds.length);
        onChange(userIds);
    }, []);

    return html`
        <label>
            User IDs (whitespace-separated) (${valid} found)
            <textarea
                value=${value}
                oninput=${handleChange}
            />
        </label>
    `;    
}