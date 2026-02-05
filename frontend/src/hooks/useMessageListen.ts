import { useEffect, type RefObject } from "react";
import { useAuthStore } from "../stores/authStore";
import { useSocketContext } from "../contexts/SocketContext";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Message } from "../services/messageService";

type NewMessagePayload = {
  conversationId: string | undefined | null;
  message: Message;
};

export function useMessageListen(
  conversationId: string | undefined,
  friendId: string | undefined,
  containerRef: RefObject<HTMLDivElement | null>,
) {
  const { user } = useAuthStore();
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();

  const handleNewMessage = (payload: NewMessagePayload) => {
    if (payload.conversationId !== conversationId) return;

    queryClient.setQueryData(
      ["messages", conversationId],
      (
        currentData:
          | InfiniteData<{
              messages: Message[];
              nextCursor?: string;
              hasNext: boolean;
            }>
          | undefined,
      ) => {
        // Guard against missing or malformed data
        if (
          !currentData ||
          !Array.isArray(currentData.pages) ||
          currentData.pages.length === 0
        ) {
          return currentData;
        }

        // Flatten all messages across pages
        const messages = currentData.pages.flatMap((page) => page.messages);

        // Prevent duplicates
        if (messages.some((msg) => msg._id === payload.message._id)) {
          return currentData;
        }

        // Decide which page to append to
        const updatedPages = [...currentData.pages];
        const targetIndex = 0; // if newest messages are in page 0
        // const targetIndex = updatedPages.length - 1; // if newest messages are in the last page

        updatedPages[targetIndex] = {
          ...updatedPages[targetIndex],
          messages: [...updatedPages[targetIndex].messages, payload.message],
        };

        return { ...currentData, pages: updatedPages };
      },
    );
    // Auto-scroll to bottom
    setTimeout(() => {
      if (!containerRef.current) return;
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 0);
  };

  useEffect(() => {
    if (!conversationId || !friendId || !socket) return;

    const handleMessage = (payload: NewMessagePayload) => {
      console.log("conversation:new-message", payload);
      handleNewMessage(payload);
    };

    const handleNewMessageError = (error: { error: string }) =>
      toast.error(error.error);

    socket.on("conversation:new-message", handleMessage);
    socket.on("conversation:new-message:error", handleNewMessageError);

    return () => {
      socket.off("conversation:new-message", handleMessage);
      socket.off("conversation:new-message:error", handleNewMessageError);
    };
  }, [conversationId, friendId, user, socket]);
}
