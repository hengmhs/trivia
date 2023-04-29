import React from "react";
import "../App.css";
import AuthForm from "./AuthForm";
import LoginForm from "./LoginForm";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { database, auth } from "../firebase";
import { set, ref, push } from "firebase/database";
import GameFeed from "./GameFeed.js";

const DB_ROOM_KEY = "rooms";

const Home = () => {
  const [displayName, setDisplayName] = useState("None");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setDisplayName(user.displayName);
      } else {
        console.log("No one is logged in");
        // User is signed out
      }
    });
  }, []);

  const createRoom = (e) => {
    e.preventDefault();
    const roomName = e.target[0].value;
    const roomListRef = ref(database, DB_ROOM_KEY);
    const newRoomRef = push(roomListRef);
    set(newRoomRef, {
      roomName: roomName,
      gameStarted: false,
      questionData: "placeholder",
      hostUID: auth.currentUser.uid,
      hostDisplayName: auth.currentUser.displayName,
      playerList: { [auth.currentUser.uid]: auth.currentUser.displayName },
    });
  };
  return (
    <div className="App">
      <div>Name: {displayName}</div>
      <div>
        {true && <AuthForm setDisplayName={setDisplayName} />}
        <LoginForm setDisplayName={setDisplayName} />
      </div>
      <div className="login-info">
        <div>email: user@test.com</div>
        <div>pwd: test123</div>
      </div>
      <div className="login-info">
        <div>email: user2@test.com</div>
        <div>pwd: test123</div>
      </div>
      <h1>Create Room</h1>
      <form onSubmit={createRoom}>
        <div>Room Name:</div>
        <input type="text"></input>
        <input type="submit" value="Create Room"></input>
      </form>
      <GameFeed DB_ROOM_KEY={DB_ROOM_KEY} />
    </div>
  );
};

export default Home;
