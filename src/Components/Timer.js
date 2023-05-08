import { useEffect, useRef, useState } from "react";

// Code from https://stackoverflow.com/questions/57137094/implementing-a-countdown-timer-in-react-with-hooks

const Timer = ({ seconds, timeOut }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [refresh, setRefresh] = useState(true);
  const intervalRef = useRef(); // Add a ref to store the interval id

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
      setTimeLeft(seconds);
      setRefresh((state) => {
        return !state;
      });
    }
  }, [timeLeft]);

  return <div>{timeLeft}s</div>;
};
export default Timer;
