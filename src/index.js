import { html, render, useState } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { getState, resolveAlias } from './matrix.js';

const IDENTITIES = [];

function IdentityEditor({identity, onAbort, onSave}) {
    const [name, setName] = useState(identity.name ?? '');
    const [serverAddress, setServerAddress] = useState(identity.serverAddress ?? '');
    const [accessToken, setAccessToken] = useState(identity.accessToken ?? '');

    const handleSubmit = event => {
        event.preventDefault();
        event.stopPropagation();
        onSave({name, serverAddress, accessToken});
    };

    return html`
        <h1>Identity Editor</h1>
        <form onsubmit=${handleSubmit}>
            <div><label>Name (just an identifier within this app)
                <input required value=${name} oninput=${({target}) => setName(target.value)}/>
            </label></div>
            <div><label>Server address (e.g. "https://matrix-client.matrix.org")
                <input required value=${serverAddress} oninput=${({target}) => setServerAddress(target.value)}/>
            </label></div>
            <div><label>Access token
                <input required value=${accessToken} oninput=${({target}) => setAccessToken(target.value)}/>
            </label></div>
            <button type="button" onclick=${onAbort}>Abort</button>
            <button type="submit">Save</button>
        </form>
    `;
}

function IdentitySelector({identities, onDelete, onEdit, onSelect}) {
    if (identities.length === 0) {
        return html`<p>No identities entered so far.</p>`;
    }
    return html`
        <ul>
            ${identities.map(identity => {
                return html`<li>
                    <button type="button" onclick=${() => onSelect(identity)}>${identity.name}</button>
                    <button type="button" title="Edit" onclick=${() => onEdit(identity)}>✏️</button>
                    <button type="button" title="Delete" onclick=${() => onDelete(identity)}>❌</button>
                </li>`;
            })}
        </ul>
    `;
}

function AliasResolver({identity}) {
    const [alias, setAlias] = useState('');
    const [busy, setBusy] = useState(false);
    const [roomId, setRoomId] = useState('');

    const handleSubmit = async event => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        try {
            const data = await resolveAlias(identity, alias);
            console.log(data);
            setRoomId(data.room_id);
        } catch {}
        setBusy(false);
    };

    return html`
        <form onsubmit=${handleSubmit}>
            <label>Alias
                <input
                    disabled=${busy}
                    pattern="#.+:.+"
                    required
                    title="A room alias starting with a number sign, e.g. #matrixhq:matrix.org"
                    value=${alias}
                    oninput=${({target}) => setAlias(target.value)}
                />
            </label>
            <button type="submit">Resolve</button>
        </form>
        <label>Room id (read only)
            <input value=${roomId} readonly/>
        </label>
    `;
}


function App() {
    const [identities, setIdentities] = useState(IDENTITIES);
    const [identity, setIdentity] = useState(null);
    const [editedIdentity, setEditedIdentity] = useState(null);

    const handleDelete = (identity) => {
        const confirmed = confirm(`Do you want to remove ${identity.name}?\nThis doesn't invalidate the access token.`);
        if (!confirmed) return;
        const newIdentities = [...identities];
        const index = newIdentities.findIndex(obj => obj.name === identity.name);
        setIdentities(identities.splice(index, 1));
    }

    const handleSave = (identity) => {
        console.log('Save', identity);
        const newIdentities = [...identities];
        const index = newIdentities.findIndex(obj => obj.name === editedIdentity.name);
        if (index === -1) {
            // Add new identity
            newIdentities.push(identity);
            setIdentities(newIdentities);
        } else {
            // Replace existing identity
            newIdentities.splice(index, 1, identity)
            console.log('replace', newIdentities);
            setIdentities(newIdentities);
        }
        setEditedIdentity(null);
    }

    if (editedIdentity) {
        return html`<${IdentityEditor}
            identity=${editedIdentity}
            onAbort=${() => setEditedIdentity(null)}
            onSave=${handleSave}
        />`;
    }
    if (!identity) {
        return html`
            <h1>Select an identity</h1>
            <${IdentitySelector} identities=${identities} onDelete=${handleDelete} onEdit=${setEditedIdentity} onSelect=${setIdentity}/>
            <button type="button" onclick=${() => setEditedIdentity({})}>Add identity</button>
        `;
    }
    return html`
        <h1>Acting as ${identity.name}</h1>
        <button type="button" onclick=${() => setIdentity(null)}>Use different identity</button>
        <h2>Alias -> Room ID</h2>
        <${AliasResolver} identity=${identity}/>
        <h2>State</h2>
        <${StateExplorer} identity=${identity}/>
    `;
}

function StateExplorer({identity}) {
    const [room, setRoom] = useState('');
    const [type, setType] = useState('');
    const [stateKey, setStateKey] = useState('');
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState('');

    const handleGet = async event => {
        event.preventDefault();
        event.stopPropagation();
        if (!type) {
            const answer = confirm('Room states can be REALLY big.\nConfirm, if you don\'t want to filter for a type.');
            if (!answer) return;
        }
        setBusy(true);
        try {
            const data = await getState(identity, room, type || undefined, stateKey || undefined);
            setData(JSON.stringify(data, null, 2));
        } catch {}
        setBusy(false);
    };

    return html`
        <form onsubmit=${handleGet}>
            <label>Room alias or ID
                <input disabled=${busy} pattern="[#!].+:.+" required value=${room} oninput=${({target}) => setRoom(target.value)}/>
            </label>
            <label>Type
                <input disabled=${busy} list="state-types" value=${type} oninput=${({target}) => setType(target.value)}/>
            </label>
            <label>State Key
                <input disabled=${busy} value=${stateKey} oninput=${({target}) => setStateKey(target.value)}/>
            </label>
            <button type="submit">Query</button>
        </form>
        <label>State
            <textarea disabled=${busy}>${data}</textarea>
        </label>
    `;
}

render(html`<${App} />`, document.body);
