import "reflect-metadata";
import http from "http";
import dotenv from "dotenv";

import { app } from "./app";
import { AppDataSource } from "./config/data-source";
import { setupSocket } from "./socket/socket";
import { initSocket } from "./socket/socket";

dotenv.config();

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

// 🔥 Initialize socket properly
const io = initSocket(server);

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected");

    setupSocket(io);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err: any) => {
    console.error("❌ DB connection error:", err);
  });