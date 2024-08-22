import React, { FC } from 'react';

type RoomsLinkProps = {
    identity: string,
    roomId: string,
};

export const RoomLink: FC<RoomsLinkProps> = ({ identity, roomId }) => {
    return <a href={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}>{roomId}</a>;
};
