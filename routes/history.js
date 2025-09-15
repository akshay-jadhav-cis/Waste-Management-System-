const express = require("express");
const history = express.Router();
const Garbage = require("../models/Garbage");
const Employee=require("../models/Emplooyee");
const wrapAsync = require("../utils/wrapAsnyc");
const {isUserOrAdminLoggedIn}=require("../middleware");
history.get(
  "/",isUserOrAdminLoggedIn,
  wrapAsync(async (req, res) => {
    const Garbages = await Garbage.find()
      .populate("user", "username")
      .populate("admin", "name")
      .populate("assignedTo", "name position");
    const employees = await Employee.find();
    res.render("garbage/history", {
      Garbages,employees,
      userId: req.session.user ? req.session.user.id : null,
      adminId: req.session.admin ? req.session.admin.id : null,
    });
  })
);

module.exports = history;
