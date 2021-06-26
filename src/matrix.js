/**
 * Forget about a room.
 * @param {object} identity
 * @param {string} roomId
 * @returns {Promise<object>}
 */
export async function forgetRoom(identity, roomId) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/forget`;
    const response = await fetch(url, {
        method: 'POST',
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
 * Gets a list of joined members of a room.
 * @param {object} identity
 * @param {string} roomId
 * @returns {Promise<{joined: Record<string, object>}>}
 */
export async function getJoinedMembers(identity, roomId) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/joined_members`;
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
 * Returns a list of the user's current rooms.
 * @param {object} identity
 * @returns {Promise<{joined_rooms: string[]}>}
 */
export async function getJoinedRooms(identity) {
    const url = `${identity.serverAddress}/_matrix/client/r0/joined_rooms`;
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
 * Get the members of a room.
 * @param {object} identity
 * @param {string} roomId
 * @returns {Promise<object>}
 */
export async function getMembers(identity, roomId) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/members`;
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
 * @returns {Promise<object>}
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
 * Get the state of a room.
 * @param {object} identity
 * @param {string} roomId
 * @returns {Promise<object>}
 */
export async function inviteUser(identity, roomId, userId) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/invite`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
        }),
    });
    if (!response.ok) {
        console.warn(response);
        throw Error(`Request failed: ${(await response.json()).error}`);
    }
    return await response.json();
}

/**
 * Join a room.
 * @param {object} identity
 * @param {string} roomId
 * @returns {Promise<object>}
 */
export async function joinRoom(identity, roomId) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/join`;
    const response = await fetch(url, {
        method: 'POST',
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
 * Leave a room.
 * @param {object} identity
 * @param {string} roomId
 * @returns {Promise<object>}
 */
export async function leaveRoom(identity, roomId) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/leave`;
    const response = await fetch(url, {
        method: 'POST',
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
        throw Error(`Request failed: ${(await response.json()).error}`);
    }
    return await response.json();
}

/**
 * Send an event to a room.
 * @param {object} identity
 * @param {string} roomId
 * @param {string} type
 * @param {object} content
 * @param {string=} transactionId
 * @returns {Promise<object>}
 */
export async function sendEvent(identity, roomId, type, content, transactionId) {
    let url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/send/${type}`;
    if (transactionId) {
        url += `/${transactionId}`;
    }
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
            'Content-Type': 'application/json',
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
 * Set the state of a room.
 * @param {object} identity
 * @param {string} roomId
 * @param {string} type
 * @param {string?} stateKey
 * @param {object} content
 * @returns {Promise<object>}
 */
export async function setState(identity, roomId, type, stateKey, content) {
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
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
    });
    if (!response.ok) {
        console.warn(response);
        throw Error(`Request failed: ${(await response.json()).error}`);
    }
    return await response.json();
}
