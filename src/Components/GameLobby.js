import React from "react";
import "../App.css";
import Quiz from "./Quiz";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { database, auth } from "../firebase";
import { set, ref, onValue, onDisconnect, get } from "firebase/database";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Objective: Users can join room via the React Router Link, and can increment/decrement counters

const DB_ROOM_KEY = "rooms";
const DB_SCORE_KEY = "scores";
const DB_QUESTIONS_KEY = "questions";
const DB_GAME_OVER_KEY = "gameOver";

const GameLobby = () => {
  const [displayName, setDisplayName] = useState("None");
  const [connectedPlayers, setConnectedPlayers] = useState({});
  const [scores, setScores] = useState({ placeholder: 0 });
  const [userUID, setUserUID] = useState("");
  const [hostUID, setHostUID] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();

  // get the room key from the URL, params refers to path="/room/:roomKey"
  const { roomKey } = useParams();
  console.log("Room Key: " + roomKey);
  const currentRoomRef = ref(database, `${DB_ROOM_KEY}/${roomKey}`);

  // componentDidMount
  useEffect(() => {
    const dbRef = ref(database, `${DB_ROOM_KEY}`);
    get(dbRef).then((snapshot) => {
      // if the room doesn't exist, navigate user to invalid room error page
      if (!snapshot.child(roomKey).exists()) {
        navigate("/invalid");
      } else {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            // TODO: replace with Auth
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

            // create user id in gameOver/roomKey
            const gameOverRef = ref(
              database,
              `${DB_GAME_OVER_KEY}/${roomKey}/${user.uid}`
            );
            set(gameOverRef, {
              displayName: user.displayName,
              gameOver: false,
            });
            onDisconnect(gameOverRef).remove(gameOverRef);
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
    roomName: str,
   } 
   */

        // Get host id
        get(currentRoomRef)
          .then((room) => {
            if (room) {
              setHostUID(room.val().hostUID);
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });

        // Check for connecting and disconnecting players
        // Check for whether the game has started
        onValue(currentRoomRef, (room) => {
          const roomData = room.val();
          setConnectedPlayers(roomData.playerList);
          setGameStarted(roomData.gameStarted);
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
        });
      }
    });
  }, []);

  useEffect(() => {
    // checks if the current user is the host
    // if the host disconnects, delete the room and questions
    // check for the existence of hostUID so this doesn't trigger when a user navigates to a room that doesn't exist
    // (nonexistent rooms have no hostuid)
    if (hostUID) {
      if (auth.currentUser.uid === hostUID) {
        console.log("You are the host");
        const questionsRef = ref(database, `${DB_QUESTIONS_KEY}/${roomKey}`);
        onDisconnect(currentRoomRef).remove(currentRoomRef);
        onDisconnect(questionsRef).remove(questionsRef);
      }
    }
  }, [hostUID]);

  const startGame = () => {
    const gameStartedRef = ref(
      database,
      `${DB_ROOM_KEY}/${roomKey}/gameStarted`
    );
    // set gameStarted in firebase
    set(gameStartedRef, true);
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
        <i>Note: When the host disconnects, the room is deleted.</i>
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
        <Quiz
          gameStarted={gameStarted}
          roomKey={roomKey}
          DB_SCORE_KEY={DB_SCORE_KEY}
          DB_GAME_OVER_KEY={DB_GAME_OVER_KEY}
          userUID={userUID}
        />
      </div>
      {!gameStarted && <button onClick={startGame}>Start Game</button>}
    </div>
  );
};

export default GameLobby;
