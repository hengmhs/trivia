import React from "react";
import "./App.css";
import Quiz from "./Quiz";
import AuthForm from "./AuthForm";
import LoginForm from "./LoginForm";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import he from "he";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { database } from "./firebase";
import {
  set,
  ref,
  push,
  onChildAdded,
  onValue,
  update,
} from "firebase/database";
import { useParams } from "react-router-dom";

// Objective: Users can join room via the React Router Link, and can increment/decrement counters

const DB_ROOM_KEY = "rooms";

const GameLobby = () => {
  const [displayName, setDisplayName] = useState("None");
  const firstRender = useRef(true);

  const { roomKey } = useParams();
  console.log("Room Key: " + roomKey);
  const currentRoomRef = ref(database, `${DB_ROOM_KEY}/${roomKey}`);

  // componentDidMount
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        setDisplayName(user.displayName);
        console.log(`${user.uid} logged in`);
      } else {
        console.log("No one is logged in");
        // User is signed out
      }
    });
    onValue(currentRoomRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Change in data: ", data);
    });
  }, []);

  const changeData = () => {
    const scoreRef = ref(database, `${DB_ROOM_KEY}/${roomKey}/score`);
    const updates = {};
    updates[`${DB_ROOM_KEY}/${roomKey}/score`] = 1;
    update(ref(database), updates);
  };

  return (
    <div className="App">
      <div>Name: {displayName}</div>
      <button onClick={changeData}>Update Score</button>
    </div>
  );
};

export default GameLobby;
