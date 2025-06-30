import React, { ChangeEventHandler, FC, useCallback, useEffect, useRef, useState } from 'react';
import { AppHeader } from '../../components/header';
import { Identity, NetworkLog } from '../../app';

import {
    sendEvent,
    setState,
    whoAmI,
} from '../../matrix';
import { GeolocationTextInput } from './geolocation-text-input';
import { GeolocationApiWatcher } from './geolocation-api-watcher';
import { GeolocationGpxReplayer } from './geolocation-gpx-replayer';

/**
 * @returns resolves to the event ID that represents the event
 */
function updateBeaconState(
    identity: Identity,
    roomId: string,
    matrixUserId: string,
    enabled = true,
    beaconInfo = {},
    timeout = 1 * 60 * 60 * 1000,
) {
    const content = {
        ...beaconInfo,
        live: enabled,
        timeout, // how long from the last event until we consider the beacon inactive in milliseconds
        'org.matrix.msc3488.ts': Date.now(), // creation timestamp of the beacon on the client
        'org.matrix.msc3488.asset': {
            'type': 'm.self' // the type of asset being tracked as per MSC3488
        }
    };
    return setState(identity, roomId, 'org.matrix.msc3672.beacon_info', matrixUserId, content);
}

/**
 * Posts an event in the room to update the beacon's data.
 * @returns resolves to the event ID that represents the event
 */
function postBeaconData(
    identity: Identity,
    roomId: string,
    beaconEventId: string,
    locationUri: string,
    timestamp: number,
) {
    const content = {
        'm.relates_to': { // from MSC2674: https://github.com/matrix-org/matrix-doc/pull/2674
            'rel_type': 'm.reference', // from MSC3267: https://github.com/matrix-org/matrix-doc/pull/3267
            'event_id': beaconEventId,
        },
        'org.matrix.msc3488.location': {
            uri: locationUri,
            // description: 'Arbitrary beacon information'
        },
        'org.matrix.msc3488.ts': timestamp,
    };
    return sendEvent(identity, roomId, 'org.matrix.msc3672.beacon', content);
}

export const LocationInput: FC<{
    onChange: (location?: {geoUri: string, ts: number}) => void,
}> = ({ onChange }) => {
    const [inputMethod, setInputMethod] = useState('text');
    const [geoUri, setGeoUri] = useState('');

    const handleChange = useCallback((geoUri: string, ts: number) => {
        setGeoUri(geoUri);
        onChange({geoUri, ts});
    }, [onChange]);

    const handleMethodChange = useCallback((method: string) => {
        setInputMethod(method);
        // Reset location when switching the input method
        setGeoUri('');
        onChange();
    }, [onChange]);
    
    return <>
        <span>Current location: {geoUri}</span>
        <h2>Input method</h2>
        <div role="tablist">
            <button
                role="tab"
                type="button"
                onClick={useCallback(() => handleMethodChange('text'), [])}
            >Static location</button>
            <button
                role="tab"
                type="button"
                onClick={useCallback(() => handleMethodChange('geolocation'), [])}
            >Browser&apos;s Geolocation API</button>
            <button
                role="tab"
                type="button"
                onClick={useCallback(() => handleMethodChange('gpx'), [])}
            >GPX file</button>
        </div>
        <div className="card">
            {inputMethod === 'text' && <GeolocationTextInput onChange={handleChange} />}
            {inputMethod === 'geolocation' && <GeolocationApiWatcher onChange={handleChange} />}
            {inputMethod === 'gpx' && <GeolocationGpxReplayer onChange={handleChange} />}
        </div>
    </>;
};

export const LiveLocationSharingPage: FC<{
    identity: Identity,
    roomId: string,
}> = ({identity, roomId}) => {
    const location = useRef<{geoUri: string, ts: number} | null>(null);
    const [sharing, setSharing] = useState(false);
    const [sharingExpiry, setSharingExpiry] = useState<number | undefined>();
    const [matrixUserId, setMatrixUserId] = useState('');
    const [beaconEventId, setBeaconEventId] = useState('');
    const [lastLocation, setLastLocation] = useState('');
    const [frequency, setFrequency] = useState(10000);

    useEffect(() => {
        async function func() {
            const myMatrixId = (await whoAmI(identity)).user_id;
            setMatrixUserId(myMatrixId);
        }
        func();
    }, []);

    useEffect(() => {
        if (sharing && !beaconEventId) {
            setBeaconEventId('start');
            const expiryDuration = 1 * 60 * 60 * 1000;
            setSharingExpiry(Date.now() + expiryDuration);
            const func = async() => {
                const res = await updateBeaconState(identity, roomId, matrixUserId, true, undefined, expiryDuration);
                setBeaconEventId(res.event_id);
            };
            func();
        } else if (!sharing && beaconEventId) {
            if (beaconEventId !== 'start') {
                updateBeaconState(identity, roomId, matrixUserId, false);
            }
            setBeaconEventId('');
            setSharingExpiry(undefined);
        }
    }, [beaconEventId, sharing]);

    useEffect(() => {
        if (sharingExpiry === undefined) {
            return;
        }
        const timeout = setTimeout(() => {
            setSharing(false);
        }, Math.max(0, sharingExpiry - Date.now()));
        return () => clearTimeout(timeout);
    }, [sharingExpiry]);
    
    useEffect(() => {
        if (!beaconEventId || beaconEventId === 'start') {
            return;
        }
        if (location.current) {
            postBeaconData(identity, roomId, beaconEventId, location.current.geoUri, location.current.ts);
            setLastLocation(location.current.geoUri);
        }
        const interval = setInterval(() => {
            if (!location.current) {
                return;
            }
            postBeaconData(identity, roomId, beaconEventId, location.current.geoUri, location.current.ts);
            setLastLocation(location.current.geoUri);
        }, frequency);
        return () => {
            clearInterval(interval);
        };
    }, [beaconEventId]);

    const handleLocationChange = useCallback((loc?: {geoUri: string, ts: number}) => {
        location.current = loc ?? null;
    }, []);

    const handleFrequencyChange: ChangeEventHandler<HTMLSelectElement> = useCallback((event) => {
        setFrequency(Number.parseInt(event.target.value));
    }, []);

    return <>
        <AppHeader
            backUrl={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}
        >Live Location Sharing</AppHeader>
        <main>
            <div className="card">
                <p>Sharing: {sharing ? 'yes' : 'no'}{sharingExpiry && ` (until ${new Date(sharingExpiry).toLocaleTimeString()})`}</p>
                <p>Last sent event: {lastLocation}</p>
                <label>
                    Event frequency:
                    <select
                        disabled={sharing}
                        value={frequency}
                        onChange={handleFrequencyChange}
                    >
                        <option value="2000">every 2 seconds</option>
                        <option value="5000">every 5 seconds</option>
                        <option value="10000">every 10 seconds</option>
                        <option value="20000">every 20 seconds</option>
                        <option value="30000">every 30 seconds</option>
                        <option value="60000">every minute</option>
                    </select>
                </label>
                <div>
                    <button
                        disabled={!matrixUserId || sharing}
                        type="button"
                        onClick={useCallback(() => setSharing(true), [])}
                    >Start</button>
                    <button
                        disabled={!sharing}
                        type="button"
                        onClick={useCallback(() => setSharing(false), [])}
                    >Stop</button>
                </div>
            </div>
            <LocationInput onChange={handleLocationChange} />
        </main>
        <NetworkLog />
    </>;
}
