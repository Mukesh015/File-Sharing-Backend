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
        /* ===== Join Room ===== */

        // socket.on("join-room", async ({ roomId, userName }: JoinRoomPayload) => {
        //     socket.join(roomId);

        //     if (!rooms[roomId]) {
        //         rooms[roomId] = [];
        //     }

        //     const user: User = {
        //         socketId: socket.id,
        //         userName,
        //     };

        //     rooms[roomId].push(user);

        //     const existingUsers = rooms[roomId].filter(
        //         (u) => u.socketId !== socket.id
        //     );

        //     socket.emit("existing-users", existingUsers);
        //     socket.to(roomId).emit("user-joined", user);

        //     /* 🔥 Send existing files from DB */

        //     const roomRepo = AppDataSource.getRepository(Room);

        //     const dbRoom = await roomRepo.findOne({
        //         where: { id: roomId },
        //         relations: ["files"],
        //     });

        //     if (dbRoom?.files) {
        //         socket.emit("existing-files", dbRoom.files);
        //     }

        //     console.log(`Room ${roomId} users:`, rooms[roomId].length);
        // });

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

            // ⭐ replace old socket if same name
            if (existingIndex !== -1) {
                const existingUser = roomUsers[existingIndex];
                console.log("♻️ Replacing existing user:", existingUser);
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

        socket.on(
            "ice-candidate",
            ({ target, candidate }: IceCandidatePayload) => {
                io.to(target).emit("ice-candidate", {
                    sender: socket.id,
                    candidate,
                });
            }
        );

        /* ===== Kick User ===== */

        socket.on("kick-user", ({ target }) => {
            const targetSocket = io.sockets.sockets.get(target);
            if (!targetSocket) return;

            targetSocket.emit("kicked");
            targetSocket.disconnect(true);
        });

        /* ===== Disconnect ===== */

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