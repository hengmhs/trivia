import React from "react";

const GameOverScreen = (props) => {
  return (
    <div>
      <h3>Results</h3>
      <div>{!props.isAllGameOver && <h3>Waiting for other players...</h3>}</div>
      <div>{props.isAllGameOver && <h1>Game Over</h1>}</div>
    </div>
  );
};

export default GameOverScreen;
