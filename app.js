require("dotenv").config();

const express = require("express");
const path = require("path");
const http = require("http");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");
const { Server } = require("socket.io");
const ejsMate = require("ejs-mate");
const MongoStore = require("connect-mongo");

const userRoute = require("./routes/userRoute");
const historyRoute = require("./routes/history");
const workerRoute = require("./routes/workerRoute");
const adminRoute = require("./routes/adminRoute");
const userComplaintRoute = require("./routes/userComplaintRoute");
const adminComplaintRoute = require("./routes/adminComplaintRoute");
const garbageRoute = require("./routes/garbageRoute");
const conversationRoute = require("./routes/conversationRoute");

const Message = require("./models/Message");
const ExpressError = require("./utils/ExpressError");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ======= EJS Setup =======
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ======= Middleware =======
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(cors());

// ======= Debug Helper (to catch double responses) =======
app.use((req, res, next) => {
  const oldSend = res.send;
  res.send = function (...args) {
    if (res.headersSent) {
      console.error(`⚠️ HEADERS ALREADY SENT for route: ${req.originalUrl}`);
    }
    return oldSend.apply(res, args);
  };
  next();
});

// ======= Session Store =======
const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  collectionName: "sessions",
  ttl: 14 * 24 * 60 * 60, // 14 days
});

store.on("error", (err) => console.error("SESSION STORE ERROR:", err));

app.use(
  session({
    secret: process.env.SESSION_SECRET_CODE || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

// ======= Flash & Locals =======
app.use(flash());
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.currentEmployee = req.session.employee || null;
  res.locals.currentAdmin = req.session.admin || null;
  res.locals.success = req.flash("success") || [];
  res.locals.error = req.flash("error") || [];
  next();
});

// ======= MongoDB Connection =======
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Database Successfully Connected"))
  .catch((e) => console.error("❌ Database Connection Error:", e.message));

// ======= Routes =======
app.get("/", (req, res) => {
  return res.render("home", {
    userId: req.session.user?.id || null,
    adminId: req.session.admin?.id || null,
  });
});

app.use("/workers", workerRoute);
app.use("/users", userRoute);
app.use("/complaints/user", userComplaintRoute);
app.use("/complaints/admin", adminComplaintRoute);
app.use("/history", historyRoute);
app.use("/admin", adminRoute);
app.use("/garbage", garbageRoute);
app.use("/conversation", conversationRoute);

// ======= Error Handling =======
app.use((req, res, next) => next(new ExpressError("Page Not Found", 404)));

app.use((err, req, res, next) => {
  if (res.headersSent) {
    console.error(`⚠️ Error after headers sent for: ${req.originalUrl}`);
    return next(err);
  }
  const { statusCode = 500 } = err;
  res.status(statusCode).render("error", { err });
});

// ======= Socket.IO =======
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", ({ userId, conversationId }) => {
    onlineUsers[userId] = socket.id;
    if (conversationId) {
      socket.join(conversationId);
      console.log(`User ${userId} joined room ${conversationId}`);
    }
  });

  socket.on("sendMessage", async (data) => {
    try {
      const { conversationId, senderId, senderModel, receiverId, receiverModel, message } = data;

      const newMessage = await Message.create({
        conversationId,
        sender: senderId,
        senderModel,
        receiver: receiverId,
        receiverModel,
        message,
      });

      const populatedMessage = await Message.findById(newMessage._id).populate("sender", "name");

      io.to(conversationId).emit("receiveMessage", populatedMessage);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  socket.on("disconnect", () => {
    for (const [id, sockId] of Object.entries(onlineUsers)) {
      if (sockId === socket.id) delete onlineUsers[id];
    }
    console.log("User disconnected:", socket.id);
  });
});

// ======= Start Server =======
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
