// components/ChatInterface.tsx
import { useChatSocket } from "@/hooks/useChatSocket";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface Message {
  text: string;
  senderId: string;
  createdAt: string;
}

interface ChatInterfaceProps {
  sellerId: string;
  // buyerId: string;
  dealId: string;
}
//
const ChatInterface: React.FC<ChatInterfaceProps> = ({ sellerId, dealId }) => {
  const CurrentUser = JSON.parse(localStorage?.getItem("user") || "{}");
  const buyerId = CurrentUser?._id;

  const [roomId, setRoomId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState<string>("");
  const [buyersList, setBuyersList] = useState<any[]>([]); // Handle buyer list here
  console.log("🚀 ~ buyersList:", buyersList)

  const joinPayload = useMemo(
    () => ({ sellerId, buyerId, dealId }),
    [sellerId, buyerId, dealId]
  );
  
  const handleReceiveMessage = useCallback((newMessage: Message) => {
    setMessages((prev) => [...prev, newMessage]);
  }, []);
  
  const handleChatJoined = useCallback(
    (roomId: string, chatHistory: Message[]) => {
      setRoomId(roomId);
      setMessages(chatHistory);
    },
    []
  );
  
  const handleBuyerListReceived = useCallback((buyers: any[]) => {
    setBuyersList(buyers);
  }, []);
  
  const { sendMessage } = useChatSocket({
    joinPayload,
    onReceiveMessage: handleReceiveMessage,
    onChatJoined: handleChatJoined,
    onBuyerListReceived: handleBuyerListReceived,
  });

  // const handleSendMessage = () => {
  //   if (!messageText.trim() || !roomId) return;
  //   sendMessage(roomId, sellerId, messageText);
  //   setMessageText("");
  // };

  const handleSendMessage = () => {
    if (!messageText.trim() || !roomId) return;
  
    sendMessage("send_message", {
      roomId,
      senderId: sellerId,
      text: messageText,
    });
  
    setMessageText("");
  };
  
  return (
    <div className="w-full max-w-xl mx-auto mt-6 p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Chat Room</h2>

      {/* {CurrentUser?.role === "seller" && buyersList.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold">🧾 Buyer List:</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {buyersList.map((b, index) => (
              <li key={index}>
                Buyer: {b.buyer.name} | Deal: {b.deal.title} | Room: {b.roomId}
              </li>
            ))}
          </ul>
        </div>
      )} */}

      <div className="h-64 overflow-y-auto border p-2 mb-4 bg-gray-50 rounded">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.senderId === sellerId ? "text-right" : "text-left"
            }`}
          >
            <p className="inline-block bg-blue-100 text-sm px-3 py-1 rounded">
              {msg.text}
            </p>
            <div className="text-xs text-gray-500">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
