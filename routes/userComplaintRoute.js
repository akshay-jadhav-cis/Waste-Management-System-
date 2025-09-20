const express = require("express");
const wrapAsync = require("../utils/wrapAsnyc");
const Garbage = require("../models/Garbage");
const { garbageValidationSchema } = require("../Schema");
const { isLoggedIn } = require("../middleware");
const upload = require("../utils/Multer"); 
const User=require("../models/User");
const userComplaintRoute = express.Router();

userComplaintRoute.get("/profile", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.session.user?._id);
  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/");
  }
  res.render("users/myprofile", { currentUser: user });
});
userComplaintRoute.get("/add", isLoggedIn, (req, res) => {
  res.render("garbage/userComplaint", {
    userId: req.session.user?._id || null,
  });
});
userComplaintRoute.post(
  "/add",
  isLoggedIn,
  upload.array("images", 5),
  wrapAsync(async (req, res) => {
    const images = req.files.map(file => file.path);
    const userId = req.session.user?._id;

    const data = {
      ...req.body.Garbage,
      image: images,
      user: userId,
      admin: null,
    };

    const { error, value } = garbageValidationSchema.validate(data);
    if (error) {
      req.flash("error", error.details.map(d => d.message).join(", "));
      return res.redirect("/complaints/user/add");
    }

    await new Garbage(value).save();
    req.flash("success", "Complaint submitted successfully!");
    res.redirect("/history");
  })
);

// DELETE: Complaint (owner or admin)
userComplaintRoute.post(
  "/delete/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const garbage = await Garbage.findById(req.params.id);
    if (!garbage) {
      req.flash("error", "Complaint not found");
      return res.redirect("/history");
    }

    const isOwner = garbage.user?.toString() === req.session.user?._id;
    const isAdmin = Boolean(req.session.admin?._id);

    if (!isOwner && !isAdmin) {
      req.flash("error", "Not authorized to delete this complaint");
      return res.redirect("/history");
    }

    await Garbage.findByIdAndDelete(req.params.id);
    req.flash("success", "Complaint deleted successfully!");
    res.redirect("/history");
  })
);

// GET: My Complaints (only own)
userComplaintRoute.get(
  "/mycomplaints",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const userId = req.session.user._id;
    const complaints = await Garbage.find({ user: userId })
      .populate("assignedTo", "name position")
      .sort({ createdAt: -1 });

    res.render("users/mycomplaint", {
      complaints,
      currentUser: req.session.user,
    });
  })
);

module.exports = userComplaintRoute;
