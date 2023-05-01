import React from "react";
import he from "he";

const Quiz = (props) => {
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
          <div>Q: {he.decode(props.currentQuestionData.question)}</div>
          <div>
            <button
              className="option-btn"
              onClick={() => {
                props.submitAnswer(0);
              }}
            >
              A: {props.currentOptions[0]}
            </button>
            <button
              className="option-btn"
              onClick={() => {
                props.submitAnswer(1);
              }}
            >
              B: {props.currentOptions[1]}
            </button>
            <button
              className="option-btn"
              onClick={() => {
                props.submitAnswer(2);
              }}
            >
              C: {props.currentOptions[2]}
            </button>
            <button
              className="option-btn"
              onClick={() => {
                props.submitAnswer(3);
              }}
            >
              D: {props.currentOptions[3]}
            </button>
          </div>
          <div>{props.quizText}</div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
