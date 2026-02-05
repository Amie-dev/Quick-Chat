import React from "react";
import { useConversationsContext } from "../../contexts/ConversationsContext";
import ConversationItem from "./ConversationItem";

const Conversations: React.FC = () => {
  const { filteredConversations, isLoading, isError } =
    useConversationsContext();

  // Debug log: will run on every render when filteredConversations changes

  // console.log("filteredConversations updated:", filteredConversations);

  if (isLoading) {
    return (
      <div className="flex flex-1 h-full items-center justify-center">
        <div className="size-10 bg-sky-200 rounded-full animate-bounce"></div>
      </div>
    );
  }

  // if (isError) {
  //   console.log(isError)
  //   return <div className="flex-1 p-4 text-red-500">Something went wrong</div>;
  // }

  if (filteredConversations.length === 0) {
    return <div className="flex-1 p-4 text-gray-500">No conversations yet</div>;
  }

  console.log(
    "Reciving filterconverseations from conveations",
    filteredConversations,
  );

  // Sort conversations by lastMessage timestamp (newest first)
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const aTime = a.lastMessage?.timestamp
      ? new Date(a.lastMessage.timestamp).getTime()
      : 0;
    const bTime = b.lastMessage?.timestamp
      ? new Date(b.lastMessage.timestamp).getTime()
      : 0;
    return bTime - aTime;
  });

  console.log("Rendering sorted conversations:", sortedConversations);

  return (
    <div className="flex-1 overflow-y-auto">
      {sortedConversations.map((conversation) => (
        <ConversationItem key={conversation.conversationId} {...conversation} />
      ))}
    </div>
  );
};

export default Conversations;
