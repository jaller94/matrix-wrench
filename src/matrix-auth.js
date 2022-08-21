/**
 * Gets an access token by logging in with a password.
 * @param {string} serverAddress The base URL of a homeserver
 * @param {string} user A Matrix ID or user name
 * @param {string} password The password of the user
 * @param {{method?: string, body?: string, headers: Record<string, string>}} init
 * @returns {Promise<Record<string, unknown>>}
 */

export async function loginWithPassword(serverAddress, user, password) {
    const resp = await fetch(`${serverAddress}/_matrix/client/v3/login`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'm.login.password',
            identifier: {
              type: 'm.id.user',
              user,
            },
            password,
        }),
    });
    if (!resp.ok) {
        throw Error('Failed to log in.');
    }
    return resp.json();
}
