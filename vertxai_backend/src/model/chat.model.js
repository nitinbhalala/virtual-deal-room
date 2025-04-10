import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const chatSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
    },
    // Store messages as an array of subdocuments
    messages: [
      {
        text: { type: String, required: true },
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    offers: [
      {
        offerId: {
          type: String,
          required: true,
          unique: true,
          default: uuidv4(),
        },
        buyerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        sellerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        price: { type: Number, required: true },
        status: {
          type: String,
          enum: ["reject", "accept", ""], // Default is empty string for no offer yet
          default: "",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;

