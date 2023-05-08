import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Home from "./Components/Home";
import GameLobby from "./Components/GameLobby";
import InvalidRoom from "./Components/InvalidRoom";
import Enter from "./Components/Enter";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm";
import SessionError from "./Components/SessionError";
import Profile from "./Components/Profile";
import UserPhotoPicker from "./Components/UserPhotoPicker";
import PrivateRoute from "./Components/PrivateRoute";
import UsersList from "./Components/UsersList";
import User from "./Components/User";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  status: {
    danger: "#e53e3e",
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#0971f1",
      darker: "#053e85",
    },
    neutral: {
      main: "#64748B",
      contrastText: "#fff",
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Routes>
          {/* Public routes: */}
          <Route path="/" element={<Enter />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/sessionerror" element={<SessionError />} />
          {/* Private routes: */}
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile/:uid" element={<Profile />} />
            <Route path="/photopicker" element={<UserPhotoPicker />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/users/:id" element={<User />} />
            <Route path="/invalid" element={<InvalidRoom />} />
            <Route path="/room/:roomKey" element={<GameLobby />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
