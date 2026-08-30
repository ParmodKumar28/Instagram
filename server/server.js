// Imports
import http from "http";
import app from "./src/app.js";
import connectToDB from "./src/config/db.js";
import { initSocket } from "./src/socket/index.js";

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO instance
initSocket(server);

// Listening to server
const PORT = process.env.PORT || 8000;
server.listen(PORT, async (error) => {
  if (error) {
    console.log(`Error occurred while listening to server: ${error}`);
  } else {
    // Connecting to database
    await connectToDB();
    console.log(`Server is listening on http://localhost:${PORT}`);
  }
});