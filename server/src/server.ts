import app from "./app.js";
import { connectDB } from "./db/db.js";
import { env } from "./config/env.js";
import { initSocket } from "./socket/socket.js";
import http from "http";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    // Create one HTTP server so Express routes and Socket.io share the same port.
    const server = http.createServer(app);

    initSocket(server);

    server.listen(env.port, () => {
      console.log(`Server is running on http://localhost:${env.port}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to start server:", message);

    // Exit instead of leaving a half-started server process running.
    process.exit(1);
  }
};
startServer();
export default app;
