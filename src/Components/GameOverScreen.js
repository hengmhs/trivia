import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import { Paper } from "@mui/material";

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
            <Paper
              key={scoreData[3]}
              className="game-over-player-card"
              elevation={12}
            >
              <div className="game-over-player-card-name">{scoreData[1]}</div>
              <div className="game-over-medal">
                {scoreData[2] && <div>🏆</div>}
              </div>
              <div className="game-over-player-card-score">{scoreData[0]}</div>
            </Paper>
          );
        })}
        <div>
          <Link to="/home">
            <Button variant="contained">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3>Results</h3>
      <div>{!props.isAllGameOver && <h3>Waiting for other players...</h3>}</div>
      <div>{props.isAllGameOver && <h2>Game Over</h2>}</div>
      {props.isAllGameOver && displayRanking()}
    </div>
  );
};

export default GameOverScreen;
