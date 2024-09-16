import React, { FC, useCallback, useEffect, useState } from "react";

export const GeolocationApiWatcher: FC<{
    onChange: (uri: string, ts: number) => void,
}> = ({ onChange }) => {
    const [watching, setWatching] = useState(false);

    useEffect(() => {
        if (!('geolocation' in navigator) || !watching) {
            return;
        }
        const watchID = navigator.geolocation.watchPosition((position) => {
            const uri = `geo:${position.coords.latitude},${position.coords.longitude};u=${position.coords.accuracy}`;
            onChange(uri, position.timestamp);
        });
        return () => {
            navigator.geolocation.clearWatch(watchID);
        };
    }, [watching]);
    
    return <>
        {!('geolocation' in navigator) && <p>Your browser doesn&apos;t seem to support the Geolocation API.</p>}
        <button
            disabled={!('geolocation' in navigator) || watching}
            type="button"
            onClick={useCallback(() => setWatching(true), [])}
        >Start</button>
        <button
            disabled={!watching}
            type="button"
            onClick={useCallback(() => setWatching(false), [])}
        >Stop</button>
    </>;
};
