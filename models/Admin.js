const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    position: {
      type: String,
      enum: ["head", "manager", "other"],
      default: "other"
    },
    garbages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Garbage"
      }
    ],
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    assignedEmployees: [
      {
        type: Schema.Types.ObjectId,
        ref: "Employee" 
      }
    ],

    address: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
