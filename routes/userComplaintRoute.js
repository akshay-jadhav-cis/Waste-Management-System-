const express = require("express");
const multer = require("multer");
const wrapAsync = require("../utils/wrapAsnyc");
const Garbage = require("../models/Garbage");
const { garbageValidationSchema } = require("../Schema");
const { isLoggedIn, isUserOrAdminLoggedIn } = require("../middleware");

const userComplaintRoute = express.Router();

// -------------------- Multer Setup --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// GET: User Complaint Form
userComplaintRoute.get("/add", isLoggedIn, (req, res) => {
  res.render("garbage/userComplaint", {
    userId: req.session.user?._id || null,
  });
});

// POST: Add User Complaint
userComplaintRoute.post(
  "/add",
  isUserOrAdminLoggedIn,
  upload.single("Garbage[image]"),
  wrapAsync(async (req, res) => {
    const userId = req.session.user?._id;
    const data = {
      ...req.body.Garbage,
      image: req.file?.path || null,
      user: userId,      // ✅ Always set for user
      admin: undefined,  // Explicitly undefined
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

// DELETE: Complaint (Owner or Admin)
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

// GET: My Complaints
userComplaintRoute.get(
  "/mycomplaints",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const userId = req.session.user?._id;
    if (!userId) {
      req.flash("error", "You need to log in to view your complaints.");
      return res.redirect("/users/login");
    }

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
