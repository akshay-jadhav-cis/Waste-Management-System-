const express = require("express");
const conversationRoute = express.Router();
const Message = require("../models/Message");
const Garbage = require("../models/Garbage");
const wrapAsync = require("../utils/wrapAsnyc");

// GET conversation for a specific complaint
conversationRoute.get("/:complaintId", wrapAsync(async (req, res) => {
  const { complaintId } = req.params;

  const garbage = await Garbage.findById(complaintId)
    .populate("user", "name")
    .populate("assignedTo", "name");

  if (!garbage) {
    req.flash("error", "Complaint not found.");
    return res.redirect("back");
  }

  const messages = await Message.find({ conversationId: complaintId })
    .populate("sender", "name")
    .populate("receiver", "name")
    .sort({ createdAt: 1 });

  res.render("garbage/conversation/show", {
    messages,
    garbage,
    currentUser: req.session.user || null,
    currentEmployee: req.session.employee || null,
    conversationId: complaintId,
  });
}));

// POST message for a specific complaint
conversationRoute.post("/:complaintId", wrapAsync(async (req, res) => {
  const { complaintId } = req.params;
  const { content } = req.body;

  const garbage = await Garbage.findById(complaintId);
  if (!garbage) {
    req.flash("error", "Complaint not found.");
    return res.redirect("back");
  }

  const isEmployee = !!req.session.employee;
  const senderId = isEmployee ? req.session.employee._id : req.session.user._id;
  const receiverId = isEmployee ? garbage.user._id : garbage.assignedTo;

  await Message.create({
    conversationId: complaintId, // unique per complaint
    sender: senderId,
    senderModel: isEmployee ? "Employee" : "User",
    receiver: receiverId,
    receiverModel: isEmployee ? "User" : "Employee",
    message: content,
  });

  res.redirect(`/conversation/${complaintId}`);
}));

module.exports = conversationRoute;
