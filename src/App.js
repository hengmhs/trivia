import React from "react";
import "./App.css";
import NameForm from "./NameForm";
import Quiz from "./Quiz";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import he from "he";

const App = () => {
  const [displayName, setDisplayName] = useState("None");
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
      .get(
        "https://opentdb.com/api.php?amount=5&difficulty=medium&type=multiple"
      )
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
      console.log("Correct!");
      setScore((score) => {
        return score + 1;
      });
      setCurrentQuestionIndex((currentQuestionIndex) => {
        return currentQuestionIndex + 1;
      });
    } else {
      console.log("Wrong!");
      setCurrentQuestionIndex((currentQuestionIndex) => {
        return currentQuestionIndex + 1;
      });
    }
  };
  return (
    <div className="App">
      Trivia Quiz
      <div>Name: {displayName}</div>
      <NameForm setDisplayName={setDisplayName} />
      <div>Score: {score}</div>
      <div>Q: {he.decode(currentQuestionData.question)}</div>
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
