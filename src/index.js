import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Home from "./Home";
import GameLobby from "./GameLobby";
import { BrowserRouter, Routes, Link, Route } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomKey" element={<GameLobby />} />
    </Routes>
  </BrowserRouter>
);
