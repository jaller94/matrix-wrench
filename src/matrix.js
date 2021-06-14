/**
 * Get the members of a room.
 * @param {object} identity
 * @param {string} roomId
 * @returns {object}
 */
export async function getMembers(identity, roomId, type, stateKey) {
    let url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/members`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
    if (!response.ok) {
        console.warn(response);
        throw Error('Request failed');
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
        throw Error('Request failed');
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
        throw Error('Request failed');
    }
    return await response.json();
}
