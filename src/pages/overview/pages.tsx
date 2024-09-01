import React, { FC, useMemo } from 'react';
import { Identity } from '../../app';

export const OverviewPages: FC<{
    identity: Identity,
    filterString: string,
}> = ({ identity, filterString }) => {
    const links = useMemo(() => [
        { url: `#/${encodeURIComponent(identity.name)}/room-list`, name: 'Your rooms' },
        { url: `#/${encodeURIComponent(identity.name)}/contact-list`, name: 'Your contacts' },
        // { url: `#/${encodeURIComponent(identity.name)}/user-inspector`, name: 'User inspector' },
        { url: `#/${encodeURIComponent(identity.name)}/appservice`, name: 'AppService API' },
        { url: `#/${encodeURIComponent(identity.name)}/mass-joiner`, name: 'Mass Joiner (AppService API)' },
        // { url: `#/${encodeURIComponent(identity.name)}/polychat`, name: 'Polychat' },
    ], [identity]);

    const filteredLinks = useMemo(() => {
        if (!filterString) {
            return links;
        }
        return links.filter(link => link.name.includes(filterString));
    }, [links, filterString]);

    return (
        <ul>
            {filteredLinks.map(link => (
                <li key={link.url}>
                    <a href={link.url}>{link.name}</a>
                </li>
            ))}
        </ul>
    );
};
