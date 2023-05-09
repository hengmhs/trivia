import React from "react";
import { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref, onChildAdded, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

const GameFeed = (props) => {
  const navigate = useNavigate();
  const [openGameList, setOpenGameList] = useState([]);
  const roomRef = ref(database, props.DB_ROOM_KEY);
  useEffect(() => {
    onValue(roomRef, (data) => {
      if (data.val() !== null) {
        const roomList = [];
        Object.entries(data.val()).map((roomData) => {
          console.log(roomData);
          roomList.push({
            key: roomData[0],
            roomName: roomData[1].roomName,
            gameStarted: roomData[1].gameStarted,
            hostUID: roomData[1].hostUID,
            hostDisplayName: roomData[1].hostDisplayName,
            playerList: roomData[1].playerList,
          });
        });
        setOpenGameList(roomList);
      } else {
        setOpenGameList([]);
      }
    });
  }, []);

  /*
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
  */

  let roomDisplay = openGameList.map((room) => {
    // do not display games in the list that have already started
    if (room.gameStarted === false) {
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
    }
  });
  return (
    <div className="game-feed-container">
      <h1>Game Feed</h1>
      <div className="room-display-container">{roomDisplay}</div>
    </div>
  );
};

export default GameFeed;
