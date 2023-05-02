import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Home from "./Components/Home";
import GameLobby from "./Components/GameLobby";
import InvalidRoom from "./Components/InvalidRoom";
import { BrowserRouter, Routes, Link, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/invalid" element={<InvalidRoom />} />
        <Route path="/room/:roomKey" element={<GameLobby />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
