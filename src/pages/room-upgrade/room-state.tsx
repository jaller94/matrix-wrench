import React, { FC, useCallback, useState } from 'react';
import { Identity } from '../../app';
import {
    getState,
} from '../../matrix';
import { memberEventsToGroups } from '../../helper';

interface RoomStateInfo {
    name: string | null;
    memberCount: number;
    joinedMembers: string[];
}

export const RoomState: FC<{
    identity: Identity,
    roomId: string,
}> = ({identity, roomId}) => {
    const [roomState, setRoomState] = useState<RoomStateInfo | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoomState = useCallback(async () => {
        setBusy(true);
        setError(null);
        try {
            // Fetch room state
            const stateEvents = await getState(identity, roomId);

            // Extract room name from state
            const nameEvent = stateEvents.find(e => e.type === 'm.room.name' && e.state_key === '');
            const roomName = nameEvent?.content?.name || null;

            // Process members from state events
            const memberEvents = stateEvents.filter(e => e.type === 'm.room.member');
            const memberGroups = memberEventsToGroups(memberEvents);
            const joinedMembers = (memberGroups?.get('join') || [])
                .map(member => member.state_key);

            setRoomState({
                name: roomName,
                memberCount: (memberGroups?.get('join') || []).length,
                joinedMembers,
            });
        } catch (err) {
            console.error('Failed to fetch room state:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch room state');
        } finally {
            setBusy(false);
        }
    }, [identity, roomId]);

    return (
        <div className="card">
            <h2>Current Room State</h2>
            <button disabled={busy} type="button" onClick={fetchRoomState}>
                Fetch room state
            </button>
            {busy && <progress aria-label="Loading room state..." />}
            {error && <p style={{color: 'red'}}>Error: {error}</p>}
            {roomState && (
                <ul>
                    <li>
                        <strong>Room name:</strong> {roomState.name || <em>No name set</em>}
                    </li>
                    <li>
                        <strong>Total joined members:</strong> {roomState.memberCount}
                    </li>
                    {roomState.joinedMembers.length > 0 && (
                        <li>
                            <strong>Other joined members:</strong>
                            <ul>
                                {roomState.joinedMembers.map(userId => (
                                    <li key={userId}>{userId}</li>
                                ))}
                            </ul>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};