const express = require("express");
const complaint = express.Router();
const multer = require("multer");
const Garbage = require("../models/Garbage");
const wrapAsync = require("../utils/wrapAsnyc");
const { garbageValidationSchema } = require("../Schema");
const isLoggedIn = require("../middleware");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });
complaint.get("/add", isLoggedIn, (req, res) => res.render("garbage/complaint"));
complaint.post(
  "/add",
  isLoggedIn,
  upload.single("Garbage[image]"),
  wrapAsync(async (req, res) => {
    const data = { ...req.body.Garbage, image: req.file?.path || null, user: req.session.user.id };
    const { error, value } = garbageValidationSchema.validate(data);
    if (error) {
      req.flash("error", error.details.map((d) => d.message).join(", "));
      return res.redirect("/complaints/add");
    }
    const newGarbage = new Garbage(value);
    await newGarbage.save();
    req.flash("success", "Complaint submitted successfully!");
    res.redirect("/history");
  })
);
complaint.post(
  "/delete/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const garbage = await Garbage.findById(id);

    if (!garbage) {
      req.flash("error", "Complaint not found");
      return res.redirect("/history");
    }

    if (garbage.user.toString() !== req.session.user.id) {
      req.flash("error", "You can only delete your own complaints");
      return res.redirect("/history");
    }

    await Garbage.findByIdAndDelete(id);
    req.flash("success", "Complaint deleted successfully!");
    res.redirect("/history");
  })
);
module.exports = complaint;
