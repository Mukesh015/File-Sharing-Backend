import { Server, Socket } from "socket.io";
import { AppDataSource } from "../config/data-source";
import { Room } from "../entities/Room";

/* =============================
   Types
============================= */

interface User {
    socketId: string;
    userName: string;
}

interface JoinRoomPayload {
    roomId: string;
    userName: string;
}

interface OfferPayload {
    target: string;
    offer: any;
}

interface AnswerPayload {
    target: string;
    answer: any;
}

interface IceCandidatePayload {
    target: string;
    candidate: any;
}

interface FileMetaPayload {
    roomId: string;
    meta: {
        fileId: string;
        fileName: string;
        size: number;
        mimeType: string;
        owner: string;
    };
}

/* =============================
   In-Memory Store
============================= */

const rooms: Record<string, User[]> = {};

/* =============================
   Setup Socket
============================= */


let io: Server;

export const initSocket = (server: any): Server => {
    io = new Server(server, {
        cors: { origin: "*" },
    });

    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};

export const setupSocket = (io: Server) => {
    io.on("connection", (socket: Socket) => {

        socket.on("join-room", async ({ roomId, userName }: JoinRoomPayload) => {

            console.log("JOIN REQUEST", roomId, userName);

            if (!rooms[roomId]) {
                rooms[roomId] = [];
            }

            const roomUsers = rooms[roomId];

            const normalized = userName.trim().toLowerCase();

            const existingIndex = roomUsers.findIndex(
                u => u.userName.trim().toLowerCase() === normalized
            );

            if (existingIndex !== -1) {
                const existingUser = roomUsers[existingIndex];

                const oldSocket = io.sockets.sockets.get(existingUser.socketId);

                if (oldSocket) {
                    socket.emit("name-taken");
                    return;
                }

                console.log("♻️ Removing stale user:", existingUser);
                roomUsers.splice(existingIndex, 1);
            }

            socket.join(roomId);

            const user: User = {
                socketId: socket.id,
                userName,
            };

            roomUsers.push(user);

            const existingUsers = roomUsers.filter(
                u => u.socketId !== socket.id
            );

            socket.emit("existing-users", existingUsers);
            socket.to(roomId).emit("user-joined", user);

            const roomRepo = AppDataSource.getRepository(Room);

            const dbRoom = await roomRepo.findOne({
                where: { id: roomId },
                relations: ["files"],
            });

            if (dbRoom?.files) {
                socket.emit("existing-files", dbRoom.files);
            }

            console.log(`Room ${roomId} users:`, roomUsers.length);
        });
        /* ===== WebRTC Signaling ===== */

        socket.on("offer", ({ target, offer }: OfferPayload) => {
            io.to(target).emit("offer", {
                sender: socket.id,
                offer,
            });
        });

        socket.on("answer", ({ target, answer }: AnswerPayload) => {
            io.to(target).emit("answer", {
                sender: socket.id,
                answer,
            });
        });

        socket.on("ice-candidate", ({ target, candidate }: IceCandidatePayload) => {
            io.to(target).emit("ice-candidate", {
                sender: socket.id,
                candidate,
            });
        });

        /* ===== Kick User ===== */

        socket.on("kick-user", ({ target }) => {
            const targetSocket = io.sockets.sockets.get(target);
            if (!targetSocket) return;

            targetSocket.emit("kicked");
            targetSocket.disconnect(true);
        });

        socket.on("delete-room", async ({ roomId }) => {
            console.log("🔥 Deleting room:", roomId);

            // 1️⃣ Notify all users
            io.to(roomId).emit("room-deleted");

            // 2️⃣ Disconnect all sockets in room
            const clients = await io.in(roomId).fetchSockets();

            for (const client of clients) {
                client.leave(roomId);
            }

            // 3️⃣ Remove from memory
            delete rooms[roomId];

            // 4️⃣ Delete from DB
            const roomRepo = AppDataSource.getRepository(Room);
            await roomRepo.delete({ id: roomId });

            console.log("Room deleted successfully");
        });

        socket.on("disconnect", () => {
            console.log("Disconnected:", socket.id);

            for (const roomId in rooms) {
                const room = rooms[roomId];

                const exists = room.find((u) => u.socketId === socket.id);
                if (!exists) continue;

                rooms[roomId] = room.filter(
                    (u) => u.socketId !== socket.id
                );

                socket.to(roomId).emit("user-left", socket.id);

                if (rooms[roomId].length === 0) {
                    delete rooms[roomId];
                }
            }
        });
    });
};