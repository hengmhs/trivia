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
  onDisconnect,
  remove,
  runTransaction,
} from "firebase/database";
import { useParams } from "react-router-dom";

// Objective: Users can join room via the React Router Link, and can increment/decrement counters

const DB_ROOM_KEY = "rooms";
const DB_SCORE_KEY = "scores";

const GameLobby = () => {
  const [displayName, setDisplayName] = useState("None");
  const [connectedPlayers, setConnectedPlayers] = useState({});
  const [userUID, setUserUID] = useState("");
  const firstRender = useRef(true);

  // get the room key from the URL, params refers to path="/room/:roomKey"
  const { roomKey } = useParams();
  console.log("Room Key: " + roomKey);
  const currentRoomRef = ref(database, `${DB_ROOM_KEY}/${roomKey}`);
  // componentDidMount
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setDisplayName(user.displayName);
        setUserUID(user.uid);

        // create user id in rooms/roomKey/playerList
        const connectedPlayerRef = ref(
          database,
          `${DB_ROOM_KEY}/${roomKey}/playerList/${user.uid}`
        );
        set(connectedPlayerRef, user.displayName);
        onDisconnect(connectedPlayerRef).remove(connectedPlayerRef);

        // create user id with score in scores/roomKey
        const scoreRef = ref(
          database,
          `${DB_SCORE_KEY}/${roomKey}/${user.uid}`
        );
        set(scoreRef, 0);
        onDisconnect(scoreRef).remove(scoreRef);
      } else {
        console.log("No one is logged in");
        // User is signed out
      }
    });

    /*
   room = {
    gameStarted: false,
    hostDisplayName: str,
    hostUID: str,
    playerList: {playerUID: displayName,
                 playerUID2: displayName2},
    questionData: {},
    roomName: str,
    score: int
   } 
   */
    onValue(currentRoomRef, (room) => {
      const roomData = room.val();
      console.log("Change in data: ", roomData);
      setConnectedPlayers(roomData.playerList);
    });
  }, []);

  const increaseScore = () => {
    const userScoreRef = ref(database, `${DB_SCORE_KEY}/${roomKey}/${userUID}`);
    runTransaction(userScoreRef, (score) => {
      return score + 1;
    });
  };

  return (
    <div className="App">
      <div>Name: {displayName}</div>
      <div>Connected Players</div>
      <div>
        {Object.entries(connectedPlayers).map((player) => {
          // player = ['uid':'displayName']
          return <li key={player[0]}>{player[1]}</li>;
        })}
      </div>
      <button onClick={increaseScore}>Increase Score</button>
    </div>
  );
};

export default GameLobby;
