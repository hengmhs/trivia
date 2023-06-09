import React from "react";
import he from "he";
import { useState, useEffect, useRef } from "react";
import {
  set,
  ref,
  onValue,
  runTransaction,
  child,
  get,
} from "firebase/database";
import { database } from "../firebase";
import GameOverScreen from "./GameOverScreen.js";
import Timer from "./Timer";
import { Paper } from "@mui/material";
import CorrectAlien from "../images/correct_alien.png";
import WrongAlien from "../images/wrong_alien.png";

const Quiz = (props) => {
  const firstRender = useRef(true);
  const [currentOptions, setCurrentOptions] = useState(["A", "B", "C", "D"]);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [alienImage, setAlienImage] = useState(null);
  const [quizText, setQuizText] = useState("");

  // The game over status for just this single player
  const [isSingleGameOver, setIsSingleGameOver] = useState(false);
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

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [currentQuestionData, setCurrentQuestionData] = useState({
    category: "placeholder",
    correct_answer: "placeholder",
    difficulty: "placeholder",
    incorrect_answers: "placeholder",
    question: "placeholder",
    type: "placeholder",
  });

  const gameOverRef = ref(
    database,
    `${props.DB_GAME_OVER_KEY}/${props.roomKey}/${props.userUID}`
  );
  // when the game starts, load the questions
  useEffect(() => {
    if (props.gameStarted === true) {
      getQuestions();
    }
  }, [props.gameStarted]);

  const getQuestions = () => {
    /*
    The questions have already been loaded into firebase during room creation.
    This function retrieves the data when the game starts.
    */
    const dbRef = ref(database);
    get(child(dbRef, `questions/${props.roomKey}`))
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

  // on first render, load the first question from the question list
  useEffect(() => {
    loadQuestion(0);
  }, [questionList]);

  const loadQuestion = (questionListIndex) => {
    setCurrentQuestionData(questionList[questionListIndex]);
  };

  useEffect(() => {
    // do not trigger this on the first render so that the currentQuestionIndex starts at 0 when playing the game
    if (firstRender.current) {
      firstRender.current = false;
    } else {
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

  const increaseScore = () => {
    const userScoreRef = ref(
      database,
      `${props.DB_SCORE_KEY}/${props.roomKey}/${props.userUID}/score`
    );
    runTransaction(userScoreRef, (score) => {
      return score + 1;
    });
  };

  const submitGameOver = () => {
    set(gameOverRef, {
      gameOver: true,
    });
    setIsSingleGameOver(true);
  };

  const submitAnswer = (currentOptionsPosition) => {
    const userAnswer = currentOptions[currentOptionsPosition];
    if (currentQuestionIndex >= questionList.length - 1) {
      submitGameOver();
      setIsSingleGameOver(true);
    }
    if (currentAnswer === userAnswer) {
      setQuizText(`Correct! ${currentAnswer} was the answer.`);
      setAlienImage(CorrectAlien);
      increaseScore();
      setCurrentQuestionIndex((currentQuestionIndex) => {
        return currentQuestionIndex + 1;
      });
    } else {
      setQuizText(`Wrong, the correct answer was: ${currentAnswer}`);
      setAlienImage(WrongAlien);
      setCurrentQuestionIndex((currentQuestionIndex) => {
        return currentQuestionIndex + 1;
      });
    }
  };

  const timeOut = () => {
    setQuizText(`You ran out of time. ${currentAnswer} was the answer.`);
    setAlienImage(WrongAlien);
    if (currentQuestionIndex >= questionList.length - 1) {
      submitGameOver();
      setIsSingleGameOver(true);
    } else {
      setCurrentQuestionIndex((currentQuestionIndex) => {
        return currentQuestionIndex + 1;
      });
    }
  };

  const allGameOverRef = ref(
    database,
    `${props.DB_GAME_OVER_KEY}/${props.roomKey}`
  );
  onValue(allGameOverRef, (gameOverData) => {
    let allPlayersGameOver = true;
    Object.entries(gameOverData.val()).map((playerGameOver) => {
      // playerGameOver = [userUID, {displayName: str, gameOver: bool}]
      // if any player has gameOver = false, then allPlayersGameOver will be false
      if (!playerGameOver[1].gameOver) {
        allPlayersGameOver = false;
      }
    });
    // this will loop infinitely without !isAllGameOver
    if (allPlayersGameOver && !props.isAllGameOver) {
      props.setIsAllGameOver();
    }
  });

  return (
    <div>
      <h3>Trivia Quiz</h3>
      {!props.gameStarted && (
        <div>
          <div>Waiting for the game to start</div>
        </div>
      )}
      {props.gameStarted && !isSingleGameOver && (
        <div>
          <div>
            Q. {currentQuestionIndex + 1}/{questionList.length}:{" "}
            {he.decode(currentQuestionData.question)}
          </div>
          <div className="quiz-category">
            {currentQuestionData.category} - {currentQuestionData.difficulty}
          </div>
          <div>
            <Paper
              className="option-btn"
              onClick={() => {
                submitAnswer(0);
              }}
            >
              {currentOptions[0]}
            </Paper>
            <Paper
              className="option-btn"
              onClick={() => {
                submitAnswer(1);
              }}
            >
              {currentOptions[1]}
            </Paper>
            <Paper
              className="option-btn"
              onClick={() => {
                submitAnswer(2);
              }}
            >
              {currentOptions[2]}
            </Paper>
            <Paper
              className="option-btn"
              onClick={() => {
                submitAnswer(3);
              }}
            >
              {currentOptions[3]}
            </Paper>
          </div>
        </div>
      )}
      <div>
        {alienImage && <img src={alienImage} alt="Alien" className="alien" />}
      </div>
      <div>{quizText}</div>
      <div>
        {isSingleGameOver && (
          <GameOverScreen
            isAllGameOver={props.isAllGameOver}
            roomKey={props.roomKey}
            scores={props.scores}
          />
        )}
      </div>
      {props.gameStarted && !isSingleGameOver && (
        <Timer
          seconds={60}
          timeOut={() => {
            timeOut();
          }}
          currentQuestionIndex={currentQuestionIndex}
        />
      )}
    </div>
  );
};

export default Quiz;
