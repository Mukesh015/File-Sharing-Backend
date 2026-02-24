import express from "express";
import cors from "cors";
import roomRoutes from "./routes/room.routes";
import fileRoutes from "./routes/file.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/rooms", roomRoutes);
app.use("/api/files", fileRoutes);