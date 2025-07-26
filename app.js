const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const http = require("http");
const socketio = require("socket.io");



const { sequelize } = require("./models");

// 🔌 Initialize App & Server
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  }
});

// 🔐 Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌐 Serve Static Frontend (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// 🧠 Socket.io Real-time Setup
io.on("connection", (socket) => {
  console.log("🟢 New client connected");

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  socket.on("send_message", (data) => {
    const { receiverId, message } = data;
    io.to(receiverId).emit("receive_message", message);
  });

  socket.on("private-message", ({ senderId, receiverId, content }) => {
    io.to(receiverId).emit("private-message", { senderId, content });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected");
  });
});

// 📦 Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/skills", require("./routes/skillRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/ratings", require("./routes/ratingRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

// 🔄 Sync Sequelize & Start Server
sequelize.sync().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
