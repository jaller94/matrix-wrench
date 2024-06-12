import {
    html,
    useCallback,
    useState,
} from 'htm/preact/standalone.module.js';

export function MoreInfoTooltip({children}) {
    const [open, setOpen] = useState(false);

    const handleClick = useCallback(() => {
        setOpen(value => !value);
    }, []);

    return html`
        <span class="tooltip-container">
            <button type="button" aria-label="more info" onClick=${handleClick}>i</button>
            <span role="status">
                ${open && html`
                    <span class="toggletip-bubble">${children}</span>
                `}
            </span>
        </span>
    `;
}
