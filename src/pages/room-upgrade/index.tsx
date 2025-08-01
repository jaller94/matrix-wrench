import React, { FC, FormEventHandler, useCallback, useState } from 'react';
import { AppHeader } from '../../components/header';
import { Identity, NetworkLog } from '../../app';

import {
    createRoom,
    getMembers,
    getState,
    inviteUser,
    sendEvent,
    setState,
    whoAmI,
} from '../../matrix';
import { HighUpLabelInput } from '../../components/inputs';
import { memberEventsToGroups } from '../../helper';

/**
 * Asserts if the current user can tombstone the room.
 */
const assertTombstone = (myMatrixId: string, stateEvents: object[]) => {
    const isTombstoned = stateEvents.some(e => e.type === 'm.room.tombstone' && e.state_key === '');
    if (isTombstoned) {
        throw Error('Room already has a tombstone.');
    }
    const powerLevels = stateEvents.find(e => e.type === 'm.room.power_levels' && e.state_key === '')?.content;
    const tombstoneRequirement = powerLevels.events?.['m.room.tombstone'] ?? powerLevels.events_default;
    const myPowerLevel = powerLevels.users?.[myMatrixId] ?? powerLevels.users_default;
    if (typeof tombstoneRequirement !== 'number') {
        throw Error('Unsure which power level is required for a tombstone.');
    }
    if (typeof myPowerLevel !== 'number') {
        throw Error('Unsure which power level is required for a tombstone.');
    }
    if (myPowerLevel < tombstoneRequirement) {
        throw Error('Insufficient permission to place tombstone.');
    }
};

const RoomUpgradeActions: FC<{identity: Identity, roomId: string}> = ({identity, roomId}) => {
    const [replacementRoom, setReplacementRoom] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleRoomCreation = useCallback(async () => {
        setBusy(true);
        try {
            const stateEvents = await getState(identity, roomId);
            const toMigrate: {
                content: Record<string, unknown>,
                type: string,
                state_key: string,
            }[] = [];
            const myMatrixId = (await whoAmI(identity)).user_id;
            assertTombstone(myMatrixId, stateEvents);
            for (const event of stateEvents) {
                if (['m.room.create', 'm.room.encryption', 'm.room.member', 'm.room.power_levels'].includes(event.type)) {
                    continue;
                }
                toMigrate.push({
                    content: event.content,
                    type: event.type,
                    state_key: event.state_key,
                });
            }
            const powerLevels = stateEvents.find(e => e.type === 'm.room.power_levels' && e.state_key === '')?.content;
            if (!powerLevels) {
                throw Error('No m.room.power_levels state found.');
            }
            console.log(powerLevels);
            console.log(toMigrate);
            const lastEventId = (await sendEvent(identity, roomId, 'm.room.message', {
                msgtype: 'm.text',
                body: 'This room will be replaced.',
            })).event_id;
            console.log(lastEventId);
            const replacementRoom = (await createRoom(identity, {
                creation_content: {
                    // type: roomType,
                    predecessor: {
                        room_id: roomId,
                        event_id: lastEventId,
                    },
                },
                initial_state: toMigrate,
                power_level_content_override: powerLevels,
            })).room_id;
            console.log(replacementRoom);
            // for (const event of toMigrate) {
            //     await setState(identity, replacementRoom, event.type, event.state_key, event.content);
            // }
            setReplacementRoom(replacementRoom);
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [identity, roomId]);

    const handleInviteMembers = useCallback(async () => {
        setBusy(true);
        try {
            const data = await getMembers(identity, roomId);
            const groups = memberEventsToGroups(data.chunk);
            const myMatrixId = (await whoAmI(identity)).user_id;
            const toInvite = (groups.get('join') ?? []).filter(u => u !== myMatrixId && !u.startsWith('@slack_'));
            for (const userId of toInvite) {
                await inviteUser(identity, replacementRoom, userId);
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
        <form onSubmit={handleSubmit}><fieldset disabled={busy}>
            <ol>
                <li>
                    <button disabled={busy} type="button" onClick={handleRoomCreation}>Create new room</button>
                    <HighUpLabelInput
                        label="Replacement room"
                        pattern="!.+"
                        title="A room id"
                        value={replacementRoom}
                        onInput={useCallback(({target}) => setReplacementRoom(target.value), [])}
                    />
                </li>
                <li><button disabled={busy} type="button" onClick={handleInviteMembers}>Invite members</button></li>
                <li><button disabled={busy} type="button" onClick={handleTombstone}>Create tombstone</button></li>
            </ol>
        </fieldset></form>
    );
};

export const AdvancedRoomUpgradePage: FC<{
    identity: Identity,
    roomId: string,
}> = ({identity, roomId}) => {
    return <>
        <AppHeader
            backUrl={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}
        >Advanced Room Upgrade</AppHeader>
        <main>
            <div className="card">
                <RoomUpgradeActions identity={identity} roomId={roomId} />
            </div>
        </main>
        <NetworkLog />
    </>;
}
