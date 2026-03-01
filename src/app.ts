import express from "express";
import cors from "cors";
import roomRoutes from "./routes/room.routes";
import fileRoutes from "./routes/file.routes";
import chatRoutes from "./routes/chat.routes";
import reactionRoutes from "./routes/reaction.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/rooms", roomRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/reactions", reactionRoutes);