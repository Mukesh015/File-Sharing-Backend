import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

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

/* =============================
   App Setup
============================= */

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

/* =============================
   In-Memory Room Store
============================= */

const rooms: Record<string, User[]> = {};

/* =============================
   Socket Logic
============================= */

io.on("connection", (socket: Socket) => {
  console.log("Connected:", socket.id);

  /* ===== Join Room ===== */

  socket.on("join-room", ({ roomId, userName }: JoinRoomPayload) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    const user: User = {
      socketId: socket.id,
      userName,
    };

    rooms[roomId].push(user);

    const existingUsers = rooms[roomId].filter(
      (u) => u.socketId !== socket.id
    );

    socket.emit("existing-users", existingUsers);

    socket.to(roomId).emit("user-joined", user);

    console.log(`Room ${roomId} users:`, rooms[roomId].length);
  });

  /* ===== Offer ===== */

  socket.on("offer", ({ target, offer }: OfferPayload) => {
    io.to(target).emit("offer", {
      sender: socket.id,
      offer,
    });
  });

  /* ===== Answer ===== */

  socket.on("answer", ({ target, answer }: AnswerPayload) => {
    io.to(target).emit("answer", {
      sender: socket.id,
      answer,
    });
  });

  /* ===== ICE Candidate ===== */

  socket.on(
    "ice-candidate",
    ({ target, candidate }: IceCandidatePayload) => {
      io.to(target).emit("ice-candidate", {
        sender: socket.id,
        candidate,
      });
    }
  );

  socket.on("kick-user", ({ target }) => {
    console.log(`Kick requested for ${target}`);

    const targetSocket = io.sockets.sockets.get(target);

    if (!targetSocket) return;

    // Tell target they were kicked
    targetSocket.emit("kicked");

    // Force disconnect
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

/* =============================
   Start Server
============================= */

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on port ${PORT}`);
});