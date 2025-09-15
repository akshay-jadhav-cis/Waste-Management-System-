const express = require("express");
const conversationRoute = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const Employee = require("../models/Emplooyee"); // fixed typo
const Garbage = require("../models/Garbage");
const wrapAsync = require("../utils/wrapAsnyc"); // fixed typo

// GET conversation page
conversationRoute.get("/:userId/:employeeId", wrapAsync(async (req, res) => {
  const { userId, employeeId } = req.params;

  const garbage = await Garbage.findOne({ assignedTo: employeeId, user: userId });
  if (!garbage) {
    req.flash("error", "No conversation exists for this complaint.");
    return res.redirect("back");
  }

  const messages = await Message.find({ conversationId: `${userId}_${employeeId}` })
    .populate({ path: "sender", select: "name" })
    .populate({ path: "receiver", select: "name" })
    .sort({ createdAt: 1 });

  const user = await User.findById(userId);
  const employee = await Employee.findById(employeeId);

  const currentEmployee = req.session.employee || null;
  const currentUser = req.session.user || null;

  res.render("garbage/conversation/show", {
    messages,
    user,
    employee,
    currentEmployee,
    currentUser,
    conversationId: `${userId}_${employeeId}`,
  });
}));

// POST message (fallback for Socket.io)
conversationRoute.post("/:userId/:employeeId", wrapAsync(async (req, res) => {
  const { userId, employeeId } = req.params;
  const { content } = req.body;

  const garbage = await Garbage.findOne({ assignedTo: employeeId, user: userId });
  if (!garbage) {
    req.flash("error", "Cannot send message. No assigned employee for this complaint.");
    return res.redirect("back");
  }

  const isEmployee = !!req.session.employee;
  const senderId = isEmployee ? req.session.employee._id : req.session.user._id;
  const receiverId = isEmployee ? userId : employeeId;

  await Message.create({
    conversationId: `${userId}_${employeeId}`,
    sender: senderId,
    senderModel: isEmployee ? "Employee" : "User",
    receiver: receiverId,
    receiverModel: isEmployee ? "User" : "Employee",
    message: content, // <-- matches schema
  });

  res.redirect(`/conversation/${userId}/${employeeId}`);
}));

module.exports = conversationRoute;
