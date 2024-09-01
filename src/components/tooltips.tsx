import React, {
    FC,
    PropsWithChildren,
    useCallback,
    useState,
} from 'react';

export const MoreInfoTooltip: FC<PropsWithChildren> = ({children}) => {
    const [open, setOpen] = useState(false);

    const handleClick = useCallback(() => {
        setOpen(value => !value);
    }, []);

    return (
        <span className="tooltip-container">
            <button type="button" aria-label="more info" onClick={handleClick}>i</button>
            <span role="status">
                {open && (
                    <span className="toggletip-bubble">{children}</span>
                )}
            </span>
        </span>
    );
}
