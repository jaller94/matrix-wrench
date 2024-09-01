import { Identity } from "./app";

type MemoryOfIdentity = {
    joinedRooms?: [],
    rooms: Map<string, MemoryOfRoom>,
};

type MemoryOfRoom = {
    stateEvents?: [],
};

const memoryOfIdentities = new Map<Identity, MemoryOfIdentity>();

function getMemoryOfIdentity(identity: Identity): MemoryOfIdentity {
    let memory = memoryOfIdentities.get(identity);
    if (!memory) {
        memory = {
            rooms: new Map(),
        };
        memoryOfIdentities.set(identity, memory);
    }
    return memory;
}

function getMemoryOfRoom(memoryOfIdentity: MemoryOfIdentity, roomId: string): MemoryOfRoom {
    let memory = memoryOfIdentity.rooms.get(roomId);
    if (!memory) {
        memory = {
        };
        memoryOfIdentity.rooms.set(roomId, memory);
    }
    return memory;
}

const useMatrixRoomMemory = (identity: Identity, roomId: string) => {
    const memoryOfIdentity = getMemoryOfIdentity(identity);
    const memoryOfRoom = getMemoryOfRoom(memoryOfIdentity, roomId);
    return memoryOfRoom;
}
