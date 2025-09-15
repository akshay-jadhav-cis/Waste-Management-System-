const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  conversationId: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, refPath: "senderModel", required: true },
  senderModel: { type: String, required: true, enum: ["User", "Employee"] },
  receiver: { type: Schema.Types.ObjectId, refPath: "receiverModel", required: true },
  receiverModel: { type: String, required: true, enum: ["User", "Employee"] },
  message: { type: String, required: true }, // <-- use 'message' everywhere
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);
