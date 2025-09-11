const express = require("express");
const adminRoute = express.Router();
const Admin = require("../models/Admin");
const Garbage = require("../models/Garbage");
const Employee = require("../models/Emplooyee");
const wrapAsync = require("../utils/wrapAsnyc");
const { hashPassword, hashCompare } = require("../utils/password");
const { adminValidationSchema } = require("../Schema");
const { isAdminLoggedIn } = require("../middleware");
adminRoute.get(
  "/dashboard",
  isAdminLoggedIn,
  wrapAsync(async (req, res) => {
    const complaints = await Garbage.find()
      .populate("user", "username") 
      .populate("admin", "name")
      .populate("assignedTo", "name position");
    const employees = await Employee.find();

    res.render("admin/dashboard", {
      complaints,
      employees,
      adminId: req.session.admin.id,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  })
);
adminRoute.get("/signup", (req, res) => {
  res.render("admin/signup");
});
adminRoute.post(
  "/signup",
  wrapAsync(async (req, res) => {
    const { error, value } = adminValidationSchema.validate(req.body.Admin);
    if (error) {
      req.flash("error", error.details.map((d) => d.message).join(", "));
      return res.redirect("/admin/signup");
    }

    const existingAdmin = await Admin.findOne({ email: value.email });
    if (existingAdmin) {
      req.flash("error", "Email already registered");
      return res.redirect("/admin/signup");
    }

    const newAdmin = new Admin({
      ...value,
      password: await hashPassword(value.password),
    });

    await newAdmin.save();
    req.session.admin = { id: newAdmin._id, email: newAdmin.email };
    req.flash("success", "Admin signup successful!");
    res.redirect("/admin/dashboard");
  })
);
adminRoute.get("/login", (req, res) => {
  res.render("admin/login");
});
adminRoute.post(
  "/login",
  wrapAsync(async (req, res) => {
    const { email, password } = req.body.Admin;
    const { error } = adminValidationSchema
      .fork(["name", "address"], (field) => field.optional())
      .validate({ email, password });

    if (error) {
      req.flash("error", error.details.map((d) => d.message).join(", "));
      return res.redirect("/admin/login");
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      req.flash("error", "Admin not found");
      return res.redirect("/admin/login");
    }

    const isCorrect = await hashCompare(password, admin.password);
    if (!isCorrect) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/admin/login");
    }

    req.session.admin = { id: admin._id, email: admin.email };
    req.flash("success", "Logged in successfully!");
    res.redirect("/admin/dashboard");
  })
);
adminRoute.post("/logout", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");

  req.flash("success", "Logged out successfully!");

  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect("/admin/dashboard");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// ------------------------ MARK AS DONE ------------------------
adminRoute.post(
  "/complaints/:id/done",
  isAdminLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const complaint = await Garbage.findById(id);
    if (!complaint) {
      req.flash("error", "Complaint not found");
      return res.redirect("/admin/dashboard");
    }
    complaint.status = "done";
    await complaint.save();
    req.flash("success", "Complaint marked as done!");
    res.redirect("/admin/dashboard");
  })
);

// ------------------------ ASSIGN TO EMPLOYEE ------------------------
adminRoute.post(
  "/complaints/:id/assign",
  isAdminLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { employeeId } = req.body;

    const complaint = await Garbage.findById(id);
    if (!complaint) {
      req.flash("error", "Complaint not found");
      return res.redirect("/admin/dashboard");
    }

    if (complaint.assignedTo) {
      req.flash("error", "This complaint is already assigned to an employee.");
      return res.redirect("/admin/dashboard");
    }

    complaint.assignedTo = employeeId;
    if (complaint.status !== "done") complaint.status = "pending";
    await complaint.save();

    req.flash("success", "Employee assigned successfully!");
    res.redirect("/admin/dashboard");
  })
);

// ------------------------ DELETE COMPLAINT ------------------------
adminRoute.post(
  "/complaints/delete/:id",
  isAdminLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const complaint = await Garbage.findById(id);
    if (!complaint) {
      req.flash("error", "Complaint not found");
      return res.redirect("/admin/dashboard");
    }
    await Garbage.findByIdAndDelete(id);
    req.flash("success", "Complaint deleted successfully!");
    res.redirect("/admin/dashboard");
  })
);

module.exports = adminRoute;
