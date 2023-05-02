import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Home from "./Components/Home";
import GameLobby from "./Components/GameLobby";
import InvalidRoom from "./Components/InvalidRoom";
import Enter from "./Components/Enter";
import LoginForm from "./Components/LoginForm";
import { BrowserRouter, Routes, Link, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Enter />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/home" element={<Home />} />
        <Route path="/invalid" element={<InvalidRoom />} />
        <Route path="/room/:roomKey" element={<GameLobby />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
