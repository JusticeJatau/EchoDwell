import "dotenv/config";
import http from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { enforceSubscriptionAccess } from "./services/subscriptionService.js";

const port = process.env.PORT || 5000;
await connectDB();
await enforceSubscriptionAccess();
setInterval(
  () => enforceSubscriptionAccess().catch(console.error),
  60 * 60 * 1000,
).unref();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL?.split(",") || "http://localhost:5173",
    credentials: true,
  },
});
io.on("connection", (socket) => {
  socket.on("conversation:join", (id) => socket.join(`conversation:${id}`));
  socket.on("message:sent", ({ conversationId, message }) =>
    io.to(`conversation:${conversationId}`).emit("message:new", message),
  );
});
server.listen(port, () => console.log(`EchoDwell API running on port ${port}`));
