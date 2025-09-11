require("dotenv").config();

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");
const ejsMate = require("ejs-mate");
const userRoute = require("./routes/userRoute");
const historyRoute = require("./routes/history");
const workerRoute=require("./routes/workerRoute");
const ExpressError = require("./utils/ExpressError");
const adminRoute = require("./routes/adminRoute");
const userComplaintRoute = require("./routes/userComplaintRoute");
const adminComplaintRoute = require("./routes/adminComplaintRoute");
const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET_CODE || "secretcode",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.currentEmployee = req.session.employee || null; 
  res.locals.currentAdmin=req.session.admin||null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
mongoose.set("strictQuery", true);
const mongoDb = process.env.MONGO_URL;
mongoose
  .connect(mongoDb)
  .then(() => console.log("Database Successfully Connected"))
  .catch((e) => console.log("Database Connection Error:", e));

app.get("/", (req, res) => {
  res.render("home",{
    userId: req.session.user?.id || null,
    adminId: req.session.admin?.id || null
  })
})
app.use("/workers",workerRoute);
app.use("/users", userRoute);
app.use("/complaints/user", userComplaintRoute);
app.use("/complaints/admin", adminComplaintRoute);
app.use("/history", historyRoute);
app.use("/admin",adminRoute);
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error", { err });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
