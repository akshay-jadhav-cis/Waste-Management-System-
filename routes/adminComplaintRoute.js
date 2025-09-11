const express = require("express");
const multer = require("multer");
const wrapAsync = require("../utils/wrapAsnyc");
const Garbage = require("../models/Garbage");
const Admin = require("../models/Admin");
const { garbageValidationSchema } = require("../Schema");
const { isAdminLoggedIn } = require("../middleware");

const adminComplaintRoute = express.Router();

// -------------------- Multer Setup --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// GET: Admin Complaint Form
adminComplaintRoute.get("/add", isAdminLoggedIn, (req, res) => {
  res.render("garbage/adminComplaint", {
    adminId: req.session.admin?.id || null,
  });
});

// POST: Submit Admin Complaint
adminComplaintRoute.post(
  "/add",
  isAdminLoggedIn,
  upload.single("Garbage[image]"),
  wrapAsync(async (req, res) => {
    const adminId = req.session.admin?.id;
    const data = { ...req.body.Garbage, image: req.file?.path || null, admin: adminId };

    const { error, value } = garbageValidationSchema.validate(data);
    if (error) {
      req.flash("error", error.details.map((d) => d.message).join(", "));
      return res.redirect("/complaints/admin/add");
    }

    const newGarbage = await new Garbage(value).save();

    // Link complaint to Admin's garbages array
    await Admin.findByIdAndUpdate(adminId, { $push: { garbages: newGarbage._id } });

    req.flash("success", "Complaint submitted successfully!");
    res.redirect("/admin/dashboard");
  })
);
adminComplaintRoute.post(
  "/delete/:id",
  isAdminLoggedIn,
  wrapAsync(async (req, res) => {
    const garbage = await Garbage.findById(req.params.id);
    if (!garbage) {
      req.flash("error", "Complaint not found");
      return res.redirect("/admin/dashboard");
    }

    await Garbage.findByIdAndDelete(req.params.id);
    if (garbage.admin) {
      await Admin.findByIdAndUpdate(garbage.admin, { $pull: { garbages: garbage._id } });
    }

    req.flash("success", "Complaint deleted successfully!");
    res.redirect("/admin/dashboard");
  })
);
adminComplaintRoute.post(
  "/done/:id",
  isAdminLoggedIn,
  wrapAsync(async (req, res) => {
    const garbage = await Garbage.findById(req.params.id);
    if (!garbage) {
      req.flash("error", "Complaint not found");
      return res.redirect("/admin/dashboard");
    }

    garbage.status = "Done";
    await garbage.save();

    req.flash("success", "Complaint marked as done!");
    res.redirect("/admin/dashboard");
  })
);

module.exports = adminComplaintRoute;
