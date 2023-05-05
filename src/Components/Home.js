import React from "react";
import "../App.css";
import Navbar from "./Navbar";
import { useEffect } from "react";
import { database, auth } from "../firebase";
import { set, ref, push } from "firebase/database";
import GameFeed from "./GameFeed.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";
import Button from "@mui/material/Button";

const DB_ROOM_KEY = "rooms";
const DB_QUESTIONS_KEY = "questions";

const Home = () => {
  useEffect(() => {
    document.title = "Main | Trivia Game";
  }, []);
  const navigate = useNavigate();

  const createRoom = (e) => {
    e.preventDefault();
    const roomName = e.target[0].value;
    const roomListRef = ref(database, DB_ROOM_KEY);
    const newRoomRef = push(roomListRef);
    set(newRoomRef, {
      roomName: roomName,
      gameStarted: false,
      hostUID: auth.currentUser.uid,
      hostDisplayName: auth.currentUser.displayName,
      playerList: { [auth.currentUser.uid]: auth.currentUser.displayName },
    });
    axios
      .get("https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple")
      .then((res) => {
        const questionsRef = ref(
          database,
          `${DB_QUESTIONS_KEY}/${newRoomRef.key}`
        );
        set(questionsRef, res.data.results);
      })
      .then(() => {
        navigate(`/room/${newRoomRef.key}`);
      });
  };

  return (
    <div className="home-background">
      <div className="App">
        <Navbar />
        <div className="home-content-container">
          <div className="create-room-card">
            <h1>Create Room</h1>
            <form onSubmit={createRoom}>
              <div className="create-room-form">
                <TextField type="text" label="Room Name"></TextField>
                <Button type="submit" variant="contained">
                  Create Room
                </Button>
              </div>
            </form>
          </div>
          <GameFeed DB_ROOM_KEY={DB_ROOM_KEY} />
        </div>
      </div>
    </div>
  );
};

export default Home;
