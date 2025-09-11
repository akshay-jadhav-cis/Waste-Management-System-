const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const garbageSchema = new Schema({
  garbageType: {
    type: String,
    enum: ["dry", "water", "mix"],
    required: true,
  },
  description: {
    type: String,
    required: true, // description should be required
  },
  image: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "done"],
    default: "pending",
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  admin: { type: Schema.Types.ObjectId, ref: "Admin" },

  createdAt: { type: Date, default: Date.now },
  assignedTo: { type: Schema.Types.ObjectId, ref: "Employee" },
}, { timestamps: true });

const Garbage = mongoose.model("Garbage", garbageSchema);
module.exports = Garbage;
