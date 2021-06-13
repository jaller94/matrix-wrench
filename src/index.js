import { html, render, useState } from 'https://unpkg.com/htm/preact/standalone.module.js';

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
                <input value=${name} oninput=${({target}) => setName(target.value)}/>
            </label></div>
            <div><label>Server address (e.g. "https://matrix-client.matrix.org")
                <input value=${serverAddress} oninput=${({target}) => setServerAddress(target.value)}/>
            </label></div>
            <div><label>Access token
                <input value=${accessToken} oninput=${({target}) => setAccessToken(target.value)}/>
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

function AliasResolver() {
    const [alias, setAlias] = useState('');

    return html`
        <form onsubmit>
            <label>Alias
                <input value=${accessToken} oninput=${(target.value)}/>
            </label>
        </form>
        <button>
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
        <button type="button" onclick=${() => setIdentity(null)}>List rooms</button>
        <${StateInput} />
    `;
}

async function getState(accessToken, roomId, type, stateKey) {
    const response = await fetch(`${serverAddress}/_matrix/client/r0/rooms/${roomId}/state`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    });
    if (!response.ok) {
        console.error('Request failed', response);
        return;
    }
    const data = await response.json();
    console.log(data);
}

function StateInput({type, value}) {
    return html`
        <label>${type}</label>
        <textarea>${value}</textarea>
    `;
}

render(html`<${App} />`, document.body);
