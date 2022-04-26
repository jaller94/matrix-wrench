import { getJoinedMembers, getState, sendEvent, setState } from './matrix.js';

const identity = {
    serverAddress: 'http://localhost:8888',
    accessToken: 'PHY7zhiOSmiFwLeOhogjIDUajpAH1w1HwQLje8I0IGXrXVaoIImiflidzJkgid0N',
};

/*
    1. Skip any rooms which don't have a defined users key, as those are not handle-able.
    2. Skip any rooms that look like the only moderators are bots (e.g. traveller bot, github, etc)
    3. Skip any rooms where the admin(s) are no longer joined to the room.
    4. Skip any room that's a FOSDEM room, we've handled those seperately.
    5. Skip any room where there IS a Matrix admin in the room (we've occasionally given users admin in these rooms)
    6. Give all users in the room that are moderator, admin using the bridge access token.
    7. KDE rooms can be assigned to @kenny:kde.org
    8. It may be worth sending a notice into the room, mentioning the user that was OP-ed.
*/

let completedRooms = [];
try {
    completedRooms = JSON.parse(localStorage.getItem('completedRooms'));
} catch {
    console.error('Failed to load completedRooms');
}

function ignoreUser(userId) {
    return userId.startsWith('@_discord') ||
        userId.startsWith('@telegram_') ||
        userId.includes('appservice') ||
        userId.includes('traveller') ||
        userId.startsWith('@_neb_') ||
        userId.startsWith('@reminder:') ||
        userId.endsWith(':t2bot.io');
}

async function makeAdmin(roomId, userIds) {
    const pl = await getState(identity, roomId, 'm.room.power_levels');

    // 3. Skip any rooms where the admin(s) are no longer joined to the room.
    const membersResponse = await getJoinedMembers(identity, roomId);
    const joinedUsers = Object.keys(membersResponse.joined);
        
    let changed = [];
        
    console.log(`----- room: ${roomId} -----`)
    console.log('joined users', joinedUsers);
    for (const [user, previousValue] of Object.entries(pl.users)) {
        console.log(user, previousValue);
        if (ignoreUser(user)) continue;
        if (previousValue == 100) {
            return `${user} in ${roomId} is already an admin.`;
        }
    }

    for(const userId of userIds) {
        if (!joinedUsers.includes(userId)) {
            console.log(`Wanted to promote ${userId}, however, they are gone.`);
            continue;
        }
        pl.users[userId] = 100;
        changed.push(userId);
    }

    if (changed.length === 0) {
        console.log('Had nothing to change', roomId)
        return;
    }

    console.log('setting', roomId, pl);
    await setState(identity, roomId, 'm.room.power_levels', undefined, pl);
    try {
        await sendEvent(identity, roomId, 'm.room.message',  {
            body: `Made ${changed.map(id => id.substring(1, id.lastIndexOf(':'))).join(', ')} ${changed.length > 1 ? 'admins' : 'an admin'} because they had been ${changed.length > 1 ? 'IRC operators' : 'an IRC operator'}. If you have any questions, please contact support@matrix.org.`,
            msgtype: 'm.notice',
        });
    } catch (error) {
        console.log(error);
    }
}

async function main() {
    let rooms = await (await fetch('data.json')).json();
    // 1. Skip any rooms which don't have a defined users key, as those are not handle-able.
    rooms = rooms.filter(r => !!r.users);
    // Already processed
    rooms = rooms.filter(r => !completedRooms.includes(r.roomId));
    // 4. Skip any room that's a FOSDEM room, we've handled those seperately.
    rooms = rooms.filter(r => !r.ircChannel.startsWith('#fosdem-'));
    // 7. KDE rooms can be assigned to @kenny:kde.org
    rooms.forEach(r => {
        if (/^##?kde/.test(r.ircChannel)) {
            r.users = [['@kenny:kde.org', 50]];
        }
    });
    // Remove certain usernames.
    rooms.forEach(room => {
        room.users = room.users.filter(user => !ignoreUser(user[0]));
    });
    rooms = rooms.filter(r => r.users.length !== 0);
    console.log(rooms.map(r => r.users.map(u => u[0])));

    for (const room of rooms) {
        const users = room.users.map(u => u[0]);
        // const yes = confirm(`${room.roomId}: Make ${users.join(', ')} an admin?`);
        // if (yes) {
            await makeAdmin(room.roomId, users);
        //     localStorage.setItem('completedRooms', JSON.stringify(completedRooms));
        // }
    }
    // console.log('data', rooms);
    // await getMembers(identity, '');
}

main().catch(console.error);
