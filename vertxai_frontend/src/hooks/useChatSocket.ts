import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

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
  seller: {
    sellerId: string;
    name: string;
  };
  buyer: {
    buyerId: string;
    name: string;
  };
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
interface ChatSocketOptions {
  joinPayload?: JoinPayload;
  onReceiveMessage?: (newMessage: Message) => void;
  onChatJoined?: (roomId: string, chatHistory: Message[]) => void;
  onBuyerListReceived?: (buyers: BuyerListItem[]) => void;
}

// export const useChatSocket = (
//   joinPayload?: JoinPayload,
//   onReceiveMessage?: (newMessage: Message) => void,
//   onChatJoined?: (roomId: string, chatHistory: Message[]) => void,
//   onBuyerListReceived?: (buyers: BuyerListItem[]) => void
// ) => {

export const useChatSocket = ({
  joinPayload,
  onReceiveMessage,
  onChatJoined,
  onBuyerListReceived,
}: ChatSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_BASE_URL as string, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    console.log('📡 Connecting to socket server...');
    socket.emit('join_chat', joinPayload);
    console.log('📤 join_chat emitted:', joinPayload);

    socket.on('chat_joined', ({ roomId, chatHistory }) => {
      console.log('✅ chat_joined:', { roomId, chatHistory });
      onChatJoined(roomId, chatHistory);
    });

    socket.on('receive_message', (newMessage: Message) => {
      console.log('📩 receive_message:', newMessage);
      onReceiveMessage(newMessage);
    });

    // ✅ Register buyer_list listener first
    console.log('🔁 Registering buyer_list listener...');
    socket.on('buyer_list_response', (data: BuyerListItem[]) => {
      console.log('📋 buyer_list received:######', data);
      if (onBuyerListReceived) {
        onBuyerListReceived(data);
      }
    });

    socket.on('chat_error', (error) => {
      console.error('❌ Chat error:', error.message);
    });

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    console.log("🚀 Current user:", currentUser);

    // ✅ Emit buyer_list only after socket is connected and listener is set
    socket.once('connect', () => {
      if (currentUser?.role === 'seller') {
        socket.emit('buyer_list', { sellerId: currentUser._id });
        console.log('📤 buyer_list emitted for seller:', currentUser._id);
      }
    });

    return () => {
      console.log('🔌 Disconnecting socket...');
      socket.disconnect();
    };
  }, [joinPayload, onReceiveMessage, onChatJoined, onBuyerListReceived]);

  const sendMessage = (roomId: string, senderId: string, text: string) => {
    if (!socketRef.current) return;
    const payload = { roomId, senderId, text };
    console.log('📤 send_message emitted:', payload);
    socketRef.current.emit('send_message', payload);
  };

  return { sendMessage };
};
