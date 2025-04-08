import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import Deal from "../model/deal.model.js";
import Chat from "../model/chat.model.js";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust this in production
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    /* ===== Negotiation Events ===== */

    // Join negotiation room for price negotiations
    socket.on("join_deal_room", ({ dealId }) => {
      const room = `room_deal_${dealId}`;
      socket.join(room);
      console.log(`User joined negotiation room: ${room}`);
    });

    // Handle new price offer
    socket.on("new_offer", async ({ dealId, price, senderId }) => {
      try {
        const deal = await Deal.findById(dealId);
        if (!deal) return;

        // Update deal price and set status to In Progress
        deal.price = price;
        deal.status = "In Progress";
        await deal.save();

        io.to(`room_deal_${dealId}`).emit("offer_updated", {
          dealId,
          price,
          senderId,
        });
      } catch (err) {
        console.error("Error updating deal price:", err.message);
      }
    });

    // Handle offer accepted
    socket.on("offer_accepted", async ({ dealId, senderId }) => {
      try {
        const updatedDeal = await Deal.findByIdAndUpdate(
          dealId,
          { status: "Completed" },
          { new: true }
        );
        io.to(`room_deal_${dealId}`).emit("deal_completed", updatedDeal);
      } catch (err) {
        console.error("Error completing deal:", err.message);
      }
    });

    // Handle offer rejected
    socket.on("offer_rejected", async ({ dealId, senderId }) => {
      try {
        const updatedDeal = await Deal.findByIdAndUpdate(
          dealId,
          { status: "Cancelled" },
          { new: true }
        );
        io.to(`room_deal_${dealId}`).emit("deal_cancelled", updatedDeal);
      } catch (err) {
        console.error("Error cancelling deal:", err.message);
      }
    });

    /* ===== Chat Events ===== */

    // When a user wants to join a chat room
    socket.on("join_chat", async ({ sellerId, buyerId, dealId }) => {
      try {
        // Look for an existing Chat by the combination of seller, buyer, and deal
        let chat = await Chat.findOne({ sellerId, buyerId, dealId });

        if (!chat) {
          // Create a new chat room with a unique roomId if not found
          const roomId = uuidv4();
          chat = new Chat({ roomId, sellerId, buyerId, dealId, messages: [] });
          await chat.save();
          console.log("Created new chat room:", roomId);
        } else {
          console.log("Using existing chat room:", chat.roomId);
        }

        // Join the socket to the chat room
        socket.join(chat.roomId);
        // Emit the chat history for this room
        socket.emit("chat_history", chat.messages);
      } catch (err) {
        console.error("Error joining chat:", err.message);
        socket.emit("chat_error", { message: "Error joining chat room" });
      }
    });

    // When a user sends a message in the chat
    socket.on("send_message", async ({ roomId, text, senderId }) => {
      try {
        // Find the chat room based on roomId
        const chat = await Chat.findOne({ roomId });
        if (!chat) {
          return socket.emit("chat_error", { message: "Chat room not found" });
        }

        const newMessage = { text, senderId, createdAt: new Date() };
        // Push the new message into the messages array
        chat.messages.push(newMessage);
        await chat.save();

        // Broadcast the new message to everyone in the room
        io.to(roomId).emit("new_message", newMessage);
      } catch (err) {
        console.error("Error sending message:", err.message);
        socket.emit("chat_error", { message: "Error sending message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
};
