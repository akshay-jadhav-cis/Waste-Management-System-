const express = require("express");
const multer = require("multer");
const wrapAsync = require("../utils/wrapAsnyc");
const Garbage = require("../models/Garbage");
const { garbageValidationSchema } = require("../Schema");
const { isLoggedIn } = require("../middleware");

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
    userId: req.session.user?.id || null,
  });
});

// POST: Submit User Complaint
userComplaintRoute.post(
  "/add",
  isLoggedIn,
  upload.single("Garbage[image]"),
  wrapAsync(async (req, res) => {
    const userId = req.session.user?.id;
    const data = { ...req.body.Garbage, image: req.file?.path || null, user: userId };

    const { error, value } = garbageValidationSchema.validate(data);
    if (error) {
      req.flash("error", error.details.map((d) => d.message).join(", "));
      return res.redirect("/complaints/user/add");
    }

    await new Garbage(value).save();
    req.flash("success", "Complaint submitted successfully!");
    res.redirect("/history");
  })
);

// DELETE: Complaint (Owner OR Admin)
userComplaintRoute.post(
  "/delete/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const garbage = await Garbage.findById(req.params.id);
    if (!garbage) {
      req.flash("error", "Complaint not found");
      return res.redirect("/history");
    }

    const isOwner = garbage.user?.toString() === req.session.user?.id;
    const isAdmin = Boolean(req.session.admin?.id);

    if (!isOwner && !isAdmin) {
      req.flash("error", "Not authorized to delete this complaint");
      return res.redirect("/history");
    }

    await Garbage.findByIdAndDelete(req.params.id);
    req.flash("success", "Complaint deleted successfully!");
    res.redirect("/history");
  })
);

module.exports = userComplaintRoute;
