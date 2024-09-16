import React, { ChangeEventHandler, FC, useCallback, useEffect, useMemo, useState } from 'react';

function humanDuration(duration: number): string {
    if (duration < 10 * 1000) {
        return `${duration} ms`;
    }
    if (duration < 100 * 1000) {
        return `${Math.floor(duration / 1000)} s`;
    }
    if (duration < 100 * 60 * 1000) {
        return `${Math.floor(duration / (60 * 1000))} m`;
    }
    if (duration < 100 * 60 * 60 * 1000) {
        return `${Math.floor(duration / (60 * 60 * 1000))} h`;
    }
    return `${Math.floor(duration / (24 * 60 * 60 * 1000))} d`;
}

export const GeolocationGpxReplayer: FC<{
    onChange: (uri: string, ts: number) => void,
}> = ({ onChange }) => {
    // State to store the uploaded GPX file
    const [gpxFile, setGpxFile] = useState<File | null>(null);
    const [gpxFileText, setGpxFileText] = useState('');

    // Function to handle file input change
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Check if file exists
        if (file) {
            // Ensure the file is a GPX file based on file type or extension
            if (file.type === 'application/gpx+xml' || file.name.endsWith('.gpx')) {
                setGpxFile(file);
                file.text().then(text => setGpxFileText(text));
            } else {
                alert('Please upload a valid GPX file');
            }
        }
    };

    const a = useMemo(() => {
        if (!gpxFileText) {
            return;
        }
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(gpxFileText, "text/xml");
        const points = xmlDoc.getElementsByTagName('trkpt');
        const map = new Map<number, string>();
        let startTime;
        let endTime = 0;
        for (const point of Array.from(points)) {
            const timeNode = point.getElementsByTagName('time')[0];
            const time = Date.parse(timeNode?.innerHTML ?? '');
            if (!Number.isFinite(time)) {
                console.warn('Skipped GPX point because the time could not be parsed', point, timeNode, time);
                continue;
            }
            if (startTime === undefined) {
                startTime = time;
            }
            const lat = point.getAttribute('lat');
            const lon = point.getAttribute('lon');
            const geoUri = `geo:${lat},${lon}`;
            map.set(time - startTime, geoUri);
            endTime = time;
        }
        if (map.size === 0 || startTime === undefined) {
            return;
        }
        return {
            endTime,
            map,
            startTime,
        };
    }, [gpxFileText]);

    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        if (!playing || !a) {
            return;
        }
        const interval = setInterval(() => {
            setCurrentTime(time => {
                const newTime = time + 1000;
                const currentLocation = [...a.map.entries()].findLast(([key]) => key <= newTime);
                if (currentLocation) {
                    setTimeout(() => onChange(currentLocation[1], Date.now()), 0);
                }
                return newTime;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [playing, a, onChange]);

    const handleChange: ChangeEventHandler = useCallback((event) => {
        setCurrentTime(Number.parseInt(event.target.value));
    }, []);

    return (
        <>
            <input
                type="file"
                accept=".gpx"
                onChange={handleFileChange}
            />
            {a && (<>
                <p>Points: {a.map.size}</p>
                <p>Duration: {humanDuration(a.endTime - a.startTime)}</p>
                <input
                    type="range"
                    min="0"
                    max={a.endTime - a.startTime}
                    readOnly
                    style={{ width: '100%' }}
                    value={currentTime}
                    onChange={handleChange}
                />
                <div>
                <button
                    disabled={playing}
                    type="button"
                    onClick={() => setPlaying(true)}
                >Start</button>
                <button
                    disabled={!playing}
                    type="button"
                    onClick={() => setPlaying(false)}
                >Stop</button>
                </div>
            </>)}
        </>
    );
};
