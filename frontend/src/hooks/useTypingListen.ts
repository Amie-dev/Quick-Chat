import { useEffect, useState, type RefObject } from "react";
import { useSocketContext } from "../contexts/SocketContext";


const isNearBootom=(containerRef: RefObject<HTMLDivElement | null>)=>{
    if(!containerRef.current)return false;

    const {scrollTop,scrollHeight,clientHeight}=containerRef.current
    return scrollTop+clientHeight>=scrollHeight-100;
}



export function useTypingListen(
  friendId: string | undefined,
  containerRef: RefObject<HTMLDivElement | null>,
) {
  const { socket } = useSocketContext();
  const [isTyping, setIsTyping] = useState(false);


  const handleTypingNew=(payload:{userId:string,isTyping:boolean})=>{
    setIsTyping(payload.isTyping);
    const wasNearBottom=isNearBootom(containerRef);

    if (payload.isTyping && wasNearBottom) {
        setTimeout(() => {
            if(!containerRef.current) return;

            containerRef.current.scrollTo({
                top:containerRef.current.scrollHeight,
                behavior:"smooth"
            })
        }, 0);
    }
  }

  useEffect(() => {
    if (!socket || !friendId) return;


    const handleTyping=(payload:{userId:string,isTyping:boolean})=>{
        console.log("conversation:update-typing")
        handleTypingNew(payload)
    }


    socket?.on("conversation:update-typing", handleTyping);

    return () => {
      socket?.off("conversation:update-typing", handleTyping);
    };
  }, [socket, friendId, containerRef]);

  return {
    isTyping,
  };
}
