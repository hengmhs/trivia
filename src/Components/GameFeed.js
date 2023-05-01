import React from "react";
import { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref, onChildAdded } from "firebase/database";
import { useNavigate } from "react-router-dom";

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
        <div>
          <b>{room.roomName}</b>
        </div>
        <div>Created by {room.hostDisplayName}</div>
        <div>
          Players:
          <ol>
            {room.playerList &&
              Object.entries(room.playerList).map((player) => {
                // player = ['uid':'displayName']
                return <li key={player[0]}>{player[1]}</li>;
              })}
          </ol>
        </div>
        <button
          onClick={() => {
            //`/room/${room.key}`
            navigate(`/room/${room.key}`);
          }}
        >
          Join
        </button>
      </div>
    );
  });
  return (
    <div>
      <h1>Game Feed</h1>
      {roomDisplay}
    </div>
  );
};

export default GameFeed;