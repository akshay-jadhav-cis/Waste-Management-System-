const express = require("express");
const wrapAsync = require("../utils/wrapAsnyc");
const Garbage = require("../models/Garbage");
const { garbageValidationSchema } = require("../Schema");
const { isLoggedIn } = require("../middleware");
const upload = require("../utils/Multer");
const User = require("../models/User");

const userComplaintRoute = express.Router();

// GET: Profile with complaints populated
userComplaintRoute.get("/profile", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.session.user?.id)
    .populate({
      path: "complaints",
      populate: { path: "assignedTo", select: "name position" },
      options: { sort: { createdAt: -1 } }
    });

  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/");
  }

  res.render("users/mypofile", { currentUser: user });
});

// GET: Add Complaint form
userComplaintRoute.get("/add", isLoggedIn, (req, res) => {
  res.render("garbage/userComplaint", {
    userId: req.session.user?._id || null,
  });
});

// POST: Add Complaint
userComplaintRoute.post(
  "/add",
  isLoggedIn,
  upload.array("images", 5),
  wrapAsync(async (req, res) => {
    const images = req.files?.length ? req.files.map(file => file.path) : [];
    const userId = req.session.user?.id;

    const data = {
      ...req.body.Garbage,
      image: images,
      user: userId,
      // admin: null,
    };

    const { error, value } = garbageValidationSchema.validate(data);
    if (error) {
      req.flash("error", error.details.map(d => d.message).join(", "));
      return res.redirect("/complaints/user/add");
    }

    const complaint = new Garbage(value);
    await complaint.save();
    console.log("User ID from session:", req.session.user);

    await User.findByIdAndUpdate(
  userId,
  { $push: { complaints: complaint._id } },
  { new: true, useFindAndModify: false }
);


    req.flash("success", "Complaint submitted successfully!");
    res.redirect("/history");
  })
);

userComplaintRoute.post(
  "/delete/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const complaintId = req.params.id;
    const garbage = await Garbage.findById(complaintId);

    if (!garbage) {
      req.flash("error", "Complaint not found");
      return res.redirect("/history");
    }

    const isOwner = garbage.user?.toString() === req.session.user?.id;
    const isAdmin = Boolean(req.session.admin?._id);

    if (!isOwner && !isAdmin) {
      req.flash("error", "Not authorized to delete this complaint");
      return res.redirect("/history");
    }

    // Delete complaint
    await Garbage.findByIdAndDelete(complaintId);

    // Remove complaint reference from user's complaints array
    if (garbage.user) {
      await User.findByIdAndUpdate(garbage.user, {
        $pull: { complaints: complaintId },
      });
    }

    req.flash("success", "Complaint deleted successfully!");
    res.redirect("/history");
  })
);
userComplaintRoute.get(
  "/mycomplaints",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const userId = req.session.user.id;

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
