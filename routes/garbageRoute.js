
const express = require("express");
const garbageRoute = express.Router();
const Garbage = require("../models/Garbage");
const User = require("../models/User");
garbageRoute.get("/:id/conversation", async (req, res) => {
  try {
    const report = await Garbage.findById(req.params.id)
      .populate("user")      
      .populate("assignedTo") 
      .populate("admin");

    if (!report) {
      req.flash("error", "Garbage report not found");
      return res.redirect("/workers/dashboard");
    }
    res.render("garbage/conversation", { report });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/workers/dashboard");
  }
});

module.exports = garbageRoute;
