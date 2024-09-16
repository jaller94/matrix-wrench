import React, { FC, useMemo } from 'react';
import { Identity } from '../../app';

export const OverviewPages: FC<{
    identity: Identity,
    filterString: string,
}> = ({ identity, filterString }) => {
    const links = useMemo(() => [
        { url: `#/${encodeURIComponent(identity.name)}/room-list`, name: 'List your rooms' },
        { url: `#/${encodeURIComponent(identity.name)}/contact-list`, name: 'List your DM contacts' },
        // { url: `#/${encodeURIComponent(identity.name)}/user-inspector`, name: 'User inspector' },
        { url: `#/${encodeURIComponent(identity.name)}/appservice`, name: 'AppService API' },
        { url: `#/${encodeURIComponent(identity.name)}/mass-joiner`, name: 'Mass Joiner (AppService API)' },
        // { url: `#/${encodeURIComponent(identity.name)}/polychat`, name: 'Polychat' },

        // Room links
        { name: 'Bulk invite', note: 'room page → "Other pages"' },
        { name: 'Bulk kick', note: 'room page → "Other pages"' },
        { name: 'Mass joiner (AppService API)', note: 'room page → "Other pages"' },
        { name: 'Live location sharing', note: 'room page → "Other pages"' },
        { name: 'Export room to JSON', note: 'room page → "Other pages"' },
        { name: 'Knock, join, leave or forget a room', note: 'room page' },
        { name: 'Invite, kick, ban or unban a room member', note: 'room page' },
        { name: 'List room members', note: 'room page' },
        { name: 'View and edit room state', note: 'room page' },
        { name: 'Send a message', note: 'room page' },
        { name: 'Upgrade a room', note: 'room page' },
        { name: 'Make someone a room admin (Synapse Admin API)', note: 'room page' },
        { name: 'Delete a room (Synapse Admin API)', note: 'room page' },
        { name: 'Delete a space recursively (Synapse Admin API)', note: 'room page' },
        { name: 'List media in a room (Synapse Admin API)', note: 'room page' },
    ], [identity]);

    const filteredLinks = useMemo(() => {
        if (!filterString) {
            return links;
        }
        const loweredFilterString = filterString.toLocaleLowerCase();
        return links.filter(link => link.name.toLocaleLowerCase().includes(loweredFilterString));
    }, [links, filterString]);

    return (
        <ul>
            {filteredLinks.map(link => (link.url ? (
                <li key={link.url}>
                    <a href={link.url}>{link.name}</a>
                </li>
            ) : (
                <li key={link.name}>{link.name}{link.note ? ` (${link.note})` : ''}</li>
            )))}
        </ul>
    );
};
