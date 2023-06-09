import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import QuantumLogo from "../images/QuantumLogo.png";
import Button from "@mui/material/Button";

function Enter() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Enter | Quantum Quiz";
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  });

  return (
    <div className="background">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      <div className="App auth-ctn">
        <div className="auth">
          <div>
            <img src={QuantumLogo} alt="Quantum Quiz Logo" className="logo" />
          </div>
          <h1>Quantum Quiz</h1>
          <div className="enter-btns">
            <Link to="/login">
              <Button variant="contained">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="outlined">Register</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Enter;
