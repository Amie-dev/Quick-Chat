import React from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import { SocketProvider } from "../../contexts/SocketContext";
import { useConversationStore } from "../../stores/conversationStore";

const Chat: React.FC = () => {
  const { selectedConversation } = useConversationStore();
  return (
    <SocketProvider>
      <div className="min-h-screen flex bg-gray-100">
        <div
          className={`w-full sm:block sm:w-1/3 sm:max-w-114 min-h-screen ${selectedConversation ? "hidden" : "sm:block"}`}
        >
          <Sidebar />
        </div>
        <div
          className={`${selectedConversation ? "flex" : "hidden"} sm:flex flex-1 min-h-screen`}
        >
          <ChatWindow />
        </div>
      </div>
    </SocketProvider>
  );
};

export default Chat;
