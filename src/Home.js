import React from "react";
import "./App.css";
import Quiz from "./Quiz";
import AuthForm from "./AuthForm";
import LoginForm from "./LoginForm";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import he from "he";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { database } from "./firebase";
import { set, ref, push, onChildAdded } from "firebase/database";
import GameFeed from "./GameFeed.js";

const DB_ROOM_KEY = "rooms";

const Home = () => {
  const [displayName, setDisplayName] = useState("None");
  const [quizText, setQuizText] = useState("Waiting for Question");
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
  const [score, setScore] = useState(0);
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

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        console.log(user);
        // TODO: displayName is null because onAuthStateChanged is
        // not called after the displayName is updated in AuthForm
        setDisplayName(user.displayName);
        console.log(`${user.uid} logged in`);
      } else {
        console.log("No one is logged in");
        // User is signed out
      }
    });
    const roomRef = ref(database, DB_ROOM_KEY);
    onChildAdded(roomRef, (data) => {
      console.log(data.val().roomName);
    });
  }, []);

  useEffect(() => {
    loadQuestion(0);
  }, [questionList]);

  useEffect(() => {
    // do not trigger this on the first render
    console.log(firstRender);
    if (firstRender.current) {
      firstRender.current = false;
    } else {
      console.log("triggering load question");
      if (currentQuestionIndex < questionList.length - 1) {
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
    console.log(currentQuestionData);
  };
  const getQuestions = () => {
    axios
      .get("https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple")
      .then((res) => {
        setQuestionList(res.data.results);
        setCurrentQuestionIndex(0);
      });
    /*
      res.data.results -> Array
      res.data.results[0] = {
        category: str,
        correct_answer: str,
        difficulty: str, (Easy, Medium, Hard)
        incorrect_answers: Array,
        question: str,
        type: str
      }
      */
  };
  const submitAnswer = (currentOptionsPosition) => {
    const userAnswer = currentOptions[currentOptionsPosition];
    console.log(userAnswer);
    if (currentAnswer === userAnswer) {
      setQuizText("Correct!");
      setScore((score) => {
        return score + 1;
      });
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
  const createRoom = (e) => {
    e.preventDefault();
    const roomName = e.target[0].value;
    console.log(roomName);
    const roomListRef = ref(database, DB_ROOM_KEY);
    const newRoomRef = push(roomListRef);
    console.log(auth.currentUser);
    set(newRoomRef, {
      roomName: roomName,
      gameStarted: false,
      questionData: "placeholder",
      hostUID: auth.currentUser.uid,
      hostDisplayName: auth.currentUser.displayName,
      playerList: { [auth.currentUser.uid]: auth.currentUser.displayName },
      score: 0,
    });
  };
  return (
    <div className="App">
      <div>Name: {displayName}</div>
      {false && (
        <Quiz
          displayName={displayName}
          score={score}
          currentQuestionData={currentQuestionData}
          getQuestions={getQuestions}
          submitAnswer={submitAnswer}
          currentOptions={currentOptions}
          quizText={quizText}
        />
      )}

      <div>
        {true && <AuthForm setDisplayName={setDisplayName} />}
        <LoginForm setDisplayName={setDisplayName} />
      </div>
      <div className="login-info">
        <div>email: user@test.com</div>
        <div>pwd: test123</div>
      </div>
      <h1>Create Room</h1>
      <form onSubmit={createRoom}>
        <div>Room Name:</div>
        <input type="text"></input>
        <input type="submit" value="Create Room"></input>
      </form>
      <GameFeed DB_ROOM_KEY={DB_ROOM_KEY} />
    </div>
  );
};

export default Home;
