const express = require("express");
const workerRoute = express.Router();
const Employee = require("../models/Emplooyee");
const Garbage = require("../models/Garbage");
const { hashPassword, hashCompare } = require("../utils/password");
const wrapAsync = require("../utils/wrapAsnyc");
const { validateSchema,isEmployeeLoggedIn } = require("../middleware");
const { employeeValidationSchema, employeeLoginValidationSchema } = require("../Schema");
const wrapAsnyc = require("../utils/wrapAsnyc");

// --------------------- Middleware to check if employee is logged in ---------------------

// --------------------- Dashboard ---------------------
workerRoute.get("/dashboard", isEmployeeLoggedIn, wrapAsync(async (req, res) => {
  const garbageReports = await Garbage.find()
    .populate("user", "username city district state")  // get user info
    .populate("assignedTo", "name")                   // get assigned employee info
    .sort({ createdAt: -1 });                         // newest first

  res.render("workers/dashboard", { 
    garbageReports,
    employeeId: req.session.employee._id // pass employee ID to EJS
  });
}));

// --------------------- Take Complaint ---------------------
workerRoute.post("/employee/take/:id", isEmployeeLoggedIn, wrapAsync(async (req, res) => {
  const report = await Garbage.findById(req.params.id);
  if (!report) {
    req.flash("error", "Complaint not found");
    return res.redirect("/workers/dashboard");
  }

  if (report.assignedTo) {
    req.flash("error", "This complaint is already taken");
    return res.redirect("/workers/dashboard");
  }

  report.assignedTo = req.session.employee._id;
  report.status = "in-progress";
  await report.save();

  req.flash("success", "You have taken the complaint!");
  res.redirect("/workers/dashboard");
}));

// --------------------- Employee Signup ---------------------
workerRoute.get("/employee/signup", (req, res) => {
  res.render("workers/employeeSignup");
});

workerRoute.post("/employee/signup", validateSchema(employeeValidationSchema), wrapAsync(async (req, res) => {
  const { name, age, email, password, dob, address } = req.body.Employee;

  const existingEmployee = await Employee.findOne({ email });
  if (existingEmployee) {
    req.flash("error", "Employee with this email already exists.");
    return res.redirect("/workers/employee/signup");
  }

  const employee = new Employee({
    name,
    age,
    email,
    password: await hashPassword(password),
    dob,
    address,
    joiningDate: new Date()
  });

  await employee.save();
  req.flash("success", "Signup successful! Please login.");
  res.redirect("/workers/employee/login");
}));

// --------------------- Employee Login ---------------------
workerRoute.get("/employee/login", (req, res) => {
  res.render("workers/employeeLogin");
});

workerRoute.post("/employee/login", validateSchema(employeeLoginValidationSchema), wrapAsync(async (req, res) => {
  const { email, password } = req.body;

  const employee = await Employee.findOne({ email });
  if (!employee) {
    req.flash("error", "Employee does not exist.");
    return res.redirect("/workers/employee/login");
  }

  const isMatch = await hashCompare(password, employee.password);
  if (!isMatch) {
    req.flash("error", "Invalid password.");
    return res.redirect("/workers/employee/login");
  }

  req.session.employee = employee;
  req.flash("success", "Login successful!");
  res.redirect("/workers/dashboard");
}));

// --------------------- Employee Logout ---------------------
workerRoute.post("/employee/logout", isEmployeeLoggedIn, (req, res) => {
  req.session.employee = null;
  req.flash("success", "Logged out successfully.");
  res.redirect("/workers/employee/login");
});
workerRoute.get("/employee/mytask",wrapAsnyc(async (req, res) => {
    if (!req.session.employee) {
      req.flash("error", "You must be logged in as an employee to view tasks.");
      return res.redirect("/workers/employee/login");
    }

    const employeeId = req.session.employee._id;
    const tasks = await Garbage.find({ assignedTo: employeeId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.render("workers/mytask", { tasks });
}));
workerRoute.post("/employee/task/:id/done", wrapAsnyc(async (req, res) => {
  const report = await Garbage.findById(req.params.id).populate("assignedTo");

  if (!report) {
    req.flash("error", "Report not found");
    return res.redirect("/workers/dashboard");
  }

  if (!req.session.employee || report.assignedTo._id.toString() !== req.session.employee._id.toString()) {
    req.flash("error", "You are not authorized to complete this task.");
    return res.redirect("/workers/dashboard");
  }

  report.status = "done";
  await report.save();

  req.flash("success", "Task marked as Done ✅");
  res.redirect(`/workers/dashboard`);
}));

module.exports = workerRoute;