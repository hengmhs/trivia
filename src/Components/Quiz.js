import React from "react";
import he from "he";
import { useState, useEffect, useRef } from "react";
import {
  set,
  ref,
  onValue,
  onDisconnect,
  runTransaction,
  child,
  get,
} from "firebase/database";
import { database, auth } from "../firebase";

const Quiz = (props) => {
  const firstRender = useRef(true);
  const [currentOptions, setCurrentOptions] = useState(["A", "B", "C", "D"]);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [quizText, setQuizText] = useState("");
  const [isAllGameOver, setIsAllGameOver] = useState(false);
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
    console.log("Current Answer: ", currentAnswer);
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
  };

  const submitAnswer = (currentOptionsPosition) => {
    const userAnswer = currentOptions[currentOptionsPosition];
    console.log(userAnswer);
    if (currentQuestionIndex >= questionList.length - 1) {
      submitGameOver();
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

  const allGameOverRef = ref(
    database,
    `${props.DB_GAME_OVER_KEY}/${props.roomKey}`
  );
  onValue(allGameOverRef, (gameOverData) => {
    console.log("gameOverData: ", gameOverData.val());
    let allPlayersGameOver = true;
    Object.entries(gameOverData.val()).map((playerGameOver) => {
      // playerGameOver = [userUID, {displayName: str, gameOver: bool}]
      // if any player has gameOver = false, then allPlayersGameOver will be false
      if (!playerGameOver[1].gameOver) {
        allPlayersGameOver = false;
      }
    });
    // this will loop infinitely without !isAllGameOver
    if (allPlayersGameOver && !isAllGameOver) {
      setIsAllGameOver(true);
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
      {props.gameStarted && (
        <div>
          <div>Q: {he.decode(currentQuestionData.question)}</div>
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
      )}
      <div>{quizText}</div>
      <div>{isAllGameOver && <h1>All Game Over</h1>}</div>
    </div>
  );
};

export default Quiz;
