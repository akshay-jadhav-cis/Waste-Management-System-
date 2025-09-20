const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const garbageSchema = new Schema(
  {
    garbageType: {
      type: String,
      enum: ["dry", "water", "mix"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: [
      {
        type: String, 
        required: true,
      },
    ],
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "done"],
      default: "pending",
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    admin: { type: Schema.Types.ObjectId, ref: "Admin" },
    conversationId: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: "Employee", default: null },
  },
  { timestamps: true }
);

const Garbage = mongoose.model("Garbage", garbageSchema);
module.exports = Garbage;
