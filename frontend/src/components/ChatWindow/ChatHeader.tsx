import type React from "react";
import { EllipsisVertical, X } from "lucide-react";
import { useConversationStore } from "../../stores/conversationStore";

const ChatHeader: React.FC = () => {
    const { selectedConversation, setSelectedConversation } = useConversationStore();

    return <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <img src="https://avatar.iran.liara.run/public" alt="User image" className="size-10 rounded-full object-cover"/>
            <div>
                <h2 className="font-semibold">{selectedConversation?.friend?.userName}</h2>
                <p className={`${selectedConversation?.friend.online ? 'text-sm text-green-500' : 'text-sm text-gray-500'}`}>
                    {selectedConversation?.friend.online ? 'Online' : 'Offline'}
                </p>
            </div>
        </div>
        <div className="flex space-x-4">
            <button className="text-gray-500 hover:text-gray-700 cursor-pointer">
                {/* {} */}
                <EllipsisVertical className="size-4"/>
            </button>
            <button onClick={() => setSelectedConversation(null)} className="sm:hidden text-gray-500 hover:text-gray-700 cursor-pointer">
                {/*  */}
                <X className="size-4"/>
            </button>
        </div>
    </div>
}

export default ChatHeader;