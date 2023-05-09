import React from "react";
import "../App.css";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import { database, auth } from "../firebase";
import { set, ref, push } from "firebase/database";
import GameFeed from "./GameFeed.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, ToggleButtonGroup, ToggleButton } from "@mui/material";
import Button from "@mui/material/Button";

const DB_ROOM_KEY = "rooms";
const DB_QUESTIONS_KEY = "questions";

const Home = () => {
  const [difficulty, setDifficulty] = useState("easy");
  useEffect(() => {
    document.title = "Home | Quantum Quiz";
  }, []);

  const navigate = useNavigate();

  const handleChange = (event, newDifficulty) => {
    setDifficulty(newDifficulty);
  };

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
      .get(
        `https://opentdb.com/api.php?amount=5&difficulty=${difficulty}&type=multiple`
      )
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
                <ToggleButtonGroup
                  color="secondary"
                  exclusive
                  value={difficulty}
                  onChange={handleChange}
                >
                  <ToggleButton value="easy">Easy</ToggleButton>
                  <ToggleButton value="medium">Medium</ToggleButton>
                  <ToggleButton value="hard">Hard</ToggleButton>
                </ToggleButtonGroup>
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
