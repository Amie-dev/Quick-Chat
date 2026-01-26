import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User } from "../stores/authStore";
import { useConversations } from "../hooks/useConversations";
import { useSocketContext } from "./SocketContext";
import { toast } from "sonner";

export type Conversation = {
  conversationId: string;
  friend: User & { online: boolean };
  unreadCounts: Record<string, number>;
  lastMessage: { content: string; timestamp: Date } | null;
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

type OnlineStatusPayload = {
  friendId: string;
  userName: string;
  online: boolean;
};

type UnreadCountsPayload = {
  conversationId: string;
  unreadCounts: Record<string, number>;
};

export const useConversationsContext = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      "useConversationsContext must be used within ConversationsProvider",
    );
  }
  return context;
};

export const ConversationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data, isLoading, isError } = useConversations();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { socket } = useSocketContext();

  // Update conversations when data changes
  useEffect(() => {
    if (data) setConversations(data.data);
  }, [data]);

  // Handle online/offline status updates
  const handleConversationOnlineStatus = useCallback(
    ({
      friendId,
      userName,
      online,
    }: {
      friendId: string;
      userName: string;
      online: boolean;
    }) => {
      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.friend._id === friendId) {
            if (conversation.friend.online !== online) {
              toast.info(`${userName} is ${online ? "online" : "offline"}`);
            }
            return {
              ...conversation,
              friend: { ...conversation.friend, online },
            };
          }
          return conversation;
        }),
      );
    },
    [],
  );

  // Handle new conversation acceptance
  const handleNewConversations = (conversation: Conversation) => {
    setConversations((prev) => {
      const exists = prev.some(
        (c) => c.conversationId === conversation.conversationId,
      );
      return exists
        ? prev.map((c) =>
            c.conversationId === conversation.conversationId
              ? { ...c, ...conversation }
              : c,
          )
        : [...prev, conversation];
    });
    setSearchTerm(""); // ensure new conversation is visible
    console.log("Added conversation:", conversation);
    toast.success(`You and ${conversation.friend.userName} are now friends`);
  };

  //   useEffect(() => {
  //   console.log("Conversations state updated:", conversations);
  // }, [conversations]);

  // Handle conversation request error
  const handleNewConversationsError = () =>
    toast.error("Unable to add conversation");

  const markAsHandlerRead = ({
    conversationId,
    unreadCounts,
  }: {
    conversationId: string;
    unreadCounts: Record<string, number>;
  }) => {
    console.log(
      "conversation:update-unread-counts",
      conversationId,
      unreadCounts,
    );

    setConversations((prev) => {
      return prev.map((c) => {
        if (c.conversationId === conversationId) {
          return {
            ...c,
            unreadCounts,
          };
        } else {
          return c;
        }
      });
    });
  };

  const errorMarkAsHandlerRead = () =>
    toast.error("conversation:mark-as-read:error");

  // Subscribe to socket events
  useEffect(() => {
    if (!socket) return;

    const onlineHandler = (payload: OnlineStatusPayload) =>
      handleConversationOnlineStatus(payload);

    const acceptHandler = (payload: Conversation) => {
      console.log("Received new conversation:", payload);
      handleNewConversations(payload);
    };

    const markAsHandler = (payload: UnreadCountsPayload) => {
      markAsHandlerRead(payload);
    };

    const errorMarkAsHandler = () => errorMarkAsHandlerRead();

    const errorHandler = () => handleNewConversationsError();

    socket?.on("conversation:online-status", onlineHandler);
    socket?.on("conversation:accept", acceptHandler);
    socket?.on("conversation:update-unread-counts", markAsHandler);
    socket?.on("conversation:mark-as-read:error", errorMarkAsHandler);
    socket?.on("conversation:request:error", errorHandler);

    return () => {
      socket?.off("conversation:online-status", onlineHandler);
      socket?.off("conversation:accept", acceptHandler);
      socket?.off("conversation:request:error", errorHandler);
      socket?.off("conversation:update-unread-counts", markAsHandler);
      socket?.off("conversation:mark-as-read:error", errorMarkAsHandler);
    };
  }, [socket, handleConversationOnlineStatus]);

  // Filter conversations by search term
  const filteredConversations = conversations.filter((conversation) =>
    conversation.friend.userName
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
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
