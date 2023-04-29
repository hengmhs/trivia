import React from "react";
import he from "he";

const Quiz = (props) => {
  return (
    <div>
      <div>Trivia Quiz</div>
      <div>Q: {he.decode(props.currentQuestionData.question)}</div>
      <button onClick={props.getQuestions}>Get Question</button>
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
  );
};

export default Quiz;
