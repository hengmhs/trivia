import React from "react";

const Quiz = (props) => {
  return (
    <div>
      <div>Question</div>
      <div>{props.questionData}</div>
      <div></div>
    </div>
  );
};

export default Quiz;
