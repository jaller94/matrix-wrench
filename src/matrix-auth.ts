/**
 * Gets an access token by logging in with a password.
 */

export async function loginWithPassword(serverAddress: string, user: string, password: string): Promise<Record<string, unknown>> {
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
    return await resp.json();
}
