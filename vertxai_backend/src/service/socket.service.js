
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
                      
   socket.on(
     "new_offer",
     async ({ roomId, buyerId, sellerId, dealId, price, status }) => {
       try {
         const chat = await Chat.findOne({
           roomId,
           buyerId,
           sellerId,
           dealId,
         });
         if (!chat) {
           return socket.emit("new_offer_error", {
             message: "Chat not found",
           });
         }

         const offer = {
           dealId,
           buyerId,
           sellerId,
           price,
           status,
           createdAt: new Date(),
         };

         chat.offers.push(offer);
         await chat.save();

         socket.emit("new_offer_response", {
           offer,
           roomId,
         });

         socket.to(roomId).emit("new_offer", {
           offer,
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

    socket.on("get_offer", async ({ dealId, senderId }) => {
      try {
        const deal = await Deal.findById(dealId);
        if (!deal) {
          return socket.emit("offer_error", { message: "Deal not found" });
        }
        io.to(`room_deal_${dealId}`).emit("get_offer", {
          dealId,
          price: deal.price,
          senderId,
          status: deal.status,
          updatedAt: deal.updatedAt,
        });
      } catch (err) {
        console.error("Error in get_offer event:", err.message);
        socket.emit("offer_error", { message: "Error retrieving offer data" });
      }
    });

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
    
    /* ===== Chat & Notification Events ===== */
        // When a user wants to join a chat room
        // socket.on("join_chat", async ({ sellerId, buyerId, dealId }) => {
        //   try {
        //     // Check for an existing Chat document
        //     let chat = await Chat.findOne({ sellerId, buyerId, dealId });
        //     if (!chat) {
        //       const roomId = uuidv4();
        //       chat = new Chat({ roomId, sellerId, buyerId, dealId, messages: [] });
        //       await chat.save();
        //       console.log("Created new chat room:", roomId);
        //     } else {
        //       console.log("Using existing chat room:", chat.roomId);  
        //     }
        //     socket.join(chat.roomId);
        //     socket.emit("chat_joined", {            
        //       roomId: chat.roomId,
        //       chatHistory: chat.messages,
        //     });
        //   } catch (err) {
        //     console.error("Error joining chat:", err.message);
        //     socket.emit("chat_error", { message: "Error joining chat room" });
        //   }
        // });

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


    // socket.on("buyer_list", async ({ sellerId, status }) => {
    //   try {
    //     // Find all chat rooms for the given seller
    //     const chats = await Chat.find({ sellerId });
    //     const groupedChats = {};

    //     // Group chats by dealId and gather buyer/seller info
    //     for (const chat of chats) {
    //       const dealKey = chat.dealId.toString();
    //       if (!groupedChats[dealKey]) {
    //         groupedChats[dealKey] = {
    //           seller: null,
    //           deal: null,
    //           buyers: [],
    //         };
    //       }
    //       // Retrieve buyer details (name and email)
    //       const buyerData = await User.findById(chat.buyerId, "name email");
    //       groupedChats[dealKey].buyers.push({
    //         roomId: chat.roomId,
    //         buyerId: chat.buyerId,
    //         name: buyerData.name,
    //         email: buyerData.email,
    //       });
    //       // Retrieve seller details for this group if not already set
    //       if (!groupedChats[dealKey].seller) {
    //         const sellerData = await User.findById(chat.sellerId, "name");
    //         groupedChats[dealKey].seller = {
    //           sellerId: chat.sellerId,
    //           name: sellerData.name,
    //         };
    //       }
    //     }

    //     // Build the final response array by fetching deal details
    //     const response = [];
    //     for (const dealKey in groupedChats) {
    //       const dealData = await Deal.findById(dealKey);
    //       // If status is provided, filter deals; otherwise, include all.
    //       if (dealData && (!status || dealData.status === status)) {
    //         groupedChats[dealKey].deal = dealData;
    //         response.push({
    //           seller: groupedChats[dealKey].seller,
    //           deal: groupedChats[dealKey].deal,
    //           buyers: groupedChats[dealKey].buyers,
    //         });
    //       }
    //     }
    //     socket.emit("buyer_list_response", response);
    //   } catch (err) {
    //     console.error("Error fetching buyer list:", err.message);
    //     socket.emit("buyer_list_error", {
    //       message: "Error retrieving buyer list",
    //     });
    //   }
    // });

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

    // New Event: Get Chat Offers
    // Expects roomId, buyerId, sellerId, and dealId to retrieve the entire offers array.
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
          const sortedOffers = chat.offers.sort(
            (a, b) => b.createdAt - a.createdAt
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

    // New Event: Update/Add Chat Offer
    // Expects roomId, buyerId, sellerId, dealId, price, and status.
    // If an offer from the same buyer/seller for that deal exists (and is not completed), update it;
    // otherwise, add a new offer. If the new status is "completed", update the corresponding Deal.
    socket.on(
      "update_offer",
      async ({ roomId, buyerId, sellerId, dealId, price, status }) => {
        try {
          const chat = await Chat.findOne({
            roomId,
            buyerId,
            sellerId,
            dealId,
          });
          if (!chat) {
            return socket.emit("update_offer_error", {
              message: "Chat not found",
            });
          }
          // Look for an existing offer from this buyer (and seller) for this deal that is not "completed"
          let offerIndex = chat.offers.findIndex(
            (offer) =>
              offer.buyerId.toString() === buyerId.toString() &&
              offer.sellerId.toString() === sellerId.toString() &&
              offer.dealId.toString() === dealId.toString() &&
              offer.status !== "completed"
          );
          if (offerIndex > -1) {
            // Update the existing offer
            chat.offers[offerIndex].price = price;
            chat.offers[offerIndex].status = status;
            chat.offers[offerIndex].createdAt = new Date();
          } else {
            // Add a new offer
            chat.offers.push({
              dealId,
              buyerId,
              sellerId,
              price,
              status,
              createdAt: new Date(),
            });
          }
          await chat.save();

          // If the new status is "completed", update the main Deal's status as well
          if (status === "completed") {
            const deal = await Deal.findById(dealId);
            if (deal) {
              deal.status = "completed";
              await deal.save();
              io.to(`room_deal_${dealId}`).emit("deal_completed", deal);
            }
          }

          const sortedOffers = chat.offers.sort(
            (a, b) => b.createdAt - a.createdAt
          );
          socket.emit("update_offer_response", {
            offers: sortedOffers,
            roomId,
          });
        } catch (err) {
          console.error("Error in update_offer event:", err.message);
          socket.emit("update_offer_error", {
            message: "Error updating offer",
          });
        }
      }
    );

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
