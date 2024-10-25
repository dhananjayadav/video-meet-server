const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Enable CORS for both Express and Socket.IO
let allowedOrigins = ["https://videomeetingweb.netlify.app", "http://localhost:3000"];

app.use(cors({ origin: allowedOrigins }));

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
  },
});

app.get("/", (req: any, res: any) => {
  console.log("server get api executed")
  res.send("Server running")
})

// Handle Socket.IO connections
io.on("connection", (socket: any) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("join-room", (roomId: any) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", socket.id);

    // When a client sends an offer
    socket.on("offer", ({ offer, to }: any) => {
      socket.to(to).emit("offer", { offer, from: socket.id });
    });

    // When a client sends an answer
    socket.on("answer", ({ answer, to }: any) => {
      socket.to(to).emit("answer", { answer, from: socket.id });
    });

    // When a client sends an ICE candidate
    socket.on("ice-candidate", ({ candidate, to }: any) => {
      socket.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    // When a client disconnects
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", socket.id);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
