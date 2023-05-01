import React from "react";
import "../App.css";
import Quiz from "./Quiz";
import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { database, auth } from "../firebase";
import {
  set,
  ref,
  onValue,
  onDisconnect,
  runTransaction,
  child,
  get,
} from "firebase/database";
import { useParams } from "react-router-dom";
import he from "he";
import { useNavigate } from "react-router-dom";

// Objective: Users can join room via the React Router Link, and can increment/decrement counters

const DB_ROOM_KEY = "rooms";
const DB_SCORE_KEY = "scores";
const DB_QUESTIONS_KEY = "questions";

const GameLobby = () => {
  const [displayName, setDisplayName] = useState("None");
  const [connectedPlayers, setConnectedPlayers] = useState({});
  const [scores, setScores] = useState({ placeholder: 0 });
  const [userUID, setUserUID] = useState("");
  const [quizText, setQuizText] = useState("Waiting for Question");
  const [hostUID, setHostUID] = useState("");
  const [currentQuestionData, setCurrentQuestionData] = useState({
    category: "placeholder",
    correct_answer: "placeholder",
    difficulty: "placeholder",
    incorrect_answers: "placeholder",
    question: "placeholder",
    type: "placeholder",
  });
  const [currentOptions, setCurrentOptions] = useState(["A", "B", "C", "D"]);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionList, setQuestionList] = useState([
    {
      category: "placeholder",
      correct_answer: "placeholder",
      difficulty: "placeholder",
      incorrect_answers: ["placeholder", "placeholder", "placeholder"],
      question: "placeholder",
      type: "placeholder",
    },
  ]);
  const firstRender = useRef(true);
  const navigate = useNavigate();

  // get the room key from the URL, params refers to path="/room/:roomKey"
  const { roomKey } = useParams();
  console.log("Room Key: " + roomKey);
  const currentRoomRef = ref(database, `${DB_ROOM_KEY}/${roomKey}`);

  // componentDidMount
  useEffect(() => {
    const dbRef = ref(database, `${DB_ROOM_KEY}`);
    get(dbRef).then((snapshot) => {
      console.log("Does the room exist:", snapshot.child(roomKey).exists());
      if (!snapshot.child(roomKey).exists()) {
        console.log("Room doesnt exist");
        navigate("/invalid");
      } else {
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
    roomName: str,
   } 
   */

        // Get host id
        get(currentRoomRef)
          .then((room) => {
            if (room) {
              console.log(room.val());
              console.log("Host UID: ", room.val().hostUID);
              setHostUID(room.val().hostUID);
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });

        // Check for connecting and disconnecting players
        onValue(currentRoomRef, (room) => {
          const roomData = room.val();
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
        });
      }
    });
  }, []);

  useEffect(() => {
    // if the host disconnects, delete the room and questions

    // check for the existence of hostUID so this doesn't trigger when a user navigates to a room that doesn't exist
    if (hostUID) {
      if (auth.currentUser.uid === hostUID) {
        console.log("You are the host");
        const questionsRef = ref(database, `questions/${roomKey}`);
        onDisconnect(currentRoomRef).remove(currentRoomRef);
        onDisconnect(questionsRef).remove(questionsRef);
      }
    }
  }, [hostUID]);

  const increaseScore = () => {
    const userScoreRef = ref(
      database,
      `${DB_SCORE_KEY}/${roomKey}/${userUID}/score`
    );
    runTransaction(userScoreRef, (score) => {
      return score + 1;
    });
  };

  useEffect(() => {
    loadQuestion(0);
  }, [questionList]);

  useEffect(() => {
    // do not trigger this on the first render so that the currentQuestionIndex starts at 0 when playing the game
    if (firstRender.current) {
      firstRender.current = false;
    } else {
      console.log("Question Index: ", currentQuestionIndex);
      if (currentQuestionIndex < questionList.length) {
        loadQuestion(currentQuestionIndex);
      } else {
        console.log("Game Over, Restarting");
      }
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    // use the he module to decode the HTML response from the API
    setCurrentAnswer(he.decode(currentQuestionData.correct_answer));
    const options = [
      ...currentQuestionData.incorrect_answers,
      currentQuestionData.correct_answer,
    ];
    // Durstenfeld Shuffle from Stack Overflow: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    setCurrentOptions(
      shuffleArray(
        options.map((option) => {
          return he.decode(option);
        })
      )
    );
  }, [currentQuestionData]);

  const loadQuestion = (questionListIndex) => {
    setCurrentQuestionData(questionList[questionListIndex]);
  };

  const getQuestions = () => {
    /*
    axios
      .get("https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple")
      .then((res) => {
        setQuestionList(res.data.results);
        setCurrentQuestionIndex(0);
      });
    */
    const dbRef = ref(database);
    get(child(dbRef, `questions/${roomKey}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          /* snapshot.val() -> Array 
             snapshot.val()[0] = {
              category: str,
              correct_answer: str,
              difficulty: str, (Easy, Medium, Hard)
              incorrect_answers: Array,
              question: str,
              type: str
            }
          */
          setQuestionList(snapshot.val());
          setCurrentQuestionIndex(0);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const submitAnswer = (currentOptionsPosition) => {
    const userAnswer = currentOptions[currentOptionsPosition];
    console.log(userAnswer);
    if (currentQuestionIndex === questionList.length) {
      setQuizText(`Game Over.`);
      return;
    }
    if (currentAnswer === userAnswer) {
      setQuizText(`Correct! ${currentAnswer} was the answer.`);
      increaseScore();
      setCurrentQuestionIndex((currentQuestionIndex) => {
        return currentQuestionIndex + 1;
      });
    } else {
      setQuizText(`Wrong, the correct answer was: ${currentAnswer}`);
      setCurrentQuestionIndex((currentQuestionIndex) => {
        return currentQuestionIndex + 1;
      });
    }
  };

  return (
    <div className="App">
      <div>Name: {displayName}</div>
      <h3>Connected Players</h3>
      <div>Note: When the host disconnects, the room is deleted.</div>
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
        {true && (
          <Quiz
            currentQuestionData={currentQuestionData}
            getQuestions={getQuestions}
            submitAnswer={submitAnswer}
            currentOptions={currentOptions}
            quizText={quizText}
          />
        )}
      </div>
      <button onClick={increaseScore}>Increase My Score</button>
    </div>
  );
};

export default GameLobby;
