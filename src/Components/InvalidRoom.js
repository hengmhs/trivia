import React, { useEffect } from "react";
import "../App.css";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import InvalidAlien from "../images/invalid_alien.png";

const InvalidRoom = () => {
  useEffect(() => {
    document.title = "Invalid Room | Quantum Quiz";
  }, []);

  return (
    <div className="App">
      <div className="error-container">
        <h3>Invalid Room</h3>
        <div>
          <img src={InvalidAlien} alt="Alien" className="invalid-alien" />
        </div>

        <div>Sorry, that room doesn't exist.</div>
        <div>
          You may have entered the wrong room code or the host may have deleted
          the room.
        </div>
        <div>
          <Link to="/home">
            <Button variant="contained">Return Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InvalidRoom;
