import React from 'react';

export function RoomLink({ identity, roomId }) {
    return <a href={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}>{roomId}</a>;
}
