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
  get,
  remove,
} from "firebase/database";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Button from "@mui/material/Button";
import { Paper } from "@mui/material";

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
  const [roomName, setRoomName] = useState("placeholder room name");
  const [isAllGameOver, setIsAllGameOver] = useState(null); // The game over status for ALL players
  const navigate = useNavigate();

  // get the room key from the URL, params refers to path="/room/:roomKey"
  const { roomKey } = useParams();
  const currentRoomRef = ref(database, `${DB_ROOM_KEY}/${roomKey}`);
  const questionsRef = ref(database, `${DB_QUESTIONS_KEY}/${roomKey}`);

  useEffect(() => {
    document.title = "Game Room | Quantum Quiz";
  }, []);

  // componentDidMount
  useEffect(() => {
    const dbRef = ref(database, `${DB_ROOM_KEY}`);
    get(dbRef).then((snapshot) => {
      // if the room doesn't exist, navigate user to invalid room error page
      if (!snapshot.child(roomKey).exists()) {
        navigate("/invalid");
      } else {
        console.log("Snapshot RoomKey: ", snapshot.child(roomKey).val());
        if (snapshot.child(roomKey).val().gameStarted === true) {
          navigate("/alreadystarted");
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
                setRoomName(room.val().roomName);
              } else {
                console.log("No data available");
              }
            })
            .catch((error) => {
              console.error(error);
            });
        }
      }
    });
  }, []);

  // returning onValue in a useEffect deletes the onValue listener when the component unmounts
  useEffect(() => {
    // Check for connecting and disconnecting players
    // Check for whether the game has started
    return onValue(currentRoomRef, (room) => {
      console.log("Room Data: ", room);
      if (room.val()) {
        const roomData = room.val();
        setConnectedPlayers(roomData.playerList);
        setGameStarted(roomData.gameStarted);
      } else {
        // when the host has deleted the room:
        // if the game is NOT over and the host has left, navigate to invalid
        // else if the game is over and the host has left, do nothing
        console.log("no room detected");
        if (!isAllGameOver) {
          console.log("isAllGameOver: ", isAllGameOver);
          navigate("/invalid");
        }
      }
    });
  }, []);

  useEffect(() => {
    // Check for changing player scores
    const currentScoreRef = ref(database, `${DB_SCORE_KEY}/${roomKey}`);
    return onValue(currentScoreRef, (score) => {
      // if scores exist, then update them
      // when the host has left and scores don't exist, do not update
      // if the game is over, do not update the scores
      if (score.val() && !isAllGameOver) {
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
        const allScoreRef = ref(database, `${DB_SCORE_KEY}/${roomKey}/`);
        const allGameOver = ref(database, `${DB_GAME_OVER_KEY}/${roomKey}`);
        onDisconnect(currentRoomRef).remove(currentRoomRef);
        onDisconnect(questionsRef).remove(questionsRef);
        onDisconnect(allScoreRef).remove(allScoreRef);
        onDisconnect(allGameOver).remove(allGameOver);
      }
    }
  }, [hostUID]);

  // cleanup database connections
  useEffect(() => {
    return () => {
      get(currentRoomRef).then((room) => {
        if (room && auth.currentUser.uid) {
          // for the host, delete all parent references
          if (room.val().hostUID === auth.currentUser.uid) {
            const allScoreRef = ref(database, `${DB_SCORE_KEY}/${roomKey}/`);
            const allGameOver = ref(database, `${DB_GAME_OVER_KEY}/${roomKey}`);
            remove(currentRoomRef);
            remove(questionsRef);
            remove(allScoreRef);
            remove(allGameOver);
          } else {
            // remove a player from the playerList, scores & gameOver keys when they leave the page
            const connectedPlayerRef = ref(
              database,
              `${DB_ROOM_KEY}/${roomKey}/playerList/${auth.currentUser.uid}`
            );
            remove(connectedPlayerRef);
            const scoreRef = ref(
              database,
              `${DB_SCORE_KEY}/${roomKey}/${auth.currentUser.uid}`
            );
            remove(scoreRef);
            const gameOverRef = ref(
              database,
              `${DB_GAME_OVER_KEY}/${roomKey}/${auth.currentUser.uid}`
            );
            remove(gameOverRef);
          }
        }
      });
    };
  }, []);

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
      <Navbar />
      <div className="game-lobby-room-name">
        <h2>{roomName}</h2>
      </div>
      <div className="game-lobby-container">
        <div>
          <Quiz
            gameStarted={gameStarted}
            roomKey={roomKey}
            DB_SCORE_KEY={DB_SCORE_KEY}
            DB_GAME_OVER_KEY={DB_GAME_OVER_KEY}
            userUID={userUID}
            scores={scores}
            isAllGameOver={isAllGameOver}
            setIsAllGameOver={() => {
              setIsAllGameOver(true);
            }}
          />
          {!gameStarted && (
            <div className="game-lobby-start-btn">
              <Button onClick={startGame} variant="contained">
                Start Game
              </Button>
            </div>
          )}
        </div>

        <div>
          <h3>Connected Players: </h3>
          <i>Note: When the host disconnects, the room is deleted.</i>
          <div>
            {Object.entries(scores).map((scoreCard) => {
              // ["uid", [{displayName: str, score: int}]]
              const displayName = scoreCard[1].displayName;
              const score = scoreCard[1].score;
              return (
                <Paper
                  key={"score" + scoreCard[0]}
                  className="game-lobby-player-card"
                  elevation={12}
                >
                  <div className="game-lobby-player-card-name">
                    {displayName}
                  </div>
                  <div className="game-lobby-player-card-score">{score}</div>
                </Paper>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
