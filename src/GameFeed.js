import React from "react";
import { useEffect, useState } from "react";
import { database } from "./firebase";
import { set, ref, push, onChildAdded } from "firebase/database";

const GameFeed = (props) => {
  const [openGameList, setOpenGameList] = useState([]);
  useEffect(() => {
    const roomRef = ref(database, props.DB_ROOM_KEY);
    onChildAdded(roomRef, (data) => {
      setOpenGameList((openGameList) => [
        ...openGameList,
        {
          roomName: data.val().roomName,
          gameStarted: false,
          questionData: "placeholder",
          hostUID: data.val().hostUID,
          hostDisplayName: data.val().hostDisplayName,
          playerList: data.val().playerList,
        },
      ]);
    });
  }, []);
  let roomDisplay = openGameList.map((room) => {
    console.log(room.playerList);
    return (
      <div className="room-card">
        <div>
          <b>{room.roomName}</b>
        </div>
        <div>Created by {room.hostDisplayName}</div>
        <div>
          Players:
          <ol>
            {Object.entries(room.playerList).map((player) => {
              // player = ['uid':'displayName']
              return <li>{player[1]}</li>;
            })}
          </ol>
        </div>
        <button>Join</button>
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
