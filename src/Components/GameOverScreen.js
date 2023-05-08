import React from "react";
import { useEffect } from "react";

const GameOverScreen = (props) => {
  useEffect(() => {
    displayRanking();
  }, [props.isAllGameOver]);

  const displayRanking = () => {
    const scoreArray = [];
    Object.entries(props.scores).map((scoreCard) => {
      // ["uid", [{displayName: str, score: int}]]
      const displayName = scoreCard[1].displayName;
      const score = scoreCard[1].score;
      const winner = false;
      const uid = scoreCard[0];
      scoreArray.push([score, displayName, winner, uid]);
    });
    console.log("unsorted scoreArray: ", scoreArray);
    // sort from highest score to lowest score
    scoreArray.sort((scoreData1, scoreData2) => {
      // scoreData1 = [userScore, displayName, isWinner]
      if (scoreData1[0] > scoreData2[0]) {
        return -1;
      } else if (scoreData1[0] < scoreData2[0]) {
        return 1;
      } else {
        return 0;
      }
    });
    console.log("sorted scoreArray:", scoreArray);
    // reset all scoreData to not winners
    scoreArray.map((scoreData) => {
      scoreData[2] = false;
    });
    // determine winner(s)
    const highestScore = scoreArray[0][0];
    scoreArray.map((scoreData) => {
      if (scoreData[0] === highestScore) {
        scoreData[2] = true;
      }
    });

    return (
      <div>
        <div>Rankings</div>
        {scoreArray.map((scoreData) => {
          return (
            <div key={scoreData[3]}>
              {scoreData[2] && <b> Winner </b>}
              {scoreData[1]} : {scoreData[0]}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <h3>Results</h3>
      <div>{!props.isAllGameOver && <h3>Waiting for other players...</h3>}</div>
      <div>{props.isAllGameOver && <h1>Game Over</h1>}</div>
      {displayRanking()}
    </div>
  );
};

export default GameOverScreen;
