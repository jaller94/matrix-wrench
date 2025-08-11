import React, { FC, FormEventHandler, useCallback, useState } from 'react';
import { AppHeader } from '../../components/header';
import { Identity, NetworkLog } from '../../app';
import { RoomCreation } from './room-creation';
import { RoomState } from './room-state';

import {
    getMembers,
    inviteUser,
    setState,
    whoAmI,
} from '../../matrix';
import { HighUpLabelInput } from '../../components/inputs';
import { memberEventsToGroups } from '../../helper';


const RoomUpgradeActions: FC<{
    identity: Identity,
    replacementRoom: string,
    roomId: string,
    handleReplacementRoomChange: (roomId: string) => void
}> = ({identity, roomId, replacementRoom, handleReplacementRoomChange}) => {
    const [busy, setBusy] = useState(false);
    const [failedInvites, setFailedInvites] = useState<string[] | undefined>();

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleInviteMembers = useCallback(async () => {
        setBusy(true);
        try {
            const data = await getMembers(identity, roomId);
            const groups = memberEventsToGroups(data.chunk);
            const myMatrixId = (await whoAmI(identity)).user_id;
            const toInvite = (groups?.get('join') ?? []).map(m => m.state_key).filter(u => u !== myMatrixId);
            for (const userId of toInvite) {
                try {
                    await inviteUser(identity, replacementRoom, userId);
                } catch (err) {
                    console.warn(`Failed to invite user ${userId} to room ${replacementRoom}`, err);
                    setFailedInvites(v => v === undefined ? [ userId ] : [ ...v, userId ]);
                }
            }
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [replacementRoom, identity, roomId]);

    const handleTombstone = useCallback(async () => {
        setBusy(true);
        try {
            await setState(identity, roomId, 'm.room.tombstone', '', {
                replacement_room: replacementRoom,
            });
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [replacementRoom, identity, roomId]);

    return (
        <div className="card">
            <h2>Room Migration Actions</h2>
            <form onSubmit={handleSubmit}><fieldset disabled={busy}>
                <ol>
                    <li>
                        <HighUpLabelInput
                            label="Replacement room"
                            pattern="!.+"
                            title="A room id"
                            value={replacementRoom}
                            onInput={useCallback(({target}) => handleReplacementRoomChange(target.value), [])}
                        />
                    </li>
                    <li><button disabled={busy || !replacementRoom} type="button" onClick={handleInviteMembers}>Invite members</button></li>
                    <li><button disabled={busy || !replacementRoom} type="button" onClick={handleTombstone}>Create tombstone</button></li>
                </ol>
            </fieldset></form>
            {failedInvites && (<>
                <h4>Failed invites ({failedInvites.length})</h4>
                <ul>
                    {failedInvites.map(userId => <li key={userId}>{userId}</li>)}
                </ul>
            </>)}
        </div>
    );
};

export const AdvancedRoomUpgradePage: FC<{
    identity: Identity,
    roomId: string,
}> = ({identity, roomId}) => {
    const [replacementRoom, setReplacementRoom] = useState('');
    
    return <>
        <AppHeader
            backUrl={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}
        >Advanced Room Upgrade</AppHeader>
        <main>
            <p>This page is experimental and still in progress on 2025-08-11. Try it with a test room first.</p>
            <RoomState 
                identity={identity} 
                roomId={roomId}
            />
            <RoomCreation 
                identity={identity} 
                roomId={roomId}
                onRoomCreated={setReplacementRoom}
                replacementRoom={replacementRoom}
            />
            <RoomUpgradeActions 
                identity={identity} 
                roomId={roomId}
                replacementRoom={replacementRoom}
                handleReplacementRoomChange={setReplacementRoom}
            />
        </main>
        <NetworkLog />
    </>;
}
