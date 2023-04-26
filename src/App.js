import React from "react";
import "./App.css";
import NameForm from "./NameForm";
import Quiz from "./Quiz";
import { useState, useEffect } from "react";
import axios from "axios";
import he from "he";

const App = () => {
  const [displayName, setDisplayName] = useState("None");
  const [currentQuestion, setCurrentQuestion] = useState("None");
  const [currentOptions, setCurrentOptions] = useState(["A", "B", "C", "D"]);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [questionList, setQuestionList] = useState([]);
  const getQuestions = () => {
    axios
      .get(
        "https://opentdb.com/api.php?amount=1&category=9&difficulty=medium&type=multiple"
      )
      .then((res) => {
        return res.data.results[0];
      })
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
      .then((data) => {
        /* use the he module to decode the HTML response from the API */
        setCurrentQuestion(he.decode(data.question));
        setCurrentAnswer(he.decode(data.correct_answer));
        const options = [...data.incorrect_answers, data.correct_answer];
        const decodedOptions = options.map((option) => {
          return he.decode(option);
        });
        console.log(options);
        console.log(decodedOptions);
        return decodedOptions;
      })
      .then((decodedOptions) => {
        setCurrentOptions(decodedOptions);
      });
  };
  const submitAnswer = (currentOptionsPosition) => {
    const userAnswer = currentOptions[currentOptionsPosition];
    console.log(userAnswer);
    if (currentAnswer === userAnswer) {
      console.log("Correct!");
      setScore((score) => {
        return score + 1;
      });
    } else {
      console.log("Wrong!");
    }
  };
  return (
    <div className="App">
      Trivia Quiz
      <div>Name: {displayName}</div>
      <NameForm setDisplayName={setDisplayName} />
      <div>Score: {score}</div>
      <div>Q: {currentQuestion}</div>
      <button onClick={getQuestions}>Get Question</button>
      <div>
        <button
          className="option-btn"
          onClick={() => {
            submitAnswer(0);
          }}
        >
          A: {currentOptions[0]}
        </button>
        <button
          className="option-btn"
          onClick={() => {
            submitAnswer(1);
          }}
        >
          B: {currentOptions[1]}
        </button>
        <button
          className="option-btn"
          onClick={() => {
            submitAnswer(2);
          }}
        >
          C: {currentOptions[2]}
        </button>
        <button
          className="option-btn"
          onClick={() => {
            submitAnswer(3);
          }}
        >
          D: {currentOptions[3]}
        </button>
      </div>
    </div>
  );
};

export default App;
