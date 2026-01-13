import React from "react";
import { Route, Routes } from "react-router";
import Auth from "./pages/auth/Auth";
import Chat from "./pages/chat/Chat";
import Home from "./pages/Home";
import { Toaster } from "sonner";
import { GuestRoute, PrivateRoute } from "./pages/PageGuards";

const App: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Guest-only routes */}
        <Route element={<GuestRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
        </Route>
        {/* Authenticated-only routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/chat" element={<Chat />} />
        </Route>
      </Routes>

      <Toaster />
    </>
  );
};

export default App;
