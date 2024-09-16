import { FC, FormEventHandler, useCallback, useEffect, useState } from "react";
import { HighUpLabelInput } from "../../components/inputs";
import React from "react";

export const GeolocationTextInput: FC<{
    onChange: (uri: string, ts: number) => void,
}> = ({ onChange }) => {
    const [geoUri, setGeoUri] = useState(`geo:22.615,120.2975;u=20`);
    
    useEffect(() => {
        onChange(geoUri, Date.now());
    }, []);

    const handleSubmit: FormEventHandler = useCallback((event) => {
        event.preventDefault();
        if (!/^geo:-?\d{1,3}(\.\d+)?,-?\d{1,3}(\.\d+)?(;u=\d+(\.)?)?$/.test(geoUri)) {
            alert('Invalid geo uri');
            return;
        }
        onChange(geoUri, Date.now());
    }, [geoUri, onChange]);
    
    return <form
        onSubmit={handleSubmit}
    >
        <HighUpLabelInput
            label="geo"
            pattern="^geo:-?\\d{1,3}(\\.\\d+)?,-?\\d{1,3}(\\.\\d+)?(;u=\\d+(\\.\\d+)?)?$"
            required
            value={geoUri}
            onChange={useCallback(event => setGeoUri(event.target.value), [])}
        />
        <button type="button">
            Update
        </button>
    </form>;
};
