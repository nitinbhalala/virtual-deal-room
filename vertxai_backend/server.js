import app from "./src/app.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { setupSocket } from "./src/service/socket.service.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

// Create HTTP server from Express app
const server = createServer(app);

// Attach Socket.io
setupSocket(server); // ✅ Setup socket with the created server

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
