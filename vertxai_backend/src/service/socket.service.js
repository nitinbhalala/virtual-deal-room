import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import Deal from "../model/deal.model.js";
import Chat from "../model/chat.model.js";
import User from "../model/user.model.js"; // Import User model

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust this in production
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    /* ===== Negotiation Events ===== */

    socket.on("join_deal_room", ({ dealId }) => {
      const room = `room_deal_${dealId}`;
      socket.join(room);
      console.log(`User joined negotiation room: ${room}`);
    });

    // New Offer Event - creates a new offer from either buyer or seller
    socket.on(
      "new_offer",
      async ({ roomId, buyerId, sellerId, dealId, price, status }) => {
        try {
          // Find chat using roomId and dealId (buyerId or sellerId can be null based on who is creating the offer)
          const chat = await Chat.findOne({ roomId, dealId });
          if (!chat) {
            return socket.emit("new_offer_error", {
              message: "Chat not found",
            });
          }

          // Create new offer with a unique offerId
          const offer = {
            offerId: uuidv4(),
            dealId,
            buyerId: buyerId ? buyerId : null,
            sellerId: sellerId ? sellerId : null,
            price,
            status: status || "", // Default empty string if not provided
            createdAt: new Date(),
          };
          console.log("🚀 ~ offer:", offer);

          chat.offers.push(offer);
          // Ensure offers are stored in descending order by createdAt
          chat.offers.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          await chat.save();

          socket.emit("new_offer_response", {
            offer,
            roomId,
          });

          socket.to(roomId).emit("new_offer", {
            offer,
            roomId,
          });
          // Sort descending by createdAt before sending
          const sortedOffers = chat.offers.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          socket.emit("chat_get_offer_response", {
            offers: sortedOffers,
            roomId,
          });
        } catch (err) {
          console.error("Error in new_offer event:", err.message);
          socket.emit("new_offer_error", {
            message: "Error submitting new offer",
          });
        }
      }
    );

    // Get Offer Event - retrieve the full list of offers sorted descending by createdAt
    socket.on(
      "chat_get_offer",
      async ({ roomId, buyerId, sellerId, dealId }) => {
        try {
          const chat = await Chat.findOne({
            roomId,
            buyerId,
            sellerId,
            dealId,
          });
          if (!chat) {
            return socket.emit("chat_offer_error", {
              message: "Chat not found",
            });
          }
          // Sort descending by createdAt before sending
          const sortedOffers = chat.offers.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          socket.emit("chat_get_offer_response", {
            offers: sortedOffers,
            roomId,
          });
        } catch (err) {
          console.error("Error fetching chat offers:", err.message);
          socket.emit("chat_offer_error", {
            message: "Error retrieving offers",
          });
        }
      }
    );

    // Update Offer Event - update an existing offer's status by offerId
    socket.on("update_offer", async ({ roomId, offerId, status }) => {
      try {
        const chat = await Chat.findOne({ roomId });
        if (!chat) {
          return socket.emit("update_offer_error", {
            message: "Chat not found",
          });
        }
        // Find the offer index by matching offerId
        const offerIndex = chat.offers.findIndex(
          (offer) => offer.offerId === offerId
        );
        if (offerIndex === -1) {
          return socket.emit("update_offer_error", {
            message: "Offer not found",
          });
        }
        // Update status and refresh the createdAt timestamp
        chat.offers[offerIndex].status = status;
        chat.offers[offerIndex].createdAt = new Date();
        await chat.save();

        // Sort offers in descending order
        chat.offers.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        socket.emit("update_offer_response", {
          offers: chat.offers,
          roomId,
        });
        // Sort descending by createdAt before sending
        const sortedOffers = chat.offers.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        socket.emit("chat_get_offer_response", {
          offers: sortedOffers,
          roomId,
        });
      } catch (err) {
        console.error("Error in update_offer event:", err.message);
        socket.emit("update_offer_error", {
          message: "Error updating offer",
        });
      }
    });

    socket.on("join_chat", async (data) => {
      if (!data || typeof data !== "object") {
        console.error("join_chat received invalid data:", data);
        return socket.emit("chat_error", {
          message: "Invalid data sent to join_chat",
        });
      }

      const { sellerId, buyerId, dealId } = data;

      if (!sellerId || !buyerId || !dealId) {
        console.error("Missing required fields in join_chat:", data);
        return socket.emit("chat_error", {
          message: "Missing sellerId, buyerId, or dealId",
        });
      }

      try {
        let chat = await Chat.findOne({ sellerId, buyerId, dealId });
        if (!chat) {
          const roomId = uuidv4();
          chat = new Chat({ roomId, sellerId, buyerId, dealId, messages: [] });
          await chat.save();
          console.log("Created new chat room:", roomId);
        } else {
          console.log("Using existing chat room:", chat.roomId);
        }

        socket.join(chat.roomId);
        socket.emit("chat_joined", {
          roomId: chat.roomId,
          chatHistory: chat.messages,
        });
      } catch (err) {
        console.error("Error joining chat:", err.message);
        socket.emit("chat_error", { message: "Error joining chat room" });
      }
    });

    socket.on("buyer_list", async ({ sellerId, status }) => {
      try {
        // Find all chat rooms for the given seller
        const chats = await Chat.find({ sellerId });
        const groupedChats = {};

        // Group chats by dealId and gather buyer/seller info
        for (const chat of chats) {
          const dealKey = chat.dealId.toString();
          if (!groupedChats[dealKey]) {
            groupedChats[dealKey] = {
              seller: null,
              deal: null,
              buyers: [],
            };
          }

          // Retrieve buyer details
          const buyerData = await User.findById(chat.buyerId, "name email");
          groupedChats[dealKey].buyers.push({
            roomId: chat.roomId,
            buyerId: chat.buyerId,
            name: buyerData.name,
            email: buyerData.email,
          });

          // Set seller details
          if (!groupedChats[dealKey].seller) {
            const sellerData = await User.findById(chat.sellerId, "name");
            groupedChats[dealKey].seller = {
              sellerId: chat.sellerId,
              name: sellerData.name,
            };
          }
        }

        // Get all deals for this seller
        const allDeals = await Deal.find({ sellerId });

        const response = [];

        for (const deal of allDeals) {
          if (status && deal.status !== status) continue;

          const dealId = deal._id.toString();

          if (groupedChats[dealId]) {
            // Deal has buyers from chat
            groupedChats[dealId].deal = deal;
            response.push({
              seller: groupedChats[dealId].seller,
              deal: groupedChats[dealId].deal,
              buyers: groupedChats[dealId].buyers,
            });
          } else {
            // Deal has no buyers in chat
            const sellerData = await User.findById(sellerId, "name");
            response.push({
              seller: {
                sellerId,
                name: sellerData?.name || "Unknown",
              },
              deal: deal,
              buyers: [],
            });
          }
        }

        socket.emit("buyer_list_response", response);
      } catch (err) {
        console.error("Error fetching buyer list:", err.message);
        socket.emit("buyer_list_error", {
          message: "Error retrieving buyer list",
        });
      }
    });

socket.on("single_buyer_list", async ({ sellerId, dealId, status }) => {
  try {
    // If both dealId and sellerId are provided, return just that matching chat
    if (dealId && sellerId) {
      const chats = await Chat.find({ sellerId, dealId });
      const buyers = [];

      for (const chat of chats) {
        const buyerData = await User.findById(chat.buyerId, "name email");
        buyers.push({
          roomId: chat.roomId,
          buyerId: chat.buyerId,
          name: buyerData.name,
          email: buyerData.email,
        });
      }

      const sellerData = await User.findById(sellerId, "name");
      const deal = await Deal.findById(dealId);

      return socket.emit("single_list_response", [
        {
          seller: {
            sellerId,
            name: sellerData?.name || "Unknown",
          },
          deal,
          buyers,
        },
      ]);
    }

    // === Original Flow ===

    // Find all chat rooms for the given seller
    const chats = await Chat.find({ sellerId });
    const groupedChats = {};

    // Group chats by dealId and gather buyer/seller info
    for (const chat of chats) {
      const dealKey = chat.dealId.toString();
      if (!groupedChats[dealKey]) {
        groupedChats[dealKey] = {
          seller: null,
          deal: null,
          buyers: [],
        };
      }

      // Retrieve buyer details
      const buyerData = await User.findById(chat.buyerId, "name email");
      groupedChats[dealKey].buyers.push({
        roomId: chat.roomId,
        buyerId: chat.buyerId,
        name: buyerData.name,
        email: buyerData.email,
      });

      // Set seller details
      if (!groupedChats[dealKey].seller) {
        const sellerData = await User.findById(chat.sellerId, "name");
        groupedChats[dealKey].seller = {
          sellerId: chat.sellerId,
          name: sellerData.name,
        };
      }
    }

    // Get all deals for this seller
    const allDeals = await Deal.find({ sellerId });

    const response = [];

    for (const deal of allDeals) {
      if (status && deal.status !== status) continue;

      const dealId = deal._id.toString();

      if (groupedChats[dealId]) {
        // Deal has buyers from chat
        groupedChats[dealId].deal = deal;
        response.push({
          seller: groupedChats[dealId].seller,
          deal: groupedChats[dealId].deal,
          buyers: groupedChats[dealId].buyers,
        });
      } else {
        // Deal has no buyers in chat
        const sellerData = await User.findById(sellerId, "name");
        response.push({
          seller: {
            sellerId,
            name: sellerData?.name || "Unknown",
          },
          deal: deal,
          buyers: [],
        });
      }
    }

    socket.emit("buyer_list_response", response);
  } catch (err) {
    console.error("Error fetching buyer list:", err.message);
    socket.emit("buyer_list_error", {
      message: "Error retrieving buyer list",
    });
  }
});


    socket.on("send_message", async ({ roomId, text, senderId }) => {
      try {
        const chat = await Chat.findOne({ roomId });
        if (!chat) {
          return socket.emit("chat_error", { message: "Chat room not found" });
        }
        const newMessage = { text, senderId, createdAt: new Date() };
        chat.messages.push(newMessage);
        await chat.save();
        io.to(roomId).emit("receive_message", newMessage);
      } catch (err) {
        console.error("Error sending message:", err.message);
        socket.emit("chat_error", { message: "Error sending message" });
      }
    });

    // Typing indicator events
    socket.on("typing", ({ roomId, userId }) => {
      socket.to(roomId).emit("user_typing", { userId });
    });
    socket.on("stop_typing", ({ roomId, userId }) => {
      socket.to(roomId).emit("user_stop_typing", { userId });
    });

    // Read receipt event
    socket.on("read_receipt", ({ roomId, messageIds, readerId }) => {
      io.to(roomId).emit("read_receipt_received", { messageIds, readerId });
    });

    socket.on("new_deal", (dealData) => {
      io.emit("deal_notification", dealData);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
};