import React, { FC, MouseEventHandler, useCallback } from 'react';

type AppHeaderProps = {
    backLabel?: string,
    backUrl?: string,
    children: string,
};

export const AppHeader: FC<AppHeaderProps> = ({backLabel = 'Back', backUrl, children}) => {
    return (
        <header className="app-header">
            {typeof backUrl === 'string' && (
                <a
                    aria-label={backLabel}
                    className="app-header_back button"
                    href={backUrl}
                    title={backLabel}
                >{'<'}</a>
            )}
            <h1 className="app-header_label">{children}</h1>
            <nav className="app-header_nav">
                <a href="#about">About</a>
                <a href="#settings">Settings</a>
            </nav>
        </header>
    );
};
