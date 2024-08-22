import React, { FC } from 'react';
import { Identity } from '../app';

type RoomsLinkProps = {
    identity: Identity,
    roomId: string,
};

export const RoomLink: FC<RoomsLinkProps> = ({ identity, roomId }) => {
    return <a href={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}>{roomId}</a>;
};
