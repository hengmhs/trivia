import React from "react";
import "../App.css";
import Quiz from "./Quiz";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { database, auth } from "../firebase";
import {
  set,
  ref,
  onValue,
  onDisconnect,
  runTransaction,
} from "firebase/database";
import { useParams } from "react-router-dom";

// Objective: Users can join room via the React Router Link, and can increment/decrement counters

const DB_ROOM_KEY = "rooms";
const DB_SCORE_KEY = "scores";

const GameLobby = () => {
  const [displayName, setDisplayName] = useState("None");
  const [connectedPlayers, setConnectedPlayers] = useState({});
  const [scores, setScores] = useState({ placeholder: 0 });
  const [userUID, setUserUID] = useState("");

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

        // create user id with score card in scores/roomKey
        const scoreRef = ref(
          database,
          `${DB_SCORE_KEY}/${roomKey}/${user.uid}`
        );
        set(scoreRef, {
          displayName: user.displayName,
          score: 0,
        });
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

    // Check for connecting and disconnecting players
    onValue(currentRoomRef, (room) => {
      const roomData = room.val();
      console.log("Change in data: ", roomData);
      setConnectedPlayers(roomData.playerList);
    });

    // Check for changing player scores
    const currentScoreRef = ref(database, `${DB_SCORE_KEY}/${roomKey}`);
    onValue(currentScoreRef, (score) => {
      const scoreData = score.val();
      /* scoreData = {
        uid: {
          displayName: str,
          score: int,
        },
        uid2:  uid: {
          displayName: str,
          score: int,
        },,
      } */
      setScores(scoreData);
      console.log("Change in score data: ", scoreData);
    });
  }, []);

  const increaseScore = () => {
    const userScoreRef = ref(
      database,
      `${DB_SCORE_KEY}/${roomKey}/${userUID}/score`
    );
    runTransaction(userScoreRef, (score) => {
      return score + 1;
    });
  };

  return (
    <div className="App">
      <div>Name: {displayName}</div>
      <h3>Connected Players</h3>
      <div>
        {Object.entries(connectedPlayers).map((player) => {
          // player = ['uid':'displayName']
          return <li key={player[0]}>{player[1]}</li>;
        })}
      </div>
      <div>
        <h3>Scores: </h3>
        <div>
          {Object.entries(scores).map((scoreCard) => {
            // ["uid", [{displayName: str, score: int}]]
            const displayName = scoreCard[1].displayName;
            const score = scoreCard[1].score;
            return (
              <div key={"score" + scoreCard[0]}>
                {displayName} : {score}{" "}
              </div>
            );
          })}
        </div>
      </div>
      <button onClick={increaseScore}>Increase My Score</button>
    </div>
  );
};

export default GameLobby;
