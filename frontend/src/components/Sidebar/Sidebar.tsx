import React from "react";
import Header from "./Header";
import SearchBar from "./SearchBar";
import Conversations from "./Conversations";
import UserProfile from "./UserProfile";
import { ConversationsProvider } from "../../contexts/ConversationsContext";

const Sidebar: React.FC = () => {
  return (
    <div className="min-h-screen bg-white border-r border-gray-200 flex flex-col justify-betwen">
      <Header />
      <ConversationsProvider>
        <SearchBar />
        <Conversations />
      </ConversationsProvider>

      <UserProfile />
    </div>
  );
};

export default Sidebar;
