
// import { useEffect, useRef } from "react";
// import { io, Socket } from "socket.io-client";

// interface Message {
//   text: string;
//   senderId: string;
//   createdAt: string;
// }

// interface JoinPayload {
//   sellerId: string;
//   buyerId: string;
//   dealId: string;
// }

// interface BuyerListItem {
//   roomId: string;
//   seller: { sellerId: string; name: string };
//   buyer: { buyerId: string; name: string };
//   deal: {
//     _id: string;
//     title: string;
//     description: string;
//     price: number;
//     status: string;
//     sellerId: string;
//     buyerId: string;
//     createdAt: string;
//     updatedAt: string;
//     messages: number;
//     documents: number;
//   };
// }

// interface SingleBuyerItem {
//   seller: { sellerId: string; name: string };
//   deal: {
//     _id: string;
//     title: string;
//     description: string;
//     price: number;
//     status: string;
//     sellerId: string;
//     buyerId: string;
//     createdAt: string;
//     updatedAt: string;
//     documents: number;
//     messages: number;
//   };
//   buyers: {
//     roomId: string;
//     buyerId: string;
//     name: string;
//     email: string;
//   }[];
// }

// interface ChatSocketOptions {
//   joinPayload?: JoinPayload;
//   onReceiveMessage?: (newMessage: Message) => void;
//   onChatOfferDataGet?: (data: any) => void;
//   onChatJoined?: (roomId: string, chatHistory: Message[]) => void;
//   onBuyerListReceived?: (buyers: BuyerListItem[]) => void;
//   onSingleBuyerListReceived?: (data: SingleBuyerItem) => void;
// }

// export const useChatSocket = ({
//   joinPayload,
//   onReceiveMessage,
//   onChatOfferDataGet,
//   onChatJoined,
//   onBuyerListReceived,
//   onSingleBuyerListReceived,
// }: ChatSocketOptions) => {
//   const socketRef = useRef<Socket | null>(null);

//   useEffect(() => {
//     const socket = io(import.meta.env.VITE_WS_BASE_URL as string, {      
//       transports: ["websocket"],
//       path: "/socket.io", // 👈 important!
//       autoConnect: false,
//       timeout: 60000,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 5000,
//     });

//     socketRef.current = socket;
//     const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

//     console.log('📡 Connecting to socket server...');

//     // Listen to all events
//     socket.on('connect', () => {
//       console.log('✅ Socket connected!');

//       if (currentUser?.role === 'seller') {
//         socket.emit('buyer_list', { sellerId: currentUser._id });
//         console.log('📤 buyer_list emitted for seller:', currentUser._id);
//       } else {
//         // Only emit join_chat once connected for buyers
//         if (joinPayload) {
//           socket.emit('join_chat', joinPayload);
//           console.log('📤 join_chat emitted:', joinPayload);
//         }
//       }
//     });

//     socket.on("connect_error", (error) => {console.log("Socket error:", error);});
    
//     socket.on('chat_joined', ({ roomId, chatHistory }) => {
//       console.log('✅ chat_joined received:', { roomId, chatHistory });
//       onChatJoined?.(roomId, chatHistory);
//     });

//     socket.on("receive_message", (newMessage: Message) => {
//       console.log("📩 receive_message:", newMessage);
//       onReceiveMessage?.(newMessage);
//     });
//     socket.on("chat_get_offer_response", (data: any) => {
//       console.log("📩 chat_get_offer_response:", data);
//       onChatOfferDataGet?.(data);
//     });

//     socket.on('buyer_list_response', (data: BuyerListItem[]) => {
//       console.log('📋 buyer_list_response received:', data);
//       onBuyerListReceived?.(data);
//     });

//     socket.on('single_list_response', (data: SingleBuyerItem) => {
//       console.log('📋 single_list_response received:', data);
//       onSingleBuyerListReceived?.(data);
//     });

//     socket.on("chat_error", (error) => {
//       console.error("❌ Chat error:", error.message);
//     });

//     // const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
//     console.log("🚀 Current user:", currentUser);

//     // ✅ Emit buyer_list only after socket is connected and listener is set
//     socket.once("connect", () => {
//       if (currentUser?.role === "seller") {
//         socket.emit("buyer_list", { sellerId: currentUser._id });
//         console.log("📤 buyer_list emitted for seller:", currentUser._id);
//       }
//     });

//     return () => {
//       console.log("🔌 Disconnecting socket...");
//       socket.disconnect();
//     };
//   }, [joinPayload, onReceiveMessage, onChatJoined, onBuyerListReceived, onSingleBuyerListReceived,onChatOfferDataGet]);

//   const sendMessage = (event: string, payload: any) => {
//     if (!socketRef.current) return;
//     console.log(`📤 ${event} emitted:`, payload);
//     socketRef.current.emit(event, payload);
//   };

//   const joinChat = (event: string, payload: any) => {
//     if (!socketRef.current) return;
//     console.log(`📤 ${event} emitted (manual join):`, payload);
//     socketRef.current.emit(event, payload);
//   };
//   const newOffer = (payload: any) => {
//     if (!socketRef.current) return;
//     console.log(`📤 new_offer:`, payload);
//     socketRef.current.emit("new_offer", payload);
//   };
//   const chatGetOffer = (payload: any) => {
//     if (!socketRef.current) return;
//     console.log(`📤 chat_get_offer:`, payload);
//     socketRef.current.emit("chat_get_offer", payload);
//   };

//   return { sendMessage, joinChat, newOffer, chatGetOffer };
// };




// import { useEffect, useRef } from "react";
// import { io, Socket } from "socket.io-client";

// interface Message {
//   text: string;
//   senderId: string;
//   createdAt: string;
// }

// interface JoinPayload {
//   sellerId: string;
//   buyerId: string;
//   dealId: string;
// }

// interface BuyerListItem {
//   roomId: string;
//   seller: { sellerId: string; name: string };
//   buyer: { buyerId: string; name: string };
//   deal: {
//     _id: string;
//     title: string;
//     description: string;
//     price: number;
//     status: string;
//     sellerId: string;
//     buyerId: string;
//     createdAt: string;
//     updatedAt: string;
//     messages: number;
//     documents: number;
//   };
// }

// interface SingleBuyerItem {
//   seller: { sellerId: string; name: string };
//   deal: {
//     _id: string;
//     title: string;
//     description: string;
//     price: number;
//     status: string;
//     sellerId: string;
//     buyerId: string;
//     createdAt: string;
//     updatedAt: string;
//     documents: number;
//     messages: number;
//   };
//   buyers: {
//     roomId: string;
//     buyerId: string;
//     name: string;
//     email: string;
//   }[];
// }

// interface ChatSocketOptions {
//   joinPayload?: JoinPayload;
//   onReceiveMessage?: (newMessage: Message) => void;
//   onChatOfferDataGet?: (data: any) => void;
//   onChatJoined?: (roomId: string, chatHistory: Message[]) => void;
//   onBuyerListReceived?: (buyers: BuyerListItem[]) => void;
//   onSingleBuyerListReceived?: (data: SingleBuyerItem) => void;
// }

// export const useChatSocket = ({
//   joinPayload,
//   onReceiveMessage,
//   onChatOfferDataGet,
//   onChatJoined,
//   onBuyerListReceived,
//   onSingleBuyerListReceived,
// }: ChatSocketOptions) => {
//   const socketRef = useRef<Socket | null>(null);

//   useEffect(() => {
//     const socket = io(import.meta.env.VITE_WS_BASE_URL as string, {      
//       transports: ["websocket"],
//       path: "/socket.io", // 👈 important!
//       autoConnect: false,
//       timeout: 60000,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 5000,
//     });

//     socketRef.current = socket;
//     const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

//     console.log('📡 Connecting to socket server...');

//     // Listen to all events
//     socket.on('connect', () => {
//       console.log('✅ Socket connected!');

//       if (currentUser?.role === 'seller') {
//         socket.emit('buyer_list', { sellerId: currentUser._id });
//         console.log('📤 buyer_list emitted for seller:', currentUser._id);
//       } else {
//         // Only emit join_chat once connected for buyers
//         if (joinPayload) {
//           socket.emit('join_chat', joinPayload);
//           console.log('📤 join_chat emitted:', joinPayload);
//         }
//       }
//     });

//     socket.on("connect_error", (error) => {console.log("Socket error:", error);});
    
//     socket.on('chat_joined', ({ roomId, chatHistory }) => {
//       console.log('✅ chat_joined received:', { roomId, chatHistory });
//       onChatJoined?.(roomId, chatHistory);
//     });

//     socket.on("receive_message", (newMessage: Message) => {
//       console.log("📩 receive_message:", newMessage);
//       onReceiveMessage?.(newMessage);
//     });
//     socket.on("chat_get_offer_response", (data: any) => {
//       console.log("📩 chat_get_offer_response:", data);
//       onChatOfferDataGet?.(data);
//     });

//     socket.on('buyer_list_response', (data: BuyerListItem[]) => {
//       console.log('📋 buyer_list_response received:', data);
//       onBuyerListReceived?.(data);
//     });

//     socket.on('single_list_response', (data: SingleBuyerItem) => {
//       console.log('📋 single_list_response received:', data);
//       onSingleBuyerListReceived?.(data);
//     });

//     socket.on("chat_error", (error) => {
//       console.error("❌ Chat error:", error.message);
//     });

//     // const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
//     console.log("🚀 Current user:", currentUser);

//     // ✅ Emit buyer_list only after socket is connected and listener is set
//     socket.once("connect", () => {
//       if (currentUser?.role === "seller") {
//         socket.emit("buyer_list", { sellerId: currentUser._id });
//         console.log("📤 buyer_list emitted for seller:", currentUser._id);
//       }
//     });

//     return () => {
//       console.log("🔌 Disconnecting socket...");
//       socket.disconnect();
//     };
//   }, [joinPayload, onReceiveMessage, onChatJoined, onBuyerListReceived, onSingleBuyerListReceived,onChatOfferDataGet]);

//   const sendMessage = (event: string, payload: any) => {
//     if (!socketRef.current) return;
//     console.log(`📤 ${event} emitted:`, payload);
//     socketRef.current.emit(event, payload);
//   };

//   const joinChat = (event: string, payload: any) => {
//     if (!socketRef.current) return;
//     console.log(`📤 ${event} emitted (manual join):`, payload);
//     socketRef.current.emit(event, payload);
//   };
//   const newOffer = (payload: any) => {
//     if (!socketRef.current) return;
//     console.log(`📤 new_offer:`, payload);
//     socketRef.current.emit("new_offer", payload);
//   };
//   const chatGetOffer = (payload: any) => {
//     if (!socketRef.current) return;
//     console.log(`📤 chat_get_offer:`, payload);
//     socketRef.current.emit("chat_get_offer", payload);
//   };

//   return { sendMessage, joinChat, newOffer, chatGetOffer };
// };




import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  text: string;
  senderId: string;
  createdAt: string;
}

interface JoinPayload {
  sellerId: string;
  buyerId: string;
  dealId: string;
}

interface BuyerListItem {
  roomId: string;
  seller: { sellerId: string; name: string };
  buyer: { buyerId: string; name: string };
  deal: {
    _id: string;
    title: string;
    description: string;
    price: number;
    status: string;
    sellerId: string;
    buyerId: string;
    createdAt: string;
    updatedAt: string;
    messages: number;
    documents: number;
  };
}

interface SingleBuyerItem {
  seller: { sellerId: string; name: string };
  deal: {
    _id: string;
    title: string;
    description: string;
    price: number;
    status: string;
    sellerId: string;
    buyerId: string;
    createdAt: string;
    updatedAt: string;
    documents: number;
    messages: number;
  };
  buyers: {
    roomId: string;
    buyerId: string;
    name: string;
    email: string;
  }[];
}

interface ChatSocketOptions {
  joinPayload?: JoinPayload;
  onReceiveMessage?: (newMessage: Message) => void;
  onChatOfferDataGet?: (data: any) => void;
  onChatJoined?: (roomId: string, chatHistory: Message[]) => void;
  onBuyerListReceived?: (buyers: BuyerListItem[]) => void;
  onSingleBuyerListReceived?: (data: SingleBuyerItem) => void;
}

export const useChatSocket = ({
  joinPayload,
  onReceiveMessage,
  onChatOfferDataGet,
  onChatJoined,
  onBuyerListReceived,
  onSingleBuyerListReceived,
}: ChatSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_BASE_URL as string, {
      transports: ["websocket"],
    });

    socketRef.current = socket;
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    console.log('📡 Connecting to socket server...');

    // Listen to all events
    socket.on('connect', () => {
      console.log('✅ Socket connected!');

      if (currentUser?.role === 'seller') {
        socket.emit('buyer_list', { sellerId: currentUser._id });
        console.log('📤 buyer_list emitted for seller:', currentUser._id);
      } else {
        // Only emit join_chat once connected for buyers
        if (joinPayload) {
          socket.emit('join_chat', joinPayload);
          console.log('📤 join_chat emitted:', joinPayload);
        }
      }
    });

    socket.on('chat_joined', ({ roomId, chatHistory }) => {
      console.log('✅ chat_joined received:', { roomId, chatHistory });
      onChatJoined?.(roomId, chatHistory);
    });

    socket.on("receive_message", (newMessage: Message) => {
      console.log("📩 receive_message:", newMessage);
      onReceiveMessage?.(newMessage);
    });
    socket.on("chat_get_offer_response", (data: any) => {
      console.log("📩 chat_get_offer_response:", data);
      onChatOfferDataGet?.(data);
    });

    socket.on('buyer_list_response', (data: BuyerListItem[]) => {
      console.log('📋 buyer_list_response received:', data);
      onBuyerListReceived?.(data);
    });

    socket.on('single_list_response', (data: SingleBuyerItem) => {
      console.log('📋 single_list_response received:', data);
      onSingleBuyerListReceived?.(data);
    });

    socket.on("chat_error", (error) => {
      console.error("❌ Chat error:", error.message);
    });

    // const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("🚀 Current user:", currentUser);

    // ✅ Emit buyer_list only after socket is connected and listener is set
    socket.once("connect", () => {
      if (currentUser?.role === "seller") {
        socket.emit("buyer_list", { sellerId: currentUser._id });
        console.log("📤 buyer_list emitted for seller:", currentUser._id);
      }
    });

    return () => {
      console.log("🔌 Disconnecting socket...");
      socket.disconnect();
    };
  }, [joinPayload, onReceiveMessage, onChatJoined, onBuyerListReceived, onSingleBuyerListReceived,onChatOfferDataGet]);

  const sendMessage = (event: string, payload: any) => {
    if (!socketRef.current) return;
    console.log(`📤 ${event} emitted:`, payload);
    socketRef.current.emit(event, payload);
  };

  const joinChat = (event: string, payload: any) => {
    if (!socketRef.current) return;
    console.log(`📤 ${event} emitted (manual join):`, payload);
    socketRef.current.emit(event, payload);
  };
  const newOffer = (payload: any) => {
    if (!socketRef.current) return;
    console.log(`📤 new_offer:`, payload);
    socketRef.current.emit("new_offer", payload);
  };
  const chatGetOffer = (payload: any) => {
    if (!socketRef.current) return;
    console.log(`📤 chat_get_offer:`, payload);
    socketRef.current.emit("chat_get_offer", payload);
  };

  return { sendMessage, joinChat, newOffer, chatGetOffer };
};
