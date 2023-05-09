import React, { useEffect } from "react";
import "../App.css";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";

const GameAlreadyStarted = () => {
  useEffect(() => {
    document.title = "Game Already Started | Quantum Quiz";
  }, []);

  return (
    <div className="App">
      <div className="error-container">
        <h3>Game Started</h3>
        <div>Sorry, the game in that room has already started.</div>
        <div>Try starting a new room instead.</div>
        <div>
          <Link to="/home">
            <Button variant="contained">Return Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameAlreadyStarted;
