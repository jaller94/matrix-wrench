/**
 * Gets a list of joined members of a room.
 * @param {object} identity
 * @param {string} roomId
 * @returns {{joined: Record<string, object>}}
 */
export async function getJoinedMembers(identity, roomId) {
    let url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/joined_members`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
    if (!response.ok) {
        console.warn(response);
        throw Error(`Request failed: ${(await response.json()).error}`);
    }
    return await response.json();
}

/**
 * Get the members of a room.
 * @param {object} identity
 * @param {string} roomId
 * @returns {object}
 */
export async function getMembers(identity, roomId) {
    let url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/members`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
    if (!response.ok) {
        console.warn(response);
        throw Error(`Request failed: ${(await response.json()).error}`);
    }
    return await response.json();
}

/**
 * Get the state of a room.
 * @param {object} identity
 * @param {string} roomId
 * @param {string?} type
 * @param {string?} stateKey
 * @returns {object}
 */
export async function getState(identity, roomId, type, stateKey) {
    let url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/state`;
    if (type) {
        url += `/${type}`;
    }
    if (stateKey) {
        url += `/${stateKey}`;
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
    if (!response.ok) {
        console.warn(response);
        throw Error(`Request failed: ${(await response.json()).error}`);
    }
    return await response.json();
}

/**
 * Set the state of a room.
 * @param {object} identity
 * @param {string} roomId
 * @param {string} type
 * @param {string?} stateKey
 * @param {object} body
 * @returns {object}
 */
export async function setState(identity, roomId, type, stateKey, body) {
    let url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/state`;
    if (type) {
        url += `/${type}`;
    }
    if (stateKey) {
        url += `/${stateKey}`;
    }
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        console.warn(response);
        throw Error(`Request failed: ${(await response.json()).error}`);
    }
    return await response.json();
}

/**
 * Send an event to a room.
 * @param {object} identity
 * @param {string} roomId
 * @param {string} type
 * @param {object} body
 * @returns {object}
 */
export async function sendEvent(identity, roomId, type, content, transactionId) {
    let url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/send/${type}/${transactionId}`;
    debugger;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        },
        body: JSON.stringify(content),
    });
    if (!response.ok) {
        console.warn(response);
        throw Error(`Request failed: ${(await response.json()).error}`);
    }
    return await response.json();
}

/**
 * Resolves a room alias to a room ID.
 * @param {object} identity
 * @param {string} roomAlias
 * @returns {{room_id: string, servers: string[]}}
 */
export async function resolveAlias(identity, roomAlias) {
    const url = `${identity.serverAddress}/_matrix/client/r0/directory/room/${encodeURIComponent(roomAlias)}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
    if (!response.ok) {
        console.warn(response);
        throw Error(`Request failed: ${(await response.json()).error}`);
    }
    return await response.json();
}
