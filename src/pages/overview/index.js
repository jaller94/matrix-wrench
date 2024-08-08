import { html, useCallback, useState } from 'htm/preact/standalone.module.js';
import { AppHeader } from '../../components/header.js';
import { HighUpLabelInput } from '../../components/inputs.js';
import { OverviewPages } from './pages.js';

export function OverviewPage({ identity }) {
    const [filterString, setFilterString] = useState('');

    const handleFilterStringInput = useCallback((event) => {
        setFilterString(event.target.value);
    }, []);

    return html`
        <${AppHeader}
            backUrl=${`#/${encodeURIComponent(identity.name)}`}
        >Overview</>
        <main>
            <${HighUpLabelInput}
                autoFocus
                label="Filter"
                type="search"
                value=${filterString}
                onInput=${handleFilterStringInput}
            />
            <hr/>
            <${OverviewPages} identity=${identity} filterString=${filterString} />
        </main>
    `;
}
