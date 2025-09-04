const express = require("express");
const userRoute = express.Router();
const User = require("../models/User");
const { hashCompare, hashPassword } = require("../utils/password");
const wrapAsync = require("../utils/wrapAsnyc");
const { userValidationSchema } = require("../Schema");
userRoute.get("/login", (req, res) => {
  res.render("users/login");
});

userRoute.post(
  "/login",
  wrapAsync(async (req, res) => {
    const { username, password } = req.body.User;
    const { error } = userValidationSchema
      .fork(
        ["email", "city", "district", "state", "country"],
        (field) => field.optional()
      )
      .validate({ username, password });
    if (error) {
      req.flash("error", error.details.map((d) => d.message).join(", "));
      return res.redirect("/users/login");
    }
    const user = await User.findOne({ username });
    if (!user) {
      req.flash("error", "User does not exist");
      return res.redirect("/users/login");
    }
    const isCorrect = await hashCompare(password, user.password);
    if (!isCorrect) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/users/login");
    }
    req.session.user = { id: user._id, username: user.username };
    req.flash("success", "You are logged in!");
    res.redirect("/");
  })
);
userRoute.post("/logout", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  req.flash("success", "Logged out successfully");

  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect("/");
    }
    res.clearCookie("connect.sid");
    res.redirect("/users/login");
  });
});
userRoute.get("/signup", (req, res) => {
  res.render("users/signup");
});
userRoute.post(
  "/signup",
  wrapAsync(async (req, res) => {
    const { error, value } = userValidationSchema.validate(req.body.User);
    if (error) {
      req.flash("error", error.details.map((d) => d.message).join(", "));
      return res.redirect("/users/signup");
    }
    const existingUser = await User.findOne({ username: value.username });
    if (existingUser) {
      req.flash("error", "Username already exists");
      return res.redirect("/users/signup");
    }
    const newUser = new User({
      ...value,
      password: await hashPassword(value.password),
    });
    await newUser.save();
    req.flash("success", "Signup successful! Please login.");
    res.redirect("/users/login");
  })
);
module.exports = userRoute;
