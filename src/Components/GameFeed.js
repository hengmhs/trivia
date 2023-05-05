import React from "react";
import { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref, onChildAdded } from "firebase/database";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

const GameFeed = (props) => {
  const navigate = useNavigate();
  const [openGameList, setOpenGameList] = useState([]);
  useEffect(() => {
    const roomRef = ref(database, props.DB_ROOM_KEY);
    onChildAdded(roomRef, (data) => {
      setOpenGameList((openGameList) => [
        ...openGameList,
        {
          key: data.key,
          roomName: data.val().roomName,
          gameStarted: false,
          hostUID: data.val().hostUID,
          hostDisplayName: data.val().hostDisplayName,
          playerList: data.val().playerList,
        },
      ]);
    });
  }, []);
  let roomDisplay = openGameList.map((room) => {
    return (
      <div className="room-card" key={room.key}>
        <div className="room-card-title">
          <h3>{room.roomName}</h3>
        </div>
        <div>Host: {room.hostDisplayName}</div>
        <div>
          Players: {room.playerList && Object.entries(room.playerList).length}
        </div>
        <Button
          onClick={() => {
            //`/room/${room.key}`
            navigate(`/room/${room.key}`);
          }}
        >
          Join
        </Button>
      </div>
    );
  });
  return (
    <div className="game-feed-container">
      <h1>Game Feed</h1>
      <div className="room-display-container">{roomDisplay}</div>
    </div>
  );
};

export default GameFeed;
