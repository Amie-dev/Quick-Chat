import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../stores/authStore";
import { useConversations } from "../hooks/useConversations";

export type Conversation = {
  conversationId: string;
  friend: User & {
    online: boolean;
  };
  unreadCounts: Record<string, number>;
  lastMessage: {
    content: string;
    timestamp: Date;
  };
};

type ConversationsContextType = {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  isLoading: boolean;
  isError: boolean;
};

const ConversationContext = createContext<ConversationsContextType | undefined>(
  undefined,
);

export const useConversationsContext = () => {
  const context = useContext(ConversationContext);
  if (!context)
    throw new Error(
      "useConversationsContext must be  used within ConversationsProvider",
    );
  return context;
};

export const ConversationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data, isLoading, isError } = useConversations();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (data) setConversations(data?.data);
  }, [data]);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.friend.userName
      .toLocaleLowerCase()
      .includes(searchTerm.toLocaleLowerCase()),
  );

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        filteredConversations,
        searchTerm,
        setSearchTerm,
        isLoading,
        isError,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};
