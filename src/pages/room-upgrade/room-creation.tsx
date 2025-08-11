import React, { FC, FormEventHandler, useCallback, useState } from 'react';
import { Identity } from '../../app';
import {
    createRoom,
} from '../../matrix';
import { HighUpLabelInput } from '../../components/inputs';

export const RoomCreation: FC<{
    identity: Identity,
    roomId: string,
    onRoomCreated: (replacementRoomId: string) => void,
    replacementRoom: string,
}> = ({identity, roomId, onRoomCreated, replacementRoom}) => {
    const [roomVersion, setRoomVersion] = useState('');
    const [additionalCreatorsString, setAdditionalCreatorsString] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
    }, []);
    
    const roomVersionBefore12 = !!roomVersion && parseInt(roomVersion) < 12;

    const handleRoomCreation = useCallback(async () => {
        setBusy(true);
        try {
            // Parse additional creators if room version supports it (>= 12)
            let additional_creators: string[] | undefined;
            if (!roomVersionBefore12) {
                additional_creators = additionalCreatorsString.split(/[\s,;]/);
                additional_creators = additional_creators.map(additional_creators => additional_creators.trim());
                const userIdRegExp = /^@.*:/;
                additional_creators = additional_creators.filter(userId => userIdRegExp.test(userId));
            }
            
            const replacementRoom = (await createRoom(identity, {
                creation_content: {
                    ...(additional_creators && {additional_creators}),
                    predecessor: {
                        room_id: roomId,
                    },
                },
                ...(roomVersion && {room_version: roomVersion}),
            })).room_id;
            onRoomCreated(replacementRoom);
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [identity, roomId, roomVersion, additionalCreatorsString, onRoomCreated]);

    return (
        <div className="card">
            <h2>Room Creation</h2>
            <form onSubmit={handleSubmit}><fieldset disabled={busy}>
                <div>
                    <HighUpLabelInput
                        label="Room version"
                        title="The room version for the new room (e.g., 11, 12)"
                        value={roomVersion}
                        onInput={useCallback(({target}) => setRoomVersion(target.value), [])}
                    />
                </div>
                <div>
                    <label>Additional creators (separated by spaces, new lines, commas or semi-colons)
                        <textarea
                            disabled={busy || roomVersionBefore12}
                            value={additionalCreatorsString}
                            onInput={useCallback(({ target }) => setAdditionalCreatorsString(target.value), [])}
                        />
                    </label>
                    {roomVersion && parseInt(roomVersion) < 12 && (
                        <p style={{fontSize: '0.9em', color: '#888'}}>
                            Additional creators were introduced in room version 12. This field is disabled for version {roomVersion}.
                        </p>
                    )}
                </div>
                <button disabled={busy} type="button" onClick={handleRoomCreation}>Create new room</button>
            </fieldset></form>
            {replacementRoom && (
                <div>
                    <HighUpLabelInput
                        label="Replacement room"
                        pattern="!.+"
                        title="A room id"
                        value={replacementRoom}
                        readOnly
                    />
                </div>
            )}
        </div>
    );
};