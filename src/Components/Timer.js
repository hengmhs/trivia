import { useEffect, useRef, useState } from "react";

// Code adapted from https://stackoverflow.com/questions/57137094/implementing-a-countdown-timer-in-react-with-hooks

const Timer = ({ seconds, timeOut, currentQuestionIndex }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [refresh, setRefresh] = useState(true);
  const intervalRef = useRef(); // Add a ref to store the interval id

  // When there is a change to refresh, setInterval is created
  // this allows for a countdown timer every question
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [refresh]);

  // Add a listener to `timeLeft`
  useEffect(() => {
    if (timeLeft <= 0) {
      clearInterval(intervalRef.current);
      console.log("Time is up");
      timeOut();
    }
  }, [timeLeft]);

  // Add listener for currentQuestionIndex
  // When the player goes to the next question, changing refresh calls the useEffect() which creates a new setInterval
  // Time left is reset to the initial time
  useEffect(() => {
    setTimeLeft(seconds);
    setRefresh((state) => {
      return !state;
    });
  }, [currentQuestionIndex]);

  return <div>{timeLeft}s</div>;
};
export default Timer;
