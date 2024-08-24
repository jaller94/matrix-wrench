import React, { FC, MouseEventHandler, useCallback } from 'react';

type AppHeaderProps = {
    backLabel?: string,
    backUrl?: string,
    children: string,
    onBack?: MouseEventHandler<HTMLButtonElement>,
};

export const AppHeader: FC<AppHeaderProps> = ({backLabel = 'Back', backUrl, children, onBack}) => {
    const handleBack = useCallback<MouseEventHandler<HTMLButtonElement>>(event => {
        if (backUrl) {
            event.preventDefault();
            event.stopPropagation();
            window.location = backUrl;
        }
        if (onBack) {
            onBack(event);
        }
    }, [backUrl, onBack]);

    return (
        <header className="app-header">
            {(onBack || typeof backUrl === 'string') && (
                <button
                    aria-label={backLabel}
                    className="app-header_back"
                    title={backLabel}
                    type="button"
                    onClick={handleBack}
                >{'<'}</button>
            )}
            <h1 className="app-header_label">{children}</h1>
            <nav className="app-header_nav">
                <a href="#about">About</a>
                <a href="#settings">Settings</a>
            </nav>
        </header>
    );
};
